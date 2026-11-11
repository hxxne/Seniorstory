import { useSyncExternalStore } from 'react'
import { getProgram } from '../data/programs'
import { now, setClockOffset } from './clock'
import { applyShared, getState, idleSession, onLocalChange, pickShared, setRoom, subscribe, type Session, type Shared } from './store'

/**
 * 서로 다른 기기(TV, 태블릿, 사무실 PC)를 연결 코드 하나로 묶습니다.
 *
 * 같은 브라우저의 창끼리는 store.ts의 BroadcastChannel로 이미 이어져 있고,
 * 여기서는 그 상태 중 함께 쓰는 부분(세션, 출석)만 Firebase Realtime Database에 올려
 * 다른 기기와 맞춥니다. SDK 없이 REST와 EventSource만 씁니다.
 *
 *   rooms/{코드}/state    함께 쓰는 상태
 *   rooms/{코드}/devices  지금 켜져 있는 기기 (20초마다 갱신)
 */

/** 실시간 데이터베이스 주소. 비어 있으면 기기 간 연결 기능이 꺼집니다 */
const DEFAULT_URL = 'https://medimove-9725f-default-rtdb.asia-southeast1.firebasedatabase.app'
const SYNC_URL = ((import.meta.env.VITE_SYNC_URL as string | undefined) || DEFAULT_URL).replace(/\/+$/, '')
export const syncReady = SYNC_URL !== ''

type Json = null | boolean | number | string | { [k: string]: Json }
type Obj = { [k: string]: Json }
type Role = 'tv' | 'tablet' | 'dashboard'

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

/* ---------- 화면에 보여 줄 연결 상태 ---------- */

export interface SyncStatus {
  room: string | null
  /** off: 연결 안 함, connecting: 연결 중, on: 연결됨, lost: 끊겨서 다시 시도 중 */
  link: 'off' | 'connecting' | 'on' | 'lost'
  /** 같은 코드로 켜져 있는 다른 TV가 있는지 */
  tv: boolean
  /** 같은 코드로 켜져 있는 다른 태블릿·PC가 있는지 */
  controller: boolean
}

let status: SyncStatus = { room: null, link: 'off', tv: false, controller: false }
const watchers = new Set<() => void>()

function setStatus(patch: Partial<SyncStatus>) {
  const next = { ...status, ...patch }
  if (next.room === status.room && next.link === status.link && next.tv === status.tv && next.controller === status.controller) return
  status = next
  for (const w of watchers) w()
}

const watch = (w: () => void) => {
  watchers.add(w)
  return () => {
    watchers.delete(w)
  }
}

export const useSync = () => useSyncExternalStore(watch, () => status, () => status)

/* ---------- 이 기기 ---------- */

const me = Math.random().toString(36).slice(2, 10)

const role = (): Role => {
  const path = location.pathname.replace(/\/+$/, '')
  return path.endsWith('/tv') ? 'tv' : path.endsWith('/tablet') ? 'tablet' : 'dashboard'
}

/* ---------- 서버 사본 ---------- */

let room: string | null = null
let stream: EventSource | null = null
let beatTimer = 0
let retryTimer = 0
/** 서버에 있는 rooms/{코드} 전체의 사본 */
let tree: Obj = {}
/** 서버의 첫 내용을 받았는지 */
let seeded = false
/** 끊긴 동안 이 기기에서 보내지 못한 변경이 있는지 */
let dirty = false
let bestRtt = Infinity
/** 연결이 끊긴 적이 있는지. 다시 이어지면 바로 알리기 위해 */
let wasLost = false
let queue: Promise<unknown> = Promise.resolve()

const url = (code: string, path: string) => `${SYNC_URL}/rooms/${code}${path ? `/${path}` : ''}.json`

async function send(code: string, method: 'GET' | 'PUT' | 'PATCH' | 'DELETE', path: string, body?: unknown, keepalive = false): Promise<Json> {
  const res = await fetch(url(code, path), { method, body: body === undefined ? undefined : JSON.stringify(body), keepalive })
  if (!res.ok) throw new Error(`sync ${method} ${res.status}`)
  return (await res.json()) as Json
}

/** 보낸 순서대로 서버에 닿도록 한 줄로 세웁니다 */
function write(method: 'PUT' | 'PATCH', path: string, body: unknown) {
  const code = room
  if (!code) return
  queue = queue
    .then(() => send(code, method, path, body))
    .catch(() => {
      if (code === room) dirty = true
    })
}

function setPath(root: Obj, path: string, value: Json) {
  const keys = path.split('/').filter(Boolean)
  if (!keys.length) {
    for (const k of Object.keys(root)) delete root[k]
    if (isObj(value)) Object.assign(root, value)
    return
  }
  let node = root
  for (const k of keys.slice(0, -1)) {
    const child = node[k]
    if (isObj(child)) node = child
    else {
      const made: Obj = {}
      node[k] = made
      node = made
    }
  }
  const last = keys[keys.length - 1]
  if (value === null) delete node[last]
  else node[last] = value
}

/** a에서 b로 바뀐 잎만 "경로: 값"으로 모읍니다. 없어진 값은 null(서버에서 삭제) */
function diff(a: Json | undefined, b: Json | undefined, base: string, out: Obj) {
  if (isObj(a) && isObj(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], base ? `${base}/${k}` : k, out)
    return
  }
  if (a === b || (a == null && b == null)) return
  if (b === undefined || b === null) out[base] = null
  else if (JSON.stringify(a) !== JSON.stringify(b)) out[base] = b
}

/** 서버는 null과 빈 객체를 저장하지 않으므로, 없는 값과 null·{}을 같게 봅니다 */
function same(a: unknown, b: unknown): boolean {
  const empty = (v: unknown) => v == null || (isObj(v) && Object.keys(v).length === 0)
  if (empty(a) && empty(b)) return true
  if (isObj(a) && isObj(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (!same(a[k], b[k])) return false
    return true
  }
  return a === b
}

/** 서버에서 온 상태를 이 앱의 모양으로 채웁니다 */
function normalize(remote: Obj): Shared {
  const r = clone(remote)
  const local = getState()
  const rs = isObj(r.session) ? r.session : {}
  const session = { ...idleSession(), ...(rs as unknown as Partial<Session>), seniorStatus: (isObj(rs.seniorStatus) ? rs.seniorStatus : {}) as Session['seniorStatus'] }
  const stages = getProgram(session.programId)?.stages.length ?? 0
  return {
    session: session.status !== 'idle' && session.stageIndex >= stages ? idleSession() : session,
    attendance: isObj(r.attendance) ? (r.attendance as Record<string, boolean>) : local.attendance,
    completedSessionsToday: typeof r.completedSessionsToday === 'number' ? r.completedSessionsToday : local.completedSessionsToday,
    lastCountedSession: typeof r.lastCountedSession === 'number' ? r.lastCountedSession : null,
  }
}

/** 통째로 올린 상태에만 붙는 표시. 이 표시가 없으면 일부만 남은 상태라 믿지 않습니다 */
const complete = (s: Json | undefined): s is Obj => isObj(s) && s.v === 1

/** 이 기기의 상태를 통째로 올립니다 */
function pushAll() {
  const mine = { ...(clone(pickShared(getState())) as unknown as Obj), v: 1 }
  tree.state = mine
  dirty = false
  // PUT 본문의 null은 서버가 받지 않는 구현이 있어 빼고 보냅니다
  write('PUT', 'state', JSON.parse(JSON.stringify(mine, (_k, v: unknown) => (v === null ? undefined : v))))
}

/** 서버 상태를 이 기기에 반영합니다 */
function adopt() {
  if (!complete(tree.state)) return
  const remote = normalize(tree.state)
  if (!same(remote, pickShared(getState()))) applyShared(remote)
}

function presence() {
  const t = now()
  const others = Object.entries(isObj(tree.devices) ? tree.devices : {})
    .filter(([id]) => id !== me)
    .map(([, d]) => d)
    .filter((d): d is Obj => isObj(d) && typeof d.at === 'number' && t - d.at < 50_000)
  setStatus({ tv: others.some((d) => d.role === 'tv'), controller: others.some((d) => d.role !== 'tv') })
}

function onEvent(type: 'put' | 'patch', raw: string) {
  let msg: { path: string; data: Json }
  try {
    msg = JSON.parse(raw) as { path: string; data: Json }
  } catch {
    return
  }
  if (type === 'put') setPath(tree, msg.path, msg.data)
  else if (isObj(msg.data)) for (const [k, v] of Object.entries(msg.data)) setPath(tree, `${msg.path}/${k}`, v)

  // 경로가 "/"인 put은 처음 연결됐거나 끊겼다 다시 이어졌다는 뜻입니다
  const fresh = type === 'put' && msg.path === '/'
  if (fresh) seeded = true
  if (seeded) {
    // 비었거나 일부만 남은 방은 태블릿·PC가 채웁니다. 끊긴 동안 조작한 태블릿·PC는 자기 상태를 다시 올립니다.
    // TV는 조작하는 기기가 아니므로 늘 서버를 따릅니다.
    if (role() !== 'tv' && (!complete(tree.state) || (fresh && dirty))) pushAll()
    if (fresh) dirty = false
  }
  // 다시 이어졌으면 이 기기가 켜져 있음을 바로 알립니다
  if (fresh && wasLost) {
    wasLost = false
    void beat()
  }
  adopt()
  presence()
}

/** 이 기기가 켜져 있음을 알리고, 그 왕복 시간으로 서버 시각과의 차이를 잽니다 */
async function beat() {
  const code = room
  if (!code) return
  const t0 = Date.now()
  try {
    const res = await send(code, 'PUT', `devices/${me}`, { role: role(), at: { '.sv': 'timestamp' } })
    const t1 = Date.now()
    let at = isObj(res) ? res.at : null
    if (typeof at !== 'number') {
      const read = await send(code, 'GET', `devices/${me}`)
      at = isObj(read) ? read.at : null
    }
    // 왕복이 짧았던 측정일수록 정확합니다
    if (typeof at === 'number' && t1 - t0 <= bestRtt + 40) {
      bestRtt = Math.min(bestRtt, t1 - t0)
      setClockOffset(Math.round(at - (t0 + t1) / 2))
    }
  } catch {
    /* 다음 차례에 다시 시도 */
  }
  if (code !== room) return
  // 10분 넘게 소식이 없는 기기 기록은 지웁니다
  const t = now()
  const gone: Obj = {}
  for (const [id, d] of Object.entries(isObj(tree.devices) ? tree.devices : {})) {
    if (id !== me && isObj(d) && typeof d.at === 'number' && t - d.at > 600_000) gone[id] = null
  }
  if (Object.keys(gone).length) send(code, 'PATCH', 'devices', gone).catch(() => {})
  presence()
}

function open(code: string) {
  stream?.close()
  const es = new EventSource(url(code, ''))
  stream = es
  es.onopen = () => {
    if (stream === es) setStatus({ link: 'on' })
  }
  es.addEventListener('put', (e) => stream === es && onEvent('put', (e as MessageEvent<string>).data))
  es.addEventListener('patch', (e) => stream === es && onEvent('patch', (e as MessageEvent<string>).data))
  const retry = () => {
    if (stream !== es) return
    wasLost = true
    setStatus({ link: 'lost', tv: false, controller: false })
    // 브라우저가 스스로 다시 붙지 않는 경우(서버가 연결을 닫음)에만 직접 다시 엽니다
    if (es.readyState === EventSource.CLOSED) {
      window.clearTimeout(retryTimer)
      retryTimer = window.setTimeout(() => stream === es && room === code && open(code), 4000)
    }
  }
  es.onerror = retry
  es.addEventListener('cancel', retry)
  es.addEventListener('auth_revoked', retry)
}

function connect(code: string) {
  disconnect()
  room = code
  tree = {}
  seeded = false
  dirty = false
  bestRtt = Infinity
  queue = Promise.resolve()
  setStatus({ room: code, link: 'connecting', tv: false, controller: false })
  open(code)
  void beat()
  beatTimer = window.setInterval(() => void beat(), 20_000)
}

function disconnect() {
  const code = room
  stream?.close()
  stream = null
  window.clearInterval(beatTimer)
  window.clearTimeout(retryTimer)
  room = null
  setClockOffset(0)
  setStatus({ room: null, link: 'off', tv: false, controller: false })
  if (code) send(code, 'DELETE', `devices/${me}`, undefined, true).catch(() => {})
}

if (syncReady && typeof window !== 'undefined') {
  // 이 기기에서 바뀐 내용을 서버로
  onLocalChange((prev, next) => {
    if (!room || !seeded) return
    if (!complete(tree.state)) return pushAll()
    const changes: Obj = {}
    diff(pickShared(prev) as unknown as Json, pickShared(next) as unknown as Json, '', changes)
    const paths = Object.keys(changes)
    if (!paths.length) return
    for (const p of paths) setPath(tree.state, p, clone(changes[p]))
    write('PATCH', 'state', changes)
  })

  // 연결 코드가 바뀌면(이 창에서든 같은 브라우저의 다른 창에서든) 다시 연결
  const follow = () => {
    const want = getState().room
    if (want === room) return
    if (want) connect(want)
    else disconnect()
  }
  subscribe(follow)
  follow()

  window.addEventListener('pagehide', () => {
    if (room) send(room, 'DELETE', `devices/${me}`, undefined, true).catch(() => {})
  })
  // 화면을 닫지 않고 돌아온 경우(뒤로 가기 캐시) 다시 알립니다
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && room) void beat()
  })
}

/* ---------- 화면에서 쓰는 동작 ---------- */

/** TV가 자기 연결 코드를 만듭니다. 이미 있으면 그대로 둡니다 */
export function createRoom() {
  if (!syncReady || getState().room) return
  setRoom(String(Math.floor(100000 + Math.random() * 900000)))
}

export type JoinResult = 'ok' | 'bad-code' | 'no-tv' | 'offline'

/** 태블릿·PC가 TV에 보이는 코드로 들어갑니다 */
export async function joinRoom(input: string): Promise<JoinResult> {
  const code = input.replace(/\D/g, '')
  if (!syncReady) return 'offline'
  if (code.length !== 6) return 'bad-code'
  try {
    const devices = await send(code, 'GET', 'devices')
    const hasTv = isObj(devices) && Object.values(devices).some((d) => isObj(d) && d.role === 'tv')
    if (!hasTv) return 'no-tv'
  } catch {
    return 'offline'
  }
  setRoom(code)
  return 'ok'
}

export const leaveRoom = () => setRoom(null)
