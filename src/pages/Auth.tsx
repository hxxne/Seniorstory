import { useRef, useState, type ChangeEvent, type ComponentType, type FormEvent, type InputHTMLAttributes, type ReactNode, type Ref } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Building2, Check, Clock, Eye, EyeOff, KeyRound, Mail, Phone, User, Users } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import RingChart from '../components/ui/RingChart'
import { Button } from '../components/ui/Primitives'
import { programs } from '../data/programs'
import { nextExercise } from '../data/schedule'
import { seniors, specialties } from '../data/seniors'
import { asset } from '../lib/asset'
import { emailProblem, hasAccount, passwordProblem, signIn, signUp } from '../lib/auth'
import { useStore } from '../lib/store'

type Mode = 'login' | 'signup'
const ease = [0.22, 1, 0.36, 1] as const

const TYPES = ['주야간보호센터', '요양원', '노인복지관', '기타']
const SLOTS = ['오전', '오후', '오전 · 오후']
const STEPS = ['기관', '관리자', '운영'] as const

interface Draft {
  name: string
  type: string
  capacity: string
  manager: string
  email: string
  phone: string
  password: string
  confirm: string
  program: 'p30' | 'p50'
  slot: string
  agree: boolean
}
const emptyDraft: Draft = { name: '', type: '', capacity: '', manager: '', email: '', phone: '', password: '', confirm: '', program: 'p30', slot: '오전', agree: false }

export default function Auth({ mode }: { mode: Mode }) {
  const navigate = useNavigate()
  const signedIn = useStore((s) => s.institution !== null)
  const last = useStore((s) => s.lastInstitution)
  // 계정이 남아 있는 최근 접속 기관만 보여 줍니다
  const recent = last && hasAccount(last.email) ? last : null

  /* ---------- 로그인 ---------- */
  const [login, setLogin] = useState({ email: recent?.email ?? '', password: '', keep: true })
  const [loginError, setLoginError] = useState<{ field: 'email' | 'password' | 'form'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const passwordInput = useRef<HTMLInputElement>(null)

  const submitLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const bad = emailProblem(login.email)
    if (bad) return setLoginError({ field: 'email', text: bad })
    setBusy(true)
    setLoginError(null)
    const result = await signIn(login.email, login.password, login.keep)
    if (result === 'ok') return navigate('/dashboard')
    setBusy(false)
    if (result === 'no-account') setLoginError({ field: 'email', text: '등록되지 않은 이메일입니다. 기관 등록을 먼저 해 주세요' })
    else if (result === 'wrong-password') {
      setLoginError({ field: 'password', text: '비밀번호가 맞지 않습니다' })
      passwordInput.current?.focus()
      passwordInput.current?.select()
    } else setLoginError({ field: 'form', text: '이 브라우저에서는 로그인할 수 없습니다. 주소가 https로 시작하는지 확인해 주세요' })
  }

  /* ---------- 등록 (3단계) ---------- */
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const field = (k: keyof Draft) => (e: ChangeEvent<HTMLInputElement>) => patch({ [k]: e.target.value } as Partial<Draft>)

  const go = (n: number) => {
    setDir(n > step ? 1 : -1)
    setStep(n)
  }
  type ErrKey = 'name' | 'manager' | 'email' | 'password' | 'confirm' | 'form'
  const [errs, setErrs] = useState<Partial<Record<ErrKey, string>>>({})
  const clear = (k: ErrKey) => setErrs((e) => (e[k] ? { ...e, [k]: undefined } : e))

  /** 지금 단계의 입력을 검사해 문제를 돌려줍니다 */
  const check = (): Partial<Record<ErrKey, string>> => {
    const found: Partial<Record<ErrKey, string>> = {}
    if (step === 0 && !draft.name.trim()) found.name = '기관명을 입력해 주세요'
    if (step === 1) {
      if (!draft.manager.trim()) found.manager = '관리자 성함을 입력해 주세요'
      const mail = emailProblem(draft.email)
      if (mail) found.email = mail
      else if (hasAccount(draft.email)) found.email = '이미 등록된 이메일입니다. 기관 로그인에서 들어가 주세요'
      const pw = passwordProblem(draft.password)
      if (pw) found.password = pw
      else if (draft.confirm !== draft.password) found.confirm = '비밀번호가 서로 다릅니다'
    }
    return found
  }

  const submitStep = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const found = check()
    setErrs(found)
    if (Object.keys(found).length) return
    if (step < 2) return go(step + 1)
    setBusy(true)
    const result = await signUp(
      {
        name: draft.name.trim(),
        manager: draft.manager.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        type: draft.type,
        capacity: draft.capacity ? Number(draft.capacity) : undefined,
        defaultProgram: draft.program,
        slot: draft.slot,
      },
      draft.password,
    )
    if (result === 'ok') return navigate('/dashboard')
    setBusy(false)
    if (result === 'unsupported') return setErrs({ form: '이 브라우저에서는 등록할 수 없습니다. 주소가 https로 시작하는지 확인해 주세요' })
    // 그 사이 같은 이메일이 등록됐거나 입력이 바뀐 경우: 계정 단계로 돌아가 알려 줍니다
    go(1)
    setErrs(result === 'email-taken' ? { email: '이미 등록된 이메일입니다. 기관 로그인에서 들어가 주세요' } : result === 'bad-email' ? { email: emailProblem(draft.email) ?? '' } : { password: passwordProblem(draft.password) ?? '' })
  }

  // 이미 로그인한 상태에서 이 화면에 오면 대시보드로 보냅니다
  if (signedIn && !busy) return <Navigate to="/dashboard" replace />

  return (
    <div className="grid min-h-screen bg-sand-50 text-ink lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel mode={mode} draft={draft} step={step} />

      {/* ---------- 우측 인증 워크스테이션 ---------- */}
      <main className="flex min-h-screen flex-col px-6 py-6 md:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="MediMove 홈" className="lg:invisible">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-[14px] text-ink-3 transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> 소개 페이지
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
          {/* Double-Bezel 워크스테이션 */}
          <div className="rounded-[28px] border border-ink/10 bg-sand-200 p-1.5">
            <div className="rounded-[22px] border border-ink/[0.06] bg-white p-6 md:p-8">
              {/* 모드 전환기 */}
              <div role="tablist" aria-label="기관 로그인 또는 기관 등록" className="relative grid grid-cols-2 rounded-[10px] bg-sand-100 p-1 text-[14px] font-medium">
                {(['login', 'signup'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => navigate(m === 'login' ? '/login' : '/register', { replace: true })}
                    className={`relative h-9 rounded-md transition-colors duration-150 ${mode === m ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
                  >
                    {mode === m ? <motion.span layoutId="auth-mode-pill" className="absolute inset-0 rounded-md bg-white shadow-card" transition={{ duration: 0.2, ease }} /> : null}
                    <span className="relative">{m === 'login' ? '기관 로그인' : '기관 등록'}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {mode === 'login' ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18, ease }} className="mt-8">
                    <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.02em]">기관 로그인</h1>
                    <p className="mt-2 text-[15px] text-ink-3">관리자 계정으로 대시보드에 접속합니다</p>

                    {/* 최근 접속 기관: 한 번에 계속하기 */}
                    {recent ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLogin((l) => ({ ...l, email: recent.email }))
                          setLoginError(null)
                          passwordInput.current?.focus()
                        }}
                        disabled={busy}
                        className="press mt-6 flex w-full items-center gap-3 rounded-xl border border-ink/10 bg-sand-50 p-3 text-left hover:border-ink/25"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-serif text-[16px] font-medium text-lime">{recent.name.slice(0, 1)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{recent.name}</span>
                          <span className="block truncate text-[13px] text-ink-3">최근 접속 · {recent.manager}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-2">
                          비밀번호 입력 <ArrowRight className="h-4 w-4" />
                        </span>
                      </button>
                    ) : null}

                    <form onSubmit={submitLogin} noValidate className="mt-6 space-y-4">
                      <Field
                        icon={Mail}
                        label="이메일"
                        type="email"
                        placeholder="admin@institution.kr"
                        autoComplete="email"
                        value={login.email}
                        error={loginError?.field === 'email' ? loginError.text : undefined}
                        onChange={(e) => {
                          setLogin((l) => ({ ...l, email: e.target.value }))
                          setLoginError(null)
                        }}
                      />
                      <PasswordField
                        ref={passwordInput}
                        label="비밀번호"
                        placeholder="비밀번호"
                        autoComplete="current-password"
                        value={login.password}
                        error={loginError?.field === 'password' ? loginError.text : undefined}
                        onChange={(e) => {
                          setLogin((l) => ({ ...l, password: e.target.value }))
                          setLoginError(null)
                        }}
                      />
                      <div className="flex items-center justify-between gap-3 text-[14px]">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-ink-2">
                          <input type="checkbox" checked={login.keep} onChange={(e) => setLogin((l) => ({ ...l, keep: e.target.checked }))} className="h-4 w-4 rounded border-ink/20 accent-ink" />
                          이 기기 기억하기
                        </label>
                        <Link to="/register" className="font-medium text-ink-2 underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
                          처음이면 기관 등록
                        </Link>
                      </div>
                      {loginError?.field === 'form' ? (
                        <p role="alert" className="text-[14px] leading-snug text-coral-deep">
                          {loginError.text}
                        </p>
                      ) : null}
                      <Button type="submit" size="lg" className="w-full" disabled={busy || !login.email.trim() || !login.password}>
                        {busy ? '확인하는 중' : '대시보드로 들어가기'}
                        {!busy ? <ArrowRight className="h-4 w-4" /> : null}
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="signup" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18, ease }} className="mt-8">
                    {/* 단계 표시 */}
                    <ol className="flex items-center gap-2" aria-label="등록 단계">
                      {STEPS.map((label, i) => (
                        <li key={label} className="flex flex-1 items-center gap-2">
                          <button
                            type="button"
                            disabled={i > step}
                            onClick={() => go(i)}
                            aria-current={i === step ? 'step' : undefined}
                            className={`flex items-center gap-2 text-[13px] font-medium ${i === step ? 'text-ink' : i < step ? 'text-ink-2' : 'text-ink-3'}`}
                          >
                            <span className={`tnum grid h-6 w-6 place-items-center rounded-full text-[12px] ${i < step ? 'bg-lime text-ink' : i === step ? 'bg-ink text-white' : 'border border-ink/20 text-ink-3'}`}>
                              {i < step ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                            </span>
                            {label}
                          </button>
                          {i < STEPS.length - 1 ? <span className={`h-px flex-1 ${i < step ? 'bg-ink' : 'bg-ink/15'}`} /> : null}
                        </li>
                      ))}
                    </ol>

                    <form onSubmit={submitStep} noValidate className="mt-6">
                      <AnimatePresence mode="wait" initial={false} custom={dir}>
                        <motion.div key={step} initial={{ opacity: 0, x: dir * 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -16 }} transition={{ duration: 0.2, ease }}>
                          {step === 0 ? (
                            <StepBody title="어떤 기관인가요" hint="기관명은 대시보드와 기록에 표시됩니다">
                              <Field icon={Building2} label="기관명" placeholder="행복한 요양원" autoComplete="organization" maxLength={40} value={draft.name} error={errs.name} onChange={(e) => (field('name')(e), clear('name'))} />
                              <Choice label="기관 유형">
                                {TYPES.map((t) => (
                                  <Chip key={t} on={draft.type === t} onClick={() => patch({ type: t })}>
                                    {t}
                                  </Chip>
                                ))}
                              </Choice>
                              <Field icon={Users} label="등록 어르신 수" optional type="number" min={1} max={500} inputMode="numeric" placeholder="14" value={draft.capacity} onChange={field('capacity')} />
                            </StepBody>
                          ) : step === 1 ? (
                            <StepBody title="관리자 계정을 만듭니다" hint="이 계정으로 출석과 세션 기록을 관리합니다">
                              <Field icon={User} label="관리자 성함" placeholder="홍길동" autoComplete="name" maxLength={20} value={draft.manager} error={errs.manager} onChange={(e) => (field('manager')(e), clear('manager'))} />
                              <Field icon={Mail} label="이메일" type="email" placeholder="admin@institution.kr" autoComplete="email" value={draft.email} error={errs.email} onChange={(e) => (field('email')(e), clear('email'))} />
                              <Field icon={Phone} label="기관 연락처" optional type="tel" placeholder="02-000-0000" autoComplete="tel" value={draft.phone} onChange={field('phone')} />
                              <PasswordField
                                label="비밀번호"
                                placeholder="영문과 숫자를 넣어 8자 이상"
                                autoComplete="new-password"
                                value={draft.password}
                                error={errs.password}
                                onChange={(e) => (field('password')(e), clear('password'))}
                                hint={!draft.password ? '영문과 숫자를 함께 넣어 8자 이상' : (passwordProblem(draft.password) ?? '쓸 수 있는 비밀번호입니다')}
                                ok={!!draft.password && !passwordProblem(draft.password)}
                              />
                              <PasswordField
                                label="비밀번호 확인"
                                placeholder="한 번 더 입력"
                                autoComplete="new-password"
                                value={draft.confirm}
                                error={errs.confirm}
                                onChange={(e) => (field('confirm')(e), clear('confirm'))}
                                hint={draft.confirm && draft.confirm === draft.password ? '비밀번호가 같습니다' : undefined}
                                ok
                              />
                            </StepBody>
                          ) : (
                            <StepBody title="운동은 어떻게 진행하나요" hint="나중에 대시보드에서 언제든 바꿀 수 있습니다">
                              <Choice label="기본 프로그램">
                                <div className="grid w-full grid-cols-2 gap-2">
                                  {programs.map((p) => {
                                    const on = draft.program === p.id
                                    return (
                                      <button
                                        key={p.id}
                                        type="button"
                                        aria-pressed={on}
                                        aria-label={p.name}
                                        onClick={() => patch({ program: p.id as 'p30' | 'p50' })}
                                        className={`press rounded-xl border p-3 text-left ${on ? 'border-ink bg-ink text-white' : 'border-ink/10 bg-white hover:border-ink/25'}`}
                                      >
                                        <span className="flex items-center justify-between">
                                          <span className="tnum font-serif text-[24px] font-medium leading-none">{p.minutes}분</span>
                                          {on ? (
                                            <span className="grid h-5 w-5 place-items-center rounded-full bg-lime text-ink">
                                              <Check className="h-3 w-3" strokeWidth={3} />
                                            </span>
                                          ) : null}
                                        </span>
                                        <span className={`mt-2 block text-[13px] ${on ? 'text-white/70' : 'text-ink-3'}`}>{p.tagline}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </Choice>
                              <Choice label="주 운동 시간대">
                                {SLOTS.map((s) => (
                                  <Chip key={s} on={draft.slot === s} onClick={() => patch({ slot: s })}>
                                    {s}
                                  </Chip>
                                ))}
                              </Choice>
                              <label className="flex cursor-pointer items-start gap-2 text-[14px] leading-snug text-ink-2">
                                <input type="checkbox" required checked={draft.agree} onChange={(e) => patch({ agree: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-ink/20 accent-ink" />
                                이용약관과 개인정보 처리방침에 동의합니다
                              </label>
                            </StepBody>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {errs.form ? (
                        <p role="alert" className="mt-4 text-[14px] leading-snug text-coral-deep">
                          {errs.form}
                        </p>
                      ) : null}
                      <div className="mt-6 flex gap-2">
                        {step > 0 ? (
                          <Button variant="secondary" size="lg" onClick={() => go(step - 1)}>
                            <ArrowLeft className="h-4 w-4" /> 이전
                          </Button>
                        ) : null}
                        <Button type="submit" size="lg" className="flex-1" disabled={busy || (step === 0 && !draft.type) || (step === 2 && !draft.agree)}>
                          {busy ? '등록 중' : step < 2 ? '다음' : '등록하고 시작하기'}
                          {!busy ? <ArrowRight className="h-4 w-4" /> : null}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-5 text-center text-[13px] leading-relaxed text-ink-3">계정은 이 브라우저에만 저장되고 서버로 보내지 않습니다. 다른 기기나 다른 브라우저에서는 다시 등록해야 합니다.</p>
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 좌측 에디토리얼 브랜드 패널                                           */
/* ------------------------------------------------------------------ */

function BrandPanel({ mode, draft, step }: { mode: Mode; draft: Draft; step: number }) {
  const attendance = useStore((s) => s.attendance)
  const completed = useStore((s) => s.completedSessionsToday)
  const present = seniors.filter((s) => attendance[s.id]).length
  const next = nextExercise()
  const program = programs.find((p) => p.id === draft.program)

  return (
    <aside className="relative hidden overflow-hidden bg-ink text-white lg:block">
      <AnimatePresence initial={false}>
        <motion.img
          key={mode}
          src={asset(mode === 'login' ? '/landing/tablet.webp' : '/landing/hero.webp')}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: mode === 'login' ? '60% 50%' : '62% 60%' }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/25" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <Link to="/" aria-label="MediMove 홈">
          <Logo inverse />
        </Link>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }} className="max-w-[460px]">
            <h2 className="font-serif text-[40px] font-medium leading-[1.2] tracking-[-0.03em] xl:text-[44px]">
              {mode === 'login' ? (
                <>
                  오늘도 {seniors.length}분의
                  <br />
                  하루가 움직입니다
                </>
              ) : (
                <>
                  등록을 마치면
                  <br />
                  바로 첫 세션입니다
                </>
              )}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-white/75">
              {mode === 'login' ? '출석 확인부터 운동 진행, TV와 태블릿 조작까지 한 화면에서 이어집니다' : '입력하는 내용이 아래 기관 프로필에 그대로 채워집니다. 세 단계면 충분합니다'}
            </p>

            {/* Double-Bezel 라이브 스펙 카드 */}
            <div className="mt-8 rounded-[22px] border border-white/20 bg-white/10 p-1.5 backdrop-blur-xl">
              <div className="rounded-[16px] border border-white/10 bg-ink/60 p-5">
                {mode === 'login' ? (
                  <>
                    <div className="flex items-center justify-between text-[13px] text-white/60">
                      <span>오늘 현황</span>
                      <span className="tnum">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-5">
                      <RingChart size={92} stroke={9} trackColor="rgba(255,255,255,0.12)" segments={[{ value: present, color: '#C6F35C', label: '출석' }]} total={seniors.length}>
                        <div className="text-center">
                          <p className="tnum font-serif text-[22px] font-medium leading-none">{present}</p>
                          <p className="tnum mt-1 text-[12px] text-white/55">/ {seniors.length}</p>
                        </div>
                      </RingChart>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                        <div>
                          <dt className="text-white/55">출석 어르신</dt>
                          <dd className="tnum mt-1 text-[16px] font-medium">{present}명</dd>
                        </div>
                        <div>
                          <dt className="text-white/55">완수 세션</dt>
                          <dd className="tnum mt-1 text-[16px] font-medium">{completed}회</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="text-white/55">다음 운동</dt>
                          <dd className="mt-1 inline-flex items-center gap-2 text-[14px] font-medium">
                            <Clock className="h-4 w-4 text-lime" />
                            {next ? `${next.time} · ${next.title.split(' · ')[1] ?? next.title}` : '예정 없음'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-[13px] text-white/60">
                      <span>기관 프로필 미리보기</span>
                      <span className="tnum">{step + 1} / 3</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime font-serif text-[18px] font-medium text-ink">{draft.name.trim().slice(0, 1) || '기'}</span>
                      <div className="min-w-0">
                        <p className={`truncate font-serif text-[20px] font-medium leading-tight ${draft.name.trim() ? 'text-white' : 'text-white/35'}`}>{draft.name.trim() || '기관명'}</p>
                        <p className={`mt-1 text-[13px] ${draft.type ? 'text-white/70' : 'text-white/35'}`}>
                          {draft.type || '기관 유형'}
                          {draft.capacity ? ` · 어르신 ${draft.capacity}명` : ''}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[13px]">
                      <Row label="관리자" value={draft.manager.trim()} placeholder="2단계에서 입력" />
                      <Row label="기본 프로그램" value={step >= 2 && program ? `${program.name} · ${draft.slot}` : ''} placeholder="3단계에서 선택" />
                    </dl>
                  </>
                )}
              </div>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-white/55">
              기관 인증 계정 · 접근 로그 기록
              <br />
              {specialties.join(' · ')}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  )
}

function Row({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-white/55">{label}</dt>
      <dd className={`truncate text-right ${value ? 'font-medium text-white' : 'text-white/35'}`}>{value || placeholder}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 폼 부품                                                              */
/* ------------------------------------------------------------------ */

function StepBody({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <div>
      <h1 className="font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-[15px] text-ink-3">{hint}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  )
}

function Choice({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[14px] font-medium text-ink-2">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-3">선택</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`press h-9 rounded-full border px-4 text-[14px] font-medium ${on ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink-2 hover:border-ink/30'}`}>
      {children}
    </button>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<{ className?: string }>
  label: string
  optional?: boolean
  error?: string
}

const errorCls = 'border-coral focus:border-coral-deep focus:shadow-[0_0_0_3px_rgba(217,75,75,0.18)]'

const inputCls =
  'h-11 w-full rounded-[10px] border bg-white pl-10 text-[16px] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus:outline-none'
// 테두리 색은 상태에 따라 하나만 붙입니다 (둘을 함께 쓰면 어느 쪽이 이길지 정해지지 않습니다)
const calmCls = 'border-ink/15 focus:border-ink focus:shadow-[0_0_0_3px_rgba(198,243,92,0.55)]'

function Field({ icon: Icon, label, optional, error, id, ...rest }: FieldProps) {
  const fid = id ?? `f-${label}`
  return (
    <div>
      <label htmlFor={fid} className="mb-2 block text-[14px] font-medium text-ink-2">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-3">선택</span> : null}
      </label>
      <span className="group relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-ink" />
        <input id={fid} required={!optional} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-error` : undefined} className={`${inputCls} pr-4 ${error ? errorCls : calmCls}`} {...rest} />
      </span>
      {error ? (
        <p id={`${fid}-error`} role="alert" className="mt-2 text-[13px] leading-snug text-coral-deep">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function PasswordField({ label, hint, ok, error, ref, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; ok?: boolean; error?: string; ref?: Ref<HTMLInputElement> }) {
  const [show, setShow] = useState(false)
  const fid = `f-${label}`
  return (
    <div>
      <label htmlFor={fid} className="mb-2 block text-[14px] font-medium text-ink-2">
        {label}
      </label>
      <span className="group relative block">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 transition-colors group-focus-within:text-ink" />
        <input id={fid} ref={ref} required type={show ? 'text' : 'password'} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-error` : undefined} className={`${inputCls} pr-11 ${error ? errorCls : calmCls}`} {...rest} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} aria-pressed={show} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-ink-3 hover:bg-ink/5 hover:text-ink">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? (
        <p id={`${fid}-error`} role="alert" className="mt-2 text-[13px] leading-snug text-coral-deep">
          {error}
        </p>
      ) : hint ? (
        <p className={`tnum mt-2 text-[13px] ${ok ? 'text-lime-deep' : 'text-ink-3'}`}>{hint}</p>
      ) : null}
    </div>
  )
}
