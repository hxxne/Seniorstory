import { getState, logout, registerInstitution, resetAll, setInstitution, type Institution } from './store'
import { ACCOUNT_ROOM, SYNC_URL } from './sync'

/**
 * 기관 계정.
 *
 * 서버 계정 (AUTH_KEY가 있을 때): Firebase Authentication에 이메일과 비밀번호로 계정을 만들고,
 * 기관 정보는 실시간 데이터베이스의 users/{계정 번호} 아래에 둡니다. 어느 기기에서나 같은 계정으로 들어갑니다.
 * SDK 없이 REST로만 부릅니다. 데이터베이스 규칙은 users/{uid}를 본인만 읽고 쓰게 해야 합니다.
 *
 * 기기 계정 (AUTH_KEY가 비어 있을 때): 계정을 이 브라우저의 localStorage에만 둡니다.
 * 비밀번호는 저장하지 않고, 계정마다 다른 소금값으로 PBKDF2를 돌린 결과만 저장합니다.
 */

/** Firebase 프로젝트의 웹 API 키. 사이트에 공개되어도 되는 값입니다. 비우면 기기 계정으로 동작합니다 */
const DEFAULT_KEY = 'AIzaSyCHUPnvgNxVguW8EX-kkQC0NwOTbVxMdxk'
const AUTH_KEY = (import.meta.env.VITE_AUTH_KEY as string | undefined) || DEFAULT_KEY
/** 계정이 서버에 있어 어느 기기에서나 로그인되는지 */
export const serverAccounts = AUTH_KEY !== '' && SYNC_URL !== ''

interface Account {
  email: string
  salt: string
  hash: string
  institution: Institution
  createdAt: number
}

const KEY = 'seniorstory:accounts:v1'
/** "이 기기 기억하기"를 끈 로그인 표시. 브라우저를 닫으면 사라지는 쿠키와 짝을 이룹니다 */
const SESSION_ONLY = 'seniorstory:session-only'
const ALIVE = 'mm_alive'
const ITERATIONS = 150_000

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

/* ---------- 기기 계정 ---------- */

function accounts(): Account[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as Account[]) : []
  } catch {
    return []
  }
}

function save(list: Account[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

const find = (email: string) => accounts().find((a) => a.email === normalizeEmail(email)) ?? null

/**
 * 이 기기에서 그 이메일의 계정을 확인할 수 있는지.
 * 서버 계정은 여기서 알 수 없으므로 늘 false이고, 겹치는 이메일은 등록할 때 서버가 알려 줍니다.
 */
export const hasAccount = (email: string) => !serverAccounts && find(email) !== null

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const unb64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations: ITERATIONS }, key, 256)
  return b64(new Uint8Array(bits))
}

/** 길이가 같은 두 문자열을 끝까지 비교합니다 */
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/* ---------- 입력 검사 ---------- */

/** 이메일 형식이 맞지 않으면 안내 문구, 맞으면 null */
export function emailProblem(email: string): string | null {
  const e = email.trim()
  if (!e) return '이메일을 입력해 주세요'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return '이메일 주소 형식을 확인해 주세요. 예: admin@institution.kr'
  return null
}

/** 비밀번호 규칙: 8자 이상, 영문과 숫자를 함께 */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return `8자 이상이어야 합니다. 지금 ${password.length}자입니다`
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return '영문과 숫자를 함께 넣어 주세요'
  if (/\s/.test(password)) return '공백은 쓸 수 없습니다'
  return null
}

/* ---------- 로그인 유지 ---------- */

const cookiePath = () => import.meta.env.BASE_URL

const alive = () => document.cookie.split('; ').some((c) => c.startsWith(`${ALIVE}=`))

function remember(keep: boolean) {
  try {
    if (keep) {
      localStorage.removeItem(SESSION_ONLY)
    } else {
      localStorage.setItem(SESSION_ONLY, '1')
      // 만료일이 없는 쿠키는 브라우저를 닫을 때 지워집니다
      document.cookie = `${ALIVE}=1; path=${cookiePath()}; SameSite=Lax`
    }
  } catch {
    /* 저장이 막힌 환경에서는 기억하는 쪽으로 둡니다 */
  }
}

// 기억하지 않기로 한 로그인인데 브라우저를 닫았다 다시 연 경우: 로그아웃합니다
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(SESSION_ONLY) && !alive()) {
      localStorage.removeItem(SESSION_ONLY)
      if (getState().institution) logout()
    }
  } catch {
    /* noop */
  }
}

/* ---------- 서버 계정 (Firebase Authentication REST) ---------- */

type ServerError = 'email-taken' | 'bad-login' | 'weak-password' | 'bad-email' | 'too-many' | 'not-enabled' | 'network'

interface Signed {
  uid: string
  idToken: string
}

class AuthFailure extends Error {
  code: ServerError
  constructor(code: ServerError) {
    super(code)
    this.code = code
  }
}

function serverCode(message: string): ServerError {
  if (message.startsWith('EMAIL_EXISTS')) return 'email-taken'
  if (message.startsWith('WEAK_PASSWORD')) return 'weak-password'
  if (message.startsWith('INVALID_EMAIL') || message.startsWith('MISSING_EMAIL')) return 'bad-email'
  if (message.startsWith('TOO_MANY_ATTEMPTS')) return 'too-many'
  if (message.startsWith('OPERATION_NOT_ALLOWED') || message.startsWith('CONFIGURATION_NOT_FOUND') || message.startsWith('API key')) return 'not-enabled'
  // 이메일이 없는 경우와 비밀번호가 틀린 경우를 서버가 구분해 주지 않습니다
  return 'bad-login'
}

async function identity(method: string, body: Record<string, unknown>): Promise<Record<string, string>> {
  let res: Response
  try {
    res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${AUTH_KEY}`, {
      method: 'POST',
      // 비밀번호 재설정 메일과 그 메일에서 열리는 화면이 한국어로 나오게 합니다
      headers: { 'Content-Type': 'application/json', 'X-Firebase-Locale': 'ko' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AuthFailure('network')
  }
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & Record<string, string>
  if (!res.ok) throw new AuthFailure(serverCode(data.error?.message ?? ''))
  return data
}

const signed = (d: Record<string, string>): Signed => ({ uid: d.localId, idToken: d.idToken })

async function profile(method: 'GET' | 'PUT' | 'DELETE', s: Signed, body?: Institution): Promise<Institution | null> {
  let res: Response
  try {
    res = await fetch(`${SYNC_URL}/users/${s.uid}/profile.json?auth=${s.idToken}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new AuthFailure('network')
  }
  if (!res.ok) throw new AuthFailure(res.status === 401 || res.status === 403 ? 'not-enabled' : 'network')
  return (await res.json()) as Institution | null
}

/** 서버에 값이 없는 칸은 빼고 보냅니다 (undefined는 JSON에 실리지 않지만, 빈 문자열도 남기지 않습니다) */
function clean(inst: Institution): Institution {
  const out = { ...inst } as Record<string, unknown>
  for (const k of Object.keys(out)) if (out[k] === undefined || out[k] === '') delete out[k]
  return out as unknown as Institution
}

/* ---------- 등록 · 로그인 ---------- */

export type SignUpResult = 'ok' | 'email-taken' | 'bad-email' | 'weak-password' | 'unsupported' | 'too-many' | 'not-enabled' | 'network'
export type SignInResult = 'ok' | 'no-account' | 'wrong-password' | 'bad-login' | 'unsupported' | 'too-many' | 'not-enabled' | 'network'
export type DeleteResult = 'ok' | 'wrong-password' | 'unsupported' | 'too-many' | 'not-enabled' | 'network'
export type ResetResult = 'ok' | 'bad-email' | 'too-many' | 'not-enabled' | 'network' | 'unsupported'

const supported = () => typeof crypto !== 'undefined' && !!crypto.subtle

/** 새 기관 계정을 만들고 바로 로그인합니다 */
export async function signUp(institution: Institution, password: string): Promise<SignUpResult> {
  const email = normalizeEmail(institution.email)
  if (emailProblem(email)) return 'bad-email'
  if (passwordProblem(password)) return 'weak-password'
  const info = clean({ ...institution, email })

  if (serverAccounts) {
    try {
      const s = signed(await identity('signUp', { email, password, returnSecureToken: true }))
      try {
        await profile('PUT', s, info)
      } catch (e) {
        // 기관 정보를 올리지 못하면 반쪽짜리 계정이 남지 않게 계정도 지웁니다
        await identity('delete', { idToken: s.idToken }).catch(() => {})
        throw e
      }
      remember(true)
      registerInstitution(info)
      return 'ok'
    } catch (e) {
      const code = e instanceof AuthFailure ? e.code : 'network'
      return code === 'bad-login' ? 'network' : code
    }
  }

  if (!supported()) return 'unsupported'
  if (find(email)) return 'email-taken'
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await derive(password, salt)
  // 비밀번호를 계산하는 사이 다른 창에서 같은 이메일로 등록했을 수 있습니다
  const list = accounts()
  if (list.some((a) => a.email === email)) return 'email-taken'
  save([...list, { email, salt, hash, institution: info, createdAt: Date.now() }])
  remember(true)
  registerInstitution(info)
  return 'ok'
}

/** 등록된 계정의 비밀번호가 맞을 때만 로그인합니다 */
export async function signIn(email: string, password: string, keep: boolean): Promise<SignInResult> {
  if (serverAccounts) {
    try {
      const mail = normalizeEmail(email)
      const s = signed(await identity('signInWithPassword', { email: mail, password, returnSecureToken: true }))
      // 기관 정보가 비어 있으면(등록 도중 끊긴 계정) 이메일만으로 들어가게 합니다
      const info = (await profile('GET', s)) ?? { name: '기관', manager: mail.split('@')[0], email: mail }
      remember(keep)
      setInstitution({ ...info, email: mail })
      return 'ok'
    } catch (e) {
      const code = e instanceof AuthFailure ? e.code : 'network'
      return code === 'email-taken' || code === 'weak-password' || code === 'bad-email' ? 'bad-login' : code
    }
  }

  if (!supported()) return 'unsupported'
  const account = find(email)
  if (!account) return 'no-account'
  const hash = await derive(password, account.salt)
  if (!sameText(hash, account.hash)) return 'wrong-password'
  remember(keep)
  setInstitution(account.institution)
  return 'ok'
}

/** 비밀번호를 다시 정하는 메일을 보냅니다. 서버 계정에서만 됩니다 */
export async function resetPassword(email: string): Promise<ResetResult> {
  if (!serverAccounts) return 'unsupported'
  if (emailProblem(email)) return 'bad-email'
  try {
    await identity('sendOobCode', { requestType: 'PASSWORD_RESET', email: normalizeEmail(email) })
    return 'ok'
  } catch (e) {
    const code = e instanceof AuthFailure ? e.code : 'network'
    // 등록되지 않은 이메일이어도 같은 안내를 보여 줍니다 (등록 여부를 알려 주지 않기 위해)
    if (code === 'bad-login' || code === 'email-taken' || code === 'weak-password') return 'ok'
    return code
  }
}

/**
 * 비밀번호가 맞으면 계정을 지우고, 이 기기의 출석·운동 기록·TV 연결까지 처음 상태로 돌립니다.
 * 서버 계정은 서버의 계정과 기관 정보도 함께 지웁니다.
 */
export async function deleteAccount(email: string, password: string): Promise<DeleteResult> {
  if (serverAccounts) {
    try {
      const s = signed(await identity('signInWithPassword', { email: normalizeEmail(email), password, returnSecureToken: true }))
      await profile('DELETE', s)
      await identity('delete', { idToken: s.idToken })
    } catch (e) {
      const code = e instanceof AuthFailure ? e.code : 'network'
      if (code === 'too-many' || code === 'not-enabled' || code === 'network') return code
      return 'wrong-password'
    }
  } else {
    if (!supported()) return 'unsupported'
    const account = find(email)
    if (account) {
      const hash = await derive(password, account.salt)
      if (!sameText(hash, account.hash)) return 'wrong-password'
    }
  }
  // 이 계정의 기기들이 함께 쓰던 운동 진행 상태도 서버에서 지웁니다
  const shared = getState().room
  if (shared && ACCOUNT_ROOM.test(shared)) await fetch(`${SYNC_URL}/rooms/${shared}.json`, { method: 'DELETE' }).catch(() => {})
  const rest = accounts().filter((a) => a.email !== normalizeEmail(email))
  try {
    if (rest.length) save(rest)
    else localStorage.removeItem(KEY)
    localStorage.removeItem(SESSION_ONLY)
    document.cookie = `${ALIVE}=; path=${cookiePath()}; Max-Age=0; SameSite=Lax`
  } catch {
    /* noop */
  }
  resetAll()
  return 'ok'
}
