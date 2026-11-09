import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, OctagonAlert, Pause, Play, SkipForward, Tablet, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Figure from '../components/Figure'
import { AreaChart, Avatar, Dot, MiniLine, StatusIcon, cx } from '../components/dash'
import { CueBar } from '../components/ui/Primitives'
import { kpis } from '../data/metrics'
import { programs, stageDuration, type Program } from '../data/programs'
import { todaySchedule } from '../data/schedule'
import { riskConditions, seniors } from '../data/seniors'
import { asset } from '../lib/asset'

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
/* 미리보기: 각 화면을 실제 부품과 데이터로 축소해 그립니다.             */
/* 대시보드·태블릿·TV는 지금 화면과 같은 체계(DESIGN.md)를 씁니다         */
/* ------------------------------------------------------------------ */

const ramp = ['#C9D8FB', '#93B0F5', '#5C86EC', '#2F5FE3']
const rampInk = ['#1E3F9E', '#1E3F9E', '#fff', '#fff']
const shortTitle = (t: string) => t.split(' · ')[0]

function TvLive() {
  return (
    <div className="font-dash relative aspect-[16/10]" style={{ background: 'radial-gradient(ellipse at 30% 20%, #2C1C1F 0%, #0B0D11 65%)' }}>
      <div className="absolute inset-x-4 top-3 flex items-start justify-between text-white">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#F06A6A]" /> 송출 중 · 통합 프로그램 30분
          </p>
          <p className="mt-1 text-[15px] font-semibold tracking-[-0.01em]">3단계 · 근력 · 균형</p>
          <div className="mt-2 flex w-28 gap-1">
            {[1, 1, 0.4, 0].map((v, i) => (
              <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <span className="block h-full rounded-full bg-tv-cue" style={{ width: `${v * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/60">남은 시간</p>
          <p className="tnum text-[26px] font-semibold leading-none tracking-[-0.04em]">07:42</p>
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center pb-6 pt-10">
        <Figure className="!h-[48%]" color="#E6EAF2" floor="#4A5261" />
      </div>
      <div className="absolute inset-x-3 bottom-3">
        <CueBar className="!bg-black/85">의자 등받이를 잡고 천천히 일어나요</CueBar>
      </div>
    </div>
  )
}

function TvRest() {
  return (
    <div className="font-dash flex aspect-[16/11] flex-col items-center justify-center bg-[#0B0D11] px-4 text-center text-white">
      <div className="relative grid place-items-center">
        <span className="absolute h-24 w-24 animate-breathe rounded-full bg-white/10" />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white text-[13px] font-semibold text-[#0B0D11]">휴식</span>
      </div>
      <p className="mt-8 text-[24px] font-semibold leading-tight tracking-[-0.03em]">잠시 쉬어가요</p>
      <p className="mt-2 text-[14px] font-semibold text-tv-cue">천천히 숨을 들이쉬고, 길게 내쉬어요</p>
    </div>
  )
}

function TvIdle() {
  return (
    <div className="font-dash flex aspect-[16/9] flex-col items-center justify-center bg-[#0B0D11] text-center text-white">
      <Logo compact tone="neutral" inverse size={20} className="opacity-80" />
      <p className="tnum mt-3 text-[56px] font-semibold leading-none tracking-[-0.04em]">09:24</p>
      <p className="mt-4 w-2/3 border-t border-white/15 pt-3 text-[11px] text-white/55">다음 운동</p>
      <p className="mt-1 text-[14px] font-medium">09:30 · 통합 프로그램 30분</p>
    </div>
  )
}

function TabletCtl() {
  const program = programs[1]
  const people = seniors.slice(0, 6)
  const status = ['normal', 'normal', 'caution', 'normal', 'rest', 'normal'] as const
  const tile = { normal: 'border-d-line2 bg-white', caution: 'border-[#E3C277] bg-d-warnsoft', rest: 'border-[#E9A9A9] bg-d-badsoft' }
  const tone = { normal: 'ok', caution: 'warn', rest: 'bad' } as const
  const label = { normal: '정상', caution: '주의', rest: '휴식' }
  return (
    <div className="font-dash bg-white p-4 text-d-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] text-d-2">
            <StatusIcon kind="progress" value={0.4} size={13} /> 3단계 · 힘 기르기
          </p>
          <p className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.02em]">근력 · 균형</p>
        </div>
        <div className="text-right">
          <p className="tnum text-[30px] font-semibold leading-none tracking-[-0.04em]">12:20</p>
          <p className="mt-1 text-[10px] text-d-3">단계 남은 시간</p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-d-line">
        <div className="h-full w-[40%] rounded-full bg-d-a" />
      </div>
      <CueBar size="sm" className="mt-3">
        무릎을 펴고 5초 버텨요
      </CueBar>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-1.5">
        <div className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-d-1 text-[13px] font-medium text-white">
          <Pause className="h-4 w-4 fill-current" /> 일시정지
        </div>
        <div className="flex h-10 items-center gap-1.5 rounded-lg border border-d-line2 px-3 text-[13px] font-medium">
          <SkipForward className="h-4 w-4 text-d-3" /> 다음 동작
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        {program.stages.map((s, i) => (
          <div key={s.id} className={cx('rounded-lg border px-2 py-1.5 text-[11px]', i === 2 ? 'border-d-a bg-d-asoft font-medium' : 'border-d-line2 text-d-3')}>
            <StatusIcon kind={i < 2 ? 'done' : i === 2 ? 'progress' : 'todo'} value={0.4} size={12} />
            <p className="mt-1">{s.order}단계</p>
          </div>
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-1">
        {people.map((p, i) => (
          <li key={p.id} className={cx('flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[12px]', tile[status[i]])}>
            <Avatar name={p.name} size={18} />
            <span className="flex-1 truncate font-medium">{p.name}</span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Dot tone={tone[status[i]]} />
              {label[status[i]]}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-d-bad text-[13px] font-medium text-white">
        <OctagonAlert className="h-4 w-4" /> 전체 긴급 일시정지
      </div>
    </div>
  )
}

function DashHome() {
  const present = seniors.filter((s) => s.defaultPresent).length
  const program = programs[0]
  return (
    <div className="font-dash bg-white text-d-1">
      <img src={asset('/landing/room.webp')} alt="" className="h-[72px] w-full object-cover" style={{ objectPosition: '50% 44%' }} />
      <div className="px-4 pb-4">
        <div className="relative -mt-4 grid h-9 w-9 place-items-center rounded-lg bg-white shadow-[0_0_0_1px_rgba(16,24,40,0.07),0_4px_10px_-3px_rgba(16,24,40,0.16)]">
          <Logo compact tone="neutral" size={20} />
        </div>
        <p className="mt-2 text-[16px] font-semibold tracking-[-0.02em]">통합 관제 홈</p>
        <p className="tnum mt-0.5 text-[11px] text-d-3">
          출석 {present} / {seniors.length}명 · 스마트 TV 대기 · 오늘 완수 1회
        </p>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-d-3">
          <Dot tone="accent" /> <span className="font-medium text-d-1">다음 세션</span> 1층 다목적실
        </p>
        <div className="mt-1.5 flex items-end gap-3">
          <p className="tnum text-[36px] font-semibold leading-[0.95] tracking-[-0.04em]">09:30</p>
          <p className="pb-0.5 text-[13px] font-semibold">{program.name}</p>
        </div>
        <ol className="mt-3 flex gap-1">
          {program.stages.map((s) => (
            <li key={s.id} className="min-w-0" style={{ flex: `${stageDuration(s)} 1 0%` }}>
              <div className="h-1 rounded-full bg-d-line" />
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-d-2">
                <StatusIcon kind="todo" size={11} />
                <span className="truncate">{shortTitle(s.title)}</span>
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex gap-1.5">
          <div className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-d-a text-[12px] font-medium text-white">
            <Play className="h-3.5 w-3.5 fill-current" /> 오늘의 운동 시작하기
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-md border border-d-line2">
            <Tv className="h-3.5 w-3.5 text-d-3" />
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-md border border-d-line2">
            <Tablet className="h-3.5 w-3.5 text-d-3" />
          </div>
        </div>

        <p className="mt-5 border-b border-d-line pb-1.5 text-[12px] font-semibold">
          오늘 일정 <span className="tnum font-normal text-d-3">{todaySchedule.length}건</span>
        </p>
        <ul>
          {todaySchedule.map((s, i) => (
            <li key={s.id} className="flex h-7 items-center gap-2 border-b border-d-line text-[11px]">
              <StatusIcon kind={i === 0 ? 'done' : 'todo'} size={12} />
              <span className={cx('tnum w-8', i === 0 ? 'text-d-3' : 'font-medium')}>{s.time}</span>
              <span className={cx('truncate', i === 0 ? 'text-d-3' : 'text-d-2')}>{shortTitle(s.title)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SeniorsList() {
  const rows = seniors.filter((s) => s.defaultPresent).slice(0, 5)
  const present = seniors.filter((s) => s.defaultPresent).length
  return (
    <div className="font-dash bg-white px-4 pb-1 pt-3.5 text-d-1">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[16px] font-semibold tracking-[-0.02em]">어르신 명단</p>
        <p className="tnum text-[11px] text-d-3">
          등록 {seniors.length}명 · 출석 {present}명
        </p>
      </div>
      <p className="-mx-4 mt-3 flex h-7 items-center gap-1.5 border-y border-d-line bg-d-side px-4 text-[11px] font-medium">
        <StatusIcon kind="done" size={12} /> 출석 <span className="tnum font-normal text-d-3">{present}</span>
      </p>
      <ul>
        {rows.map((s) => (
          <li key={s.id} className="flex items-center gap-2.5 border-b border-d-line py-2 last:border-b-0">
            <Avatar name={s.name} size={24} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium">
                {s.name} <span className="tnum text-[11px] font-normal text-d-3">{s.age}세 · {s.room}호</span>
              </p>
              <p className="mt-1 flex flex-wrap gap-1">
                {s.conditions.map((c) => (
                  <span key={c} className="inline-flex h-[18px] items-center gap-1 rounded-full border border-d-line2 px-1.5 text-[10px] text-d-2">
                    {riskConditions.has(c) ? <span className="h-1.5 w-1.5 rounded-full bg-d-bad" /> : null}
                    {c}
                  </span>
                ))}
              </p>
            </div>
            <span className="relative h-4 w-7 shrink-0 rounded-full bg-d-a" aria-hidden>
              <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Bio() {
  const pair = kpis.slice(0, 2)
  const [attendance] = kpis
  return (
    <div className="font-dash bg-white text-d-1">
      <div className="grid grid-cols-2 border-b border-d-line">
        {pair.map((k, i) => {
          const last = k.series.length - 1
          return (
            <div key={k.id} className={cx('relative px-4 py-3', i > 0 && 'border-l border-d-line')}>
              {i === 0 ? <span className="absolute inset-x-0 top-0 h-0.5 bg-d-a" /> : null}
              <p className={cx('text-[11px]', i === 0 ? 'font-medium' : 'text-d-2')}>{k.label}</p>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <p className="tnum text-[24px] font-semibold leading-none tracking-[-0.025em]">
                  {k.series[last]}
                  <span className="ml-0.5 text-[11px] font-normal tracking-normal text-d-3">{k.unit}</span>
                </p>
                <MiniLine data={k.series} color={i === 0 ? '#2F5FE3' : '#B9B9C0'} width={48} height={18} />
              </div>
              <p className="tnum mt-1.5 text-[10px] font-medium text-d-ok">
                +{k.series[last] - k.series[last - 1]}%p <span className="font-normal text-d-3">전주 대비</span>
              </p>
            </div>
          )
        })}
      </div>
      <div className="px-4 pb-4 pt-5">
        <AreaChart data={attendance.series} labels={attendance.labels} unit="%" target={attendance.target} height={112} />
      </div>
    </div>
  )
}

function ProgramCard({ program }: { program: Program }) {
  const first = program.id === 'p30'
  return (
    <div className="font-dash bg-white text-d-1">
      <img src={asset(first ? '/landing/stretch.webp' : '/landing/hero.webp')} alt="" className="h-28 w-full object-cover" style={{ objectPosition: first ? '50% 30%' : '50% 42%' }} />
      <div className="p-4">
        <p className="text-[11px] font-medium text-d-a">{program.tagline}</p>
        <p className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.02em]">{program.name}</p>
        <div className="mt-3.5 flex gap-1">
          {program.stages.map((s, i) => (
            <span key={s.id} className="h-1.5 rounded-full" style={{ flex: `${stageDuration(s)} 1 0%`, background: ramp[i] }} />
          ))}
        </div>
        <ol className="mt-2">
          {program.stages.map((s, i) => (
            <li key={s.id} className="flex h-8 items-center gap-2 border-b border-d-line text-[12.5px]">
              <span className="tnum grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[10px] font-semibold" style={{ background: ramp[i], color: rampInk[i] }}>
                {s.order}
              </span>
              <span className="flex-1">{s.title}</span>
              <span className="tnum text-[11px] text-d-3">{Math.round(stageDuration(s) / 60)}분</span>
            </li>
          ))}
        </ol>
        <p className="tnum mt-3 text-[11px] text-d-3">
          동작 {program.stages.reduce((a, s) => a + s.moves.length, 0)}개 · 기대 효과 {program.effects.length}가지 · 안전 가이드 {program.safetyGuide.length}단계
        </p>
      </div>
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
