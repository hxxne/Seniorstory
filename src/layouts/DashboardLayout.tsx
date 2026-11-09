import { Activity, ArrowUpRight, ChartLine, House, LogOut, Tablet, Tv, Users } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import { Avatar, Dot, StatusIcon, cx } from '../components/dash'
import { getProgram, programs } from '../data/programs'
import { seniors } from '../data/seniors'
import { logout, useStore } from '../lib/store'
import { openTablet, openTv } from '../lib/launch'

const titles: Record<string, string> = {
  '/dashboard': '관제 홈',
  '/dashboard/seniors': '어르신 관리',
  '/dashboard/programs': '운동 프로그램',
  '/dashboard/biometrics': '바이오메트릭',
}

/* 대시보드 셸: 옅은 회색 사이드바(244px)와 흰 본문. 32px 내비 행, 44px 머리줄 */
export default function DashboardLayout() {
  const institution = useStore((s) => s.institution)
  const session = useStore((s) => s.session)
  const attendance = useStore((s) => s.attendance)
  const { pathname } = useLocation()

  if (!institution) return <Navigate to="/login" replace />

  const program = getProgram(session.programId)
  const live = session.status === 'playing' || session.status === 'paused' || session.status === 'emergency'
  const liveLabel = session.status === 'playing' ? '송출 중' : session.status === 'emergency' ? '긴급 일시정지' : '일시정지'
  const present = seniors.filter((s) => attendance[s.id]).length
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })

  const nav = [
    { to: '/dashboard', label: '관제 홈', icon: House, end: true, count: null as string | null },
    { to: '/dashboard/seniors', label: '어르신 관리', icon: Users, count: `${present}/${seniors.length}` },
    { to: '/dashboard/programs', label: '운동 프로그램', icon: Activity, count: `${programs.length}` },
    { to: '/dashboard/biometrics', label: '바이오메트릭', icon: ChartLine, count: null },
  ]
  const row = 'press flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-[13.5px]'
  const idleRow = 'text-d-2 hover:bg-d-hover hover:text-d-1'

  return (
    <div className="font-dash min-h-screen bg-white text-[14px] text-d-1 lg:grid lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-d-line bg-d-side px-3 py-2 lg:h-screen lg:flex-col lg:items-stretch lg:justify-start lg:gap-0 lg:border-b-0 lg:border-r lg:py-3">
        {/* 기관 */}
        <NavLink to="/dashboard" aria-label="관제 홈" className="flex h-9 min-w-0 items-center gap-2.5 rounded-md px-2 hover:bg-d-hover">
          <Logo compact tone="neutral" size={22} />
          <span className="hidden min-w-0 truncate text-[14px] font-semibold tracking-[-0.01em] lg:block">{institution.name}</span>
        </NavLink>

        <nav className="flex items-center gap-0.5 lg:mt-4 lg:flex-col lg:items-stretch">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} aria-label={n.label} className={({ isActive }) => cx(row, isActive ? 'bg-d-active font-medium text-d-1 [&>svg]:text-d-1' : idleRow)}>
              <n.icon className="h-4 w-4 shrink-0 text-d-3" />
              <span className="hidden lg:inline">{n.label}</span>
              {n.count ? <span className="tnum ml-auto hidden text-[12px] font-normal text-d-3 lg:inline">{n.count}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:mt-6 lg:block">
          <p className="mb-1 px-2 text-[12px] font-medium text-d-3">하드웨어</p>
          <button type="button" onClick={openTv} className={cx(row, idleRow, 'group')}>
            <Tv className="h-4 w-4 shrink-0 text-d-3" />
            <span>스마트 TV</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-d-3 group-hover:hidden">
              <Dot tone={session.status === 'playing' ? 'live' : live ? 'warn' : 'idle'} pulse={session.status === 'playing'} />
              {live ? liveLabel : '대기'}
            </span>
            <ArrowUpRight className="ml-auto hidden h-4 w-4 text-d-3 group-hover:block" />
          </button>
          <button type="button" onClick={openTablet} className={cx(row, idleRow, 'group')}>
            <Tablet className="h-4 w-4 shrink-0 text-d-3" />
            <span>태블릿</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-d-3 group-hover:hidden">
              <Dot tone="ok" />
              연결
            </span>
            <ArrowUpRight className="ml-auto hidden h-4 w-4 text-d-3 group-hover:block" />
          </button>
        </div>

        {/* 진행 중인 세션 */}
        {live && program ? (
          <div className="hidden lg:mt-6 lg:block">
            <p className="mb-1 px-2 text-[12px] font-medium text-d-3">진행 중</p>
            <Link to="/tablet" className={cx(row, idleRow, 'h-auto items-start py-1.5')}>
              <StatusIcon kind={session.status === 'playing' ? 'progress' : session.status === 'emergency' ? 'alert' : 'paused'} value={(session.stageIndex + 0.5) / program.stages.length} className="mt-0.5" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-d-1">{program.name}</span>
                <span className="tnum block text-[12px] text-d-3">
                  {session.stageIndex + 1} / {program.stages.length}단계 · {liveLabel}
                </span>
              </span>
            </Link>
          </div>
        ) : null}

        {/* 관리자 */}
        <div className="hidden items-center gap-2.5 border-t border-d-line px-2 pt-3 lg:mt-auto lg:flex">
          <Avatar name={institution.manager} size={26} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-medium">{institution.manager}</p>
            <p className="truncate text-[12px] text-d-3">{institution.email}</p>
          </div>
          <button type="button" aria-label="로그아웃" title="로그아웃" onClick={logout} className="press grid h-7 w-7 shrink-0 place-items-center rounded-md text-d-3 hover:bg-d-hover hover:text-d-1">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <button type="button" aria-label="로그아웃" onClick={logout} className="press grid h-8 w-8 shrink-0 place-items-center rounded-md text-d-3 hover:bg-d-hover hover:text-d-1 lg:hidden">
          <LogOut className="h-4 w-4" />
        </button>
      </aside>

      <div className="min-w-0">
        <header className="z-20 flex h-11 items-center justify-between gap-4 border-b border-d-line bg-white/90 px-5 backdrop-blur sm:px-8 lg:sticky lg:top-0">
          <p className="flex min-w-0 items-center gap-2 text-[13px]">
            <span className="hidden truncate text-d-3 sm:inline">{institution.name}</span>
            <span className="hidden text-d-line2 sm:inline">/</span>
            <span className="font-medium text-d-1">{titles[pathname] ?? '대시보드'}</span>
          </p>
          <p className="tnum flex shrink-0 items-center gap-3 text-[13px] text-d-3">
            <span className="hidden md:inline">{today}</span>
            <span className="inline-flex items-center gap-1.5 text-d-2">
              <Dot tone={session.status === 'playing' ? 'live' : live ? 'warn' : 'idle'} pulse={session.status === 'playing'} />
              {live && program ? `${liveLabel} · ${session.stageIndex + 1}단계` : session.status === 'completed' ? '세션 완료' : '세션 대기'}
            </span>
          </p>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
