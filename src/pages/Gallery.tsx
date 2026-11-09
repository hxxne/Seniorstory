import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Check, Pause, Play, SkipForward } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Figure from '../components/Figure'
import RingChart from '../components/ui/RingChart'
import Sparkline from '../components/ui/Sparkline'
import { CueBar } from '../components/ui/Primitives'
import { kpis } from '../data/metrics'
import { programs, stageDuration, toneClass, type Program } from '../data/programs'
import { todaySchedule } from '../data/schedule'
import { seniors } from '../data/seniors'

const ease = [0.22, 1, 0.36, 1] as const

type Cat = 'all' | 'hardware' | 'dashboard' | 'program'
const cats: { id: Cat; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'hardware', label: '하드웨어' },
  { id: 'dashboard', label: '대시보드' },
  { id: 'program', label: '프로그램' },
]

interface Screen {
  id: string
  title: string
  tag: string
  cat: Exclude<Cat, 'all'>
  to: string
  preview: ReactNode
}

/* 갤러리 = 제품의 실제 화면. 카드를 누르면 해당 화면이 열립니다 */
const screens: Screen[] = [
  { id: 'tv-live', title: '스마트 TV 송출', tag: '하드웨어', cat: 'hardware', to: '/tv', preview: <TvLive /> },
  { id: 'home', title: '통합 관제 홈', tag: '대시보드', cat: 'dashboard', to: '/dashboard', preview: <DashHome /> },
  { id: 'p30', title: '통합 프로그램 30분', tag: '프로그램', cat: 'program', to: '/dashboard/programs', preview: <ProgramCard program={programs[0]} /> },
  { id: 'tablet', title: '태블릿 컨트롤러', tag: '하드웨어', cat: 'hardware', to: '/tablet', preview: <TabletCtl /> },
  { id: 'bio', title: '바이오메트릭', tag: '대시보드', cat: 'dashboard', to: '/dashboard/biometrics', preview: <Bio /> },
  { id: 'tv-rest', title: '긴급 휴식 안내', tag: '하드웨어', cat: 'hardware', to: '/tv', preview: <TvRest /> },
  { id: 'seniors', title: '어르신 명단', tag: '대시보드', cat: 'dashboard', to: '/dashboard/seniors', preview: <SeniorsList /> },
  { id: 'p50', title: '통합 프로그램 50분', tag: '프로그램', cat: 'program', to: '/dashboard/programs', preview: <ProgramCard program={programs[1]} /> },
  { id: 'login', title: '기관 로그인', tag: '대시보드', cat: 'dashboard', to: '/login', preview: <AuthMini /> },
  { id: 'tv-idle', title: 'TV 대기 화면', tag: '하드웨어', cat: 'hardware', to: '/tv', preview: <TvIdle /> },
]

export default function Gallery() {
  const [cat, setCat] = useState<Cat>('all')
  const list = cat === 'all' ? screens : screens.filter((s) => s.cat === cat)

  return (
    <div className="min-h-screen bg-[#101312] text-[#F2F4F2]">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-[#101312]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" aria-label="시니어스토리 홈">
              <Logo inverse />
            </Link>
            <nav className="hidden items-center gap-6 text-[14px] text-white/60 md:flex">
              <a href="#screens" className="text-white transition-colors">
                화면
              </a>
              <Link to="/tv" className="transition-colors hover:text-white">
                스마트 TV
              </Link>
              <Link to="/tablet" className="transition-colors hover:text-white">
                태블릿
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-[14px] text-white/60 transition-colors hover:text-white sm:inline">
              로그인
            </Link>
            <Link to="/register" className="press inline-flex h-10 items-center rounded-full bg-[#262B29] px-5 text-[14px] font-medium text-white hover:bg-[#303633]">
              기관 등록
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: 짧게, 가운데로 */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} className="mx-auto max-w-3xl px-6 pb-12 pt-16 text-center md:pt-20">
        <p className="inline-flex h-6 items-center rounded-full border border-tv-cue/40 px-3 text-[12px] font-medium text-tv-cue">30분 · 50분 통합 운동 프로그램</p>
        <h1 className="mt-5 text-[clamp(36px,5vw,68px)] font-extrabold leading-[1.08] tracking-[-0.03em]">
          어르신의 하루에 운동을
          <br />
          요양보호사 손에 <span className="text-tv-cue [text-shadow:0_0_32px_rgba(255,209,102,0.45)]">리모컨</span>을
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-white/60">스마트 TV로 송출하고 태블릿 한 대로 재생과 단계, 긴급 정지를 제어합니다. 아래 화면을 눌러 바로 열어보세요</p>
        <Link to="/login" className="press mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-[17px] font-semibold text-[#101312] hover:bg-[#E8ECE9]">
          기관 로그인 <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.section>

      {/* 필터 */}
      <div id="screens" className="sticky top-16 z-30 scroll-mt-16 bg-[#101312]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div role="tablist" aria-label="화면 분류" className="flex gap-1 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className={`relative h-9 shrink-0 rounded-full px-5 text-[14px] font-medium transition-colors ${cat === c.id ? 'text-white' : 'text-white/60 hover:text-white'}`}
              >
                {cat === c.id ? <motion.span layoutId="landing-cat" className="absolute inset-0 rounded-full bg-[#262B29]" transition={{ duration: 0.2, ease }} /> : null}
                <span className="relative">{c.label}</span>
              </button>
            ))}
          </div>
          <p className="tnum hidden text-[13px] text-white/45 sm:block">화면 {list.length}개</p>
        </div>
      </div>

      {/* 갤러리 */}
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-3 md:px-6">
        <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {list.map((s) => (
            <Link key={s.id} to={s.to} className="group mb-6 block break-inside-avoid">
              <div className="overflow-hidden rounded-[20px] bg-[#1C211F]">
                <div className="transition-transform duration-300 ease-out group-hover:scale-[1.02]">{s.preview}</div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 px-1">
                <p className="truncate text-[15px] font-semibold text-white">
                  {s.title} <span className="ml-1 text-[12px] font-normal text-white/45">{s.tag}</span>
                </p>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-white" />
              </div>
            </Link>
          ))}
        </motion.div>
      </main>

      {/* 마무리 */}
      <section className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-extrabold leading-[1.15] tracking-[-0.02em]">오늘의 운동, 지금 시작하세요</h2>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-white/60">기관 계정으로 로그인하면 대시보드에서 TV와 태블릿을 바로 열 수 있습니다</p>
          <Link to="/login" className="press mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-[17px] font-semibold text-[#101312] hover:bg-[#E8ECE9]">
            기관 로그인 / 등록 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-8 text-[13px] text-white/45 md:flex-row">
          <Logo inverse />
          <p>© 2026 시니어스토리 · contact@seniorstory.example</p>
        </div>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 미리보기: 각 화면을 실제 컴포넌트와 데이터로 축소해 그립니다          */
/* ------------------------------------------------------------------ */

function TvLive() {
  return (
    <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_30%_20%,#1E3A30_0%,#0A110E_65%)]">
      <div className="absolute inset-x-4 top-3 flex items-start justify-between text-white">
        <div>
          <p className="flex items-center gap-2 text-[11px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-coral" /> 송출 중 · 통합 프로그램 30분
          </p>
          <p className="mt-1 text-[15px] font-medium">3단계 · 근력 · 균형</p>
        </div>
        <p className="tnum text-[22px] font-medium leading-none">07:42</p>
      </div>
      <div className="absolute inset-0 grid place-items-center pb-6">
        <Figure className="!h-[52%]" />
      </div>
      <div className="absolute inset-x-3 bottom-3">
        <CueBar className="!bg-black/85">의자 등받이를 잡고 천천히 일어나요</CueBar>
      </div>
    </div>
  )
}

function TvRest() {
  return (
    <div className="flex aspect-[16/11] flex-col items-center justify-center bg-[#0E1512] px-4 text-center text-white">
      <div className="relative grid place-items-center">
        <span className="absolute h-24 w-24 animate-breathe rounded-full bg-moss-400/15" />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-moss-300 text-[13px] font-medium text-moss-900">휴식</span>
      </div>
      <p className="mt-8 font-serif text-[24px] font-medium leading-tight">잠시 쉬어가요</p>
      <p className="mt-2 text-[14px] font-semibold text-tv-cue">천천히 숨을 들이쉬고, 길게 내쉬어요</p>
    </div>
  )
}

function TvIdle() {
  return (
    <div className="flex aspect-[16/9] flex-col items-center justify-center bg-tv-bg text-center text-white">
      <p className="tnum text-[56px] font-medium leading-none tracking-[-0.02em]">09:24</p>
      <p className="mt-3 text-[12px] text-white/55">다음 운동</p>
      <p className="mt-1 text-[14px] font-medium">09:30 · 통합 프로그램 30분</p>
    </div>
  )
}

function TabletCtl() {
  const program = programs[1]
  const people = seniors.slice(0, 6)
  const status = ['normal', 'normal', 'caution', 'normal', 'rest', 'normal'] as const
  const tone = { normal: 'bg-moss-50 text-moss-700', caution: 'bg-amber-soft text-amber-deep', rest: 'bg-coral-soft text-coral-deep' }
  const label = { normal: '정상', caution: '주의', rest: '휴식' }
  return (
    <div className="bg-sand-100 p-3 text-ink">
      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] text-coral-deep">3단계 · 힘 기르기</p>
            <p className="mt-1 text-[18px] font-semibold">근력 · 균형</p>
          </div>
          <RingChart size={52} stroke={5} segments={[{ value: 0.4, color: '#2E7D5B', label: '진행' }]} total={1} animate={false}>
            <span className="tnum text-[11px] font-medium">12:20</span>
          </RingChart>
        </div>
        <CueBar size="sm" className="mt-3">
          무릎을 펴고 5초 버텨요
        </CueBar>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <div className="flex h-10 items-center justify-center gap-2 rounded-lg bg-ink text-[13px] font-medium text-white">
            <Pause className="h-4 w-4" /> 일시정지
          </div>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-ink/10 px-3 text-[13px] font-medium">
            <SkipForward className="h-4 w-4" /> 다음 동작
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {program.stages.map((s, i) => (
          <div key={s.id} className={`rounded-lg py-2 text-center text-[11px] font-medium ${i === 2 ? `${toneClass[s.tone].solid} text-white` : 'bg-white text-ink-3'}`}>
            {s.order}단계
          </div>
        ))}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-1">
        {people.map((p, i) => (
          <li key={p.id} className={`flex items-center justify-between rounded-lg px-3 py-2 text-[12px] ${tone[status[i]]}`}>
            <span className="font-medium">{p.name}</span>
            <span>{label[status[i]]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex h-10 items-center justify-center rounded-lg bg-coral text-[13px] font-medium text-white">전체 긴급 일시정지</div>
    </div>
  )
}

function DashHome() {
  const present = seniors.filter((s) => s.defaultPresent).length
  return (
    <div className="bg-sand-50 p-3 text-ink">
      <div className="rounded-2xl border border-ink/[0.08] bg-white p-4">
        <p className="text-[15px] font-semibold leading-snug">다음 운동 09:30 · 통합 프로그램 30분</p>
        <p className="tnum mt-1 text-[12px] text-ink-3">
          출석 {present} / {seniors.length}명 · 1층 다목적실
        </p>
        <div className="mt-3 flex h-9 items-center justify-center gap-2 rounded-lg bg-moss-600 text-[13px] font-medium text-white">
          <Play className="h-4 w-4" /> 오늘의 운동 시작하기
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[1.3fr_1fr] gap-2">
        <div className="rounded-2xl border border-ink/[0.08] bg-white p-4">
          <p className="text-[12px] font-medium">오늘의 운동 스케줄</p>
          <ul className="mt-2 space-y-2">
            {todaySchedule.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 text-[11px]">
                <span className="tnum w-8 text-ink-3">{s.time}</span>
                <span className={`h-2 w-2 shrink-0 rounded-full ${i === 0 ? 'bg-moss-500' : 'border border-ink/20 bg-white'}`} />
                <span className="truncate text-ink-2">{s.title.split(' · ')[0]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid place-items-center rounded-2xl border border-ink/[0.08] bg-white p-3">
          <RingChart size={84} stroke={9} segments={[{ value: present, color: '#2E7D5B', label: '출석' }]} total={seniors.length} animate={false}>
            <div className="text-center">
              <p className="tnum text-[18px] font-semibold leading-none">{Math.round((present / seniors.length) * 100)}%</p>
              <p className="mt-1 text-[11px] text-ink-3">출석률</p>
            </div>
          </RingChart>
        </div>
      </div>
    </div>
  )
}

function SeniorsList() {
  const rows = seniors.slice(0, 6)
  const present = seniors.filter((s) => s.defaultPresent).length
  return (
    <div className="bg-white text-ink">
      <div className="flex items-baseline justify-between border-b border-ink/[0.08] px-4 py-3">
        <p className="text-[13px] font-medium">어르신 명단</p>
        <p className="tnum text-[12px] text-ink-3">
          출석 {present} / {seniors.length}명
        </p>
      </div>
      <ul className="divide-y divide-ink/[0.08]">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-2">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium ${s.defaultPresent ? 'bg-moss-100 text-moss-700' : 'bg-sand-100 text-ink-3'}`}>{s.name.slice(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">{s.name}</p>
              <p className="truncate text-[11px] text-ink-3">{s.conditions.join(' · ')}</p>
            </div>
            <span className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium ${s.defaultPresent ? 'bg-moss-600 text-white' : 'border border-ink/10 text-ink-3'}`}>
              {s.defaultPresent ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
              {s.defaultPresent ? '출석' : '미출석'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bio() {
  const [attendance, completion] = kpis
  const last = attendance.series.length - 1
  return (
    <div className="bg-sand-50 p-3 text-ink">
      <div className="rounded-2xl border border-ink/[0.08] bg-white p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[12px] text-ink-2">{attendance.label}</p>
          <p className="tnum text-[11px] text-moss-700">+{attendance.series[last] - attendance.series[last - 1]}% vs 전주</p>
        </div>
        <p className="tnum mt-1 text-[28px] font-semibold leading-none">
          {attendance.series[last]}
          <span className="ml-1 text-[14px] font-medium text-ink-3">%</span>
        </p>
        <div className="mt-6">
          <Sparkline data={attendance.series} labels={attendance.labels} unit="%" color="#2E7D5B" target={attendance.target} height={64} />
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between rounded-2xl border border-ink/[0.08] bg-white px-4 py-3">
        <p className="text-[12px] text-ink-2">{completion.label}</p>
        <p className="tnum text-[18px] font-semibold">{completion.series[last]}%</p>
      </div>
    </div>
  )
}

function ProgramCard({ program }: { program: Program }) {
  const total = program.stages.reduce((a, s) => a + stageDuration(s), 0)
  return (
    <div className="bg-sand-100 p-5 text-ink">
      <p className="text-[12px] text-moss-700">{program.tagline}</p>
      <p className="mt-1 font-serif text-[22px] font-medium leading-tight">{program.name}</p>
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white">
        {program.stages.map((s) => (
          <span key={s.id} className={toneClass[s.tone].solid} style={{ width: `${(stageDuration(s) / total) * 100}%` }} />
        ))}
      </div>
      <ol className="mt-4 space-y-2">
        {program.stages.map((s) => (
          <li key={s.id} className="flex items-center gap-3 text-[13px]">
            <span className={`tnum grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-medium text-white ${toneClass[s.tone].solid}`}>{s.order}</span>
            <span className="flex-1 text-ink">{s.title}</span>
            <span className="tnum text-ink-3">{Math.round(stageDuration(s) / 60)}분</span>
          </li>
        ))}
      </ol>
      <p className="tnum mt-4 border-t border-ink/[0.08] pt-3 text-[12px] text-ink-3">
        동작 {program.stages.reduce((a, s) => a + s.moves.length, 0)}개 · 기대 효과 {program.effects.length}가지 · 안전 가이드 {program.safetyGuide.length}단계
      </p>
    </div>
  )
}

function AuthMini() {
  return (
    <div className="grid aspect-[16/10] grid-cols-2 text-ink">
      <div className="flex flex-col justify-center bg-moss-900 p-4 text-white">
        <p className="font-serif text-[18px] font-medium leading-snug">
          오늘도 {seniors.length}분의
          <br />
          하루가 움직입니다
        </p>
        <p className="mt-2 text-[11px] text-white/55">기관 인증 계정 · 접근 로그 기록</p>
      </div>
      <div className="flex flex-col justify-center bg-sand-50 p-4">
        <div className="grid grid-cols-2 rounded-lg bg-sand-100 p-1 text-center text-[11px] font-medium">
          <span className="rounded-md bg-white py-1 shadow-card">기관 로그인</span>
          <span className="py-1 text-ink-3">기관 등록</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-7 rounded-md border border-ink/10 bg-white" />
          <div className="h-7 rounded-md border border-ink/10 bg-white" />
        </div>
        <div className="mt-3 flex h-8 items-center justify-center rounded-md bg-moss-600 text-[11px] font-medium text-white">대시보드로 들어가기</div>
      </div>
    </div>
  )
}
