import { getState, logout, registerInstitution, setInstitution, type Institution } from './store'

/**
 * 기관 계정. 서버가 없어서 계정은 이 브라우저의 localStorage에만 있습니다.
 * 비밀번호는 저장하지 않고, 계정마다 다른 소금값으로 PBKDF2를 돌린 결과만 저장합니다.
 * 서버 인증(예: Firebase Authentication)으로 바꿀 때는 이 파일의 signUp·signIn만 갈아 끼우면 됩니다.
 */

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

export const hasAccount = (email: string) => find(email) !== null

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

/* ---------- 등록 · 로그인 ---------- */

export type SignUpResult = 'ok' | 'email-taken' | 'bad-email' | 'weak-password' | 'unsupported'
export type SignInResult = 'ok' | 'no-account' | 'wrong-password' | 'unsupported'

const supported = () => typeof crypto !== 'undefined' && !!crypto.subtle

/** 새 기관 계정을 만들고 바로 로그인합니다 */
export async function signUp(institution: Institution, password: string): Promise<SignUpResult> {
  const email = normalizeEmail(institution.email)
  if (emailProblem(email)) return 'bad-email'
  if (passwordProblem(password)) return 'weak-password'
  if (!supported()) return 'unsupported'
  if (find(email)) return 'email-taken'

  const salt = b64(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await derive(password, salt)
  const profile = { ...institution, email }
  // 비밀번호를 계산하는 사이 다른 창에서 같은 이메일로 등록했을 수 있습니다
  const list = accounts()
  if (list.some((a) => a.email === email)) return 'email-taken'
  save([...list, { email, salt, hash, institution: profile, createdAt: Date.now() }])
  remember(true)
  registerInstitution(profile)
  return 'ok'
}

/** 등록된 계정의 비밀번호가 맞을 때만 로그인합니다 */
export async function signIn(email: string, password: string, keep: boolean): Promise<SignInResult> {
  if (!supported()) return 'unsupported'
  const account = find(email)
  if (!account) return 'no-account'
  const hash = await derive(password, account.salt)
  if (!sameText(hash, account.hash)) return 'wrong-password'
  remember(keep)
  setInstitution(account.institution)
  return 'ok'
}
