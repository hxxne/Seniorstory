import { useSyncExternalStore } from 'react'
import { seniors } from '../data/seniors'
import { getProgram, moveStartSec, stageDuration } from '../data/programs'

export type SeniorStatus = 'normal' | 'caution' | 'rest'
export type SessionStatus = 'idle' | 'playing' | 'paused' | 'emergency' | 'completed'

export interface Institution {
  name: string
  manager: string
  email: string
  /** 아래는 기관 등록 3단계에서 받는 선택 정보 */
  type?: string
  capacity?: number
  phone?: string
  defaultProgram?: 'p30' | 'p50'
  slot?: string
  specialties?: string[]
}

/** 첫 세션까지의 시작 체크리스트 */
export interface Onboarding {
  dismissed: boolean
  attendance: boolean
  tv: boolean
  tablet: boolean
  session: boolean
}
export type OnboardingStep = Exclude<keyof Onboarding, 'dismissed'>

export interface Session {
  status: SessionStatus
  programId: string | null
  stageIndex: number
  /** 재생 시작 시각(ms). 일시정지 상태면 null */
  stageStartedAt: number | null
  /** 현재 단계에서 재생 전까지 누적된 경과 시간(초) */
  elapsedBeforePause: number
  seniorStatus: Record<string, SeniorStatus>
  startedAt: number | null
  completedAt: number | null
}

export interface AppState {
  institution: Institution | null
  /** 로그아웃해도 남겨 두는 최근 접속 기관 (로그인 화면의 "계속하기") */
  lastInstitution: Institution | null
  onboarding: Onboarding
  attendance: Record<string, boolean>
  session: Session
  completedSessionsToday: number
  lastCountedSession: number | null
}

const KEY = 'seniorstory:v1'
const CHANNEL = 'seniorstory'

const idleSession = (): Session => ({
  status: 'idle',
  programId: null,
  stageIndex: 0,
  stageStartedAt: null,
  elapsedBeforePause: 0,
  seniorStatus: {},
  startedAt: null,
  completedAt: null,
})

const freshOnboarding = (): Onboarding => ({ dismissed: false, attendance: false, tv: false, tablet: false, session: false })

const initial = (): AppState => ({
  institution: null,
  lastInstitution: null,
  onboarding: freshOnboarding(),
  attendance: Object.fromEntries(seniors.map((s) => [s.id, s.defaultPresent])),
  session: idleSession(),
  completedSessionsToday: 1,
  lastCountedSession: null,
})

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial()
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      ...initial(),
      ...parsed,
      onboarding: { ...freshOnboarding(), ...(parsed.onboarding ?? {}) },
      session: { ...idleSession(), ...(parsed.session ?? {}) },
    }
  } catch {
    return initial()
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()
const bc: BroadcastChannel | null = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL) : null

function emit() {
  for (const l of listeners) l()
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* 저장 공간 부족 등은 무시 */
  }
}

function set(updater: (prev: AppState) => AppState) {
  const next = updater(state)
  if (next === state) return
  state = next
  persist()
  bc?.postMessage(state)
  emit()
}

bc?.addEventListener('message', (e: MessageEvent<AppState>) => {
  state = e.data
  emit()
})

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load()
      emit()
    }
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}

export const getState = () => state

/* ---------- 기관 ---------- */

export const setInstitution = (inst: Institution | null) =>
  set((s) => ({ ...s, institution: inst, lastInstitution: inst ?? s.lastInstitution }))

/** 신규 기관 등록: 프로필 저장 + 시작 체크리스트 초기화 */
export const registerInstitution = (inst: Institution) =>
  set((s) => ({ ...s, institution: inst, lastInstitution: inst, onboarding: freshOnboarding() }))

export const logout = () => set((s) => ({ ...s, institution: null, lastInstitution: s.institution ?? s.lastInstitution }))

/* ---------- 시작 체크리스트 ---------- */

export const markOnboarding = (step: OnboardingStep) =>
  set((s) => (s.onboarding[step] ? s : { ...s, onboarding: { ...s.onboarding, [step]: true } }))

export const dismissOnboarding = () => set((s) => ({ ...s, onboarding: { ...s.onboarding, dismissed: true } }))

/* ---------- 출석 ---------- */

export const toggleAttendance = (id: string) =>
  set((s) => ({
    ...s,
    onboarding: { ...s.onboarding, attendance: true },
    attendance: { ...s.attendance, [id]: !s.attendance[id] },
  }))

export const setAllAttendance = (present: boolean) =>
  set((s) => ({
    ...s,
    onboarding: { ...s.onboarding, attendance: true },
    attendance: Object.fromEntries(seniors.map((x) => [x.id, present])),
  }))

/* ---------- 세션 ---------- */

export function startProgram(programId: string, autoplay = true) {
  const program = getProgram(programId)
  if (!program) return
  const now = Date.now()
  set((s) => ({
    ...s,
    onboarding: { ...s.onboarding, session: true },
    session: {
      ...idleSession(),
      status: autoplay ? 'playing' : 'paused',
      programId,
      stageStartedAt: autoplay ? now : null,
      startedAt: now,
      seniorStatus: Object.fromEntries(
        seniors.filter((x) => s.attendance[x.id]).map((x) => [x.id, 'normal' as SeniorStatus]),
      ),
    },
  }))
}

/** 현재 단계의 총 경과 시간(초) */
export function stageElapsed(session: Session, now = Date.now()) {
  const live = session.status === 'playing' && session.stageStartedAt ? (now - session.stageStartedAt) / 1000 : 0
  return session.elapsedBeforePause + live
}

export const play = () =>
  set((s) => {
    if (s.session.status !== 'paused' && s.session.status !== 'emergency') return s
    return { ...s, session: { ...s.session, status: 'playing', stageStartedAt: Date.now() } }
  })

export const pause = () =>
  set((s) => {
    if (s.session.status !== 'playing') return s
    return {
      ...s,
      session: {
        ...s.session,
        status: 'paused',
        elapsedBeforePause: stageElapsed(s.session),
        stageStartedAt: null,
      },
    }
  })

export const togglePlay = () => (state.session.status === 'playing' ? pause() : play())

export function gotoStage(index: number) {
  set((s) => {
    const program = getProgram(s.session.programId)
    if (!program) return s
    const clamped = Math.max(0, Math.min(program.stages.length - 1, index))
    const resume = s.session.status === 'playing' || s.session.status === 'completed'
    return {
      ...s,
      session: {
        ...s.session,
        status: resume ? 'playing' : s.session.status,
        stageIndex: clamped,
        elapsedBeforePause: 0,
        stageStartedAt: resume ? Date.now() : null,
        completedAt: null,
      },
    }
  })
}

function completed(s: AppState): AppState {
  // 여러 화면(TV·태블릿)이 동시에 완료 처리해도 세션당 1회만 집계
  const counted = s.lastCountedSession === s.session.startedAt
  return {
    ...s,
    completedSessionsToday: counted ? s.completedSessionsToday : s.completedSessionsToday + 1,
    lastCountedSession: s.session.startedAt,
    session: { ...s.session, status: 'completed', stageStartedAt: null, elapsedBeforePause: 0, completedAt: Date.now() },
  }
}

function toStage(s: AppState, index: number): AppState {
  const playing = s.session.status === 'playing'
  return {
    ...s,
    session: { ...s.session, stageIndex: index, elapsedBeforePause: 0, stageStartedAt: playing ? Date.now() : null },
  }
}

/** 현재 단계가 끝났을 때 다음 단계로. 마지막 단계면 완료 처리 */
export function advanceStage(fromIndex: number) {
  set((s) => {
    const program = getProgram(s.session.programId)
    if (!program || s.session.stageIndex !== fromIndex) return s
    if (fromIndex >= program.stages.length - 1) return completed(s)
    return toStage(s, fromIndex + 1)
  })
}

/** 단계 내 다음 동작으로 즉시 이동 */
export function nextMove() {
  set((s) => {
    const program = getProgram(s.session.programId)
    if (!program) return s
    if (s.session.status === 'idle' || s.session.status === 'completed') return s
    const stage = program.stages[s.session.stageIndex]
    const elapsed = stageElapsed(s.session)
    let acc = 0
    let target = -1
    for (let i = 0; i < stage.moves.length; i++) {
      acc += stage.moves[i].durationSec
      if (elapsed < acc) {
        target = i + 1
        break
      }
    }
    if (target === -1 || target >= stage.moves.length) {
      if (s.session.stageIndex >= program.stages.length - 1) return completed(s)
      return toStage(s, s.session.stageIndex + 1)
    }
    const playing = s.session.status === 'playing'
    return {
      ...s,
      session: {
        ...s.session,
        elapsedBeforePause: Math.min(moveStartSec(stage, target), stageDuration(stage) - 1),
        stageStartedAt: playing ? Date.now() : null,
      },
    }
  })
}

export const setSeniorStatus = (id: string, status: SeniorStatus) =>
  set((s) => ({ ...s, session: { ...s.session, seniorStatus: { ...s.session.seniorStatus, [id]: status } } }))

const cycle: Record<SeniorStatus, SeniorStatus> = { normal: 'caution', caution: 'rest', rest: 'normal' }
export const cycleSeniorStatus = (id: string) =>
  set((s) => {
    const cur = s.session.seniorStatus[id] ?? 'normal'
    return { ...s, session: { ...s.session, seniorStatus: { ...s.session.seniorStatus, [id]: cycle[cur] } } }
  })

export const emergencyStop = () =>
  set((s) => {
    if (s.session.status === 'idle' || s.session.status === 'completed') return s
    return {
      ...s,
      session: {
        ...s.session,
        status: 'emergency',
        elapsedBeforePause: stageElapsed(s.session),
        stageStartedAt: null,
      },
    }
  })

export const endSession = () => set((s) => ({ ...s, session: idleSession() }))

export const resetAll = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  set(() => initial())
}
