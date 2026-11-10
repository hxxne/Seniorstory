import { useEffect, useState } from 'react'
import { ArrowRight, CalendarDays, CircleCheck, Play, Tablet, Tv, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Figure from '../../components/Figure'
import Logo from '../../components/Logo'
import { AreaChart, Avatar, Btn, CheckBox, Dot, Label, Page, SectionHead, StatusIcon, TextLink, cx, statusLabel, statusTone, type StatusKind } from '../../components/dash'
import { CueBar } from '../../components/ui/Primitives'
import { kpis } from '../../data/metrics'
import { getProgram, phaseAt, stageDuration } from '../../data/programs'
import { nextExercise, scheduleStatus, todaySchedule } from '../../data/schedule'
import { riskConditions, seniors } from '../../data/seniors'
import { asset } from '../../lib/asset'
import { openTablet, openTv } from '../../lib/launch'
import { dismissOnboarding, startProgram, toggleAttendance, useStore, type OnboardingStep } from '../../lib/store'
import { fmtClock, useStageClock } from '../../lib/useStageClock'

const kindLabel = { exercise: '운동', cognitive: '인지', consult: '상담' } as const

export default function Home() {
  const navigate = useNavigate()
  const institution = useStore((s) => s.institution)
  const attendance = useStore((s) => s.attendance)
  const completedToday = useStore((s) => s.completedSessionsToday)
  const onboarding = useStore((s) => s.onboarding)
  const { session, program, stage, remaining, progress, current, elapsed } = useStageClock(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [clock, setClock] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 20000)
    return () => window.clearInterval(id)
  }, [])

  const present = seniors.filter((s) => attendance[s.id])
  const next = nextExercise(clock)
  // 오늘 운동이 모두 지난 뒤에는 같은 시간표의 내일 첫 세션을 보여 줍니다
  const tomorrow = !!next && scheduleStatus(next, clock) === 'done'
  const upcoming = getProgram(next?.programId) ?? getProgram(institution?.defaultProgram) ?? null
  const shown = program ?? upcoming
  const live = session.status === 'playing' || session.status === 'paused' || session.status === 'emergency'
  const done = session.status === 'completed'
  const liveLabel = session.status === 'playing' ? '송출 중' : session.status === 'emergency' ? '긴급 일시정지' : '일시정지'

  // 오늘 출석한 어르신 중 밀착 보조가 필요한 분: 고위험 질환이 있거나 메모가 있는 경우
  const watch = present.filter((s) => s.note || s.conditions.some((c) => riskConditions.has(c)))

  const launch = (programId: string) => {
    startProgram(programId, false)
    const tv = openTv()
    const tab = openTablet()
    if (!tv && !tab) navigate('/tablet')
  }

  const steps: { key: OnboardingStep; title: string; run: () => void }[] = [
    { key: 'attendance', title: '출석 체크', run: () => document.getElementById('attendance')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) },
    { key: 'tv', title: '스마트 TV 켜기', run: () => void openTv() },
    { key: 'tablet', title: '태블릿 연결', run: () => void openTablet() },
    { key: 'session', title: '첫 세션 시작', run: () => shown && launch(shown.id) },
  ]
  const doneCount = steps.filter((s) => onboarding[s.key]).length
  const showOnboarding = !onboarding.dismissed && doneCount < steps.length

  const guide = shown?.safetyGuide ?? []
  const checkKey = (i: number) => `${shown?.id}:${i}`
  const checkedCount = guide.filter((_, i) => checked[checkKey(i)]).length

  const [attendanceKpi, completionKpi] = kpis
  const lastIdx = attendanceKpi.series.length - 1
  const delta = (series: number[]) => series[lastIdx] - series[lastIdx - 1]

  const today = clock.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
  const hhmm = clock.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
  const sessionDot = session.status === 'playing' ? 'live' : live ? 'warn' : done ? 'ok' : 'accent'

  return (
    <>
      {/* 표지: 운동실 사진 한 장 */}
      <div className="h-36 overflow-hidden bg-d-side sm:h-44 lg:h-[200px]">
        <img src={asset('/landing/room.webp')} alt="" className="h-full w-full object-cover" style={{ objectPosition: '50% 44%' }} />
      </div>

      <Page>
        <div className="relative -mt-9 grid h-[72px] w-[72px] place-items-center rounded-2xl bg-white shadow-[0_0_0_1px_rgba(16,24,40,0.07),0_6px_16px_-4px_rgba(16,24,40,0.14)]">
          <Logo compact tone="neutral" size={40} />
        </div>

        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.025em]">{institution?.name}</h1>
        <ul className="tnum mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-d-2">
          <li className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-d-3" /> {today}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-d-3" /> 출석 {present.length} / {seniors.length}명
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Tv className="h-4 w-4 text-d-3" /> 스마트 TV {live ? liveLabel : '대기'}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <CircleCheck className="h-4 w-4 text-d-3" /> 오늘 완수 {completedToday}회
          </li>
        </ul>

        {/* 시작 체크리스트: 첫 세션을 마칠 때까지만 */}
        {showOnboarding ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-1 gap-y-1 rounded-lg bg-d-side py-1.5 pl-3.5 pr-1.5">
            <p className="tnum mr-2 text-[13px] font-medium">
              첫 세션까지 {doneCount} / {steps.length}
            </p>
            <ol className="flex flex-1 flex-wrap items-center gap-x-1">
              {steps.map((s) => {
                const ok = onboarding[s.key]
                return (
                  <li key={s.key}>
                    <button type="button" onClick={s.run} disabled={ok} className={cx('press inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-[13px]', ok ? 'text-d-3 line-through decoration-d-line2' : 'text-d-1 hover:bg-d-active')}>
                      <StatusIcon kind={ok ? 'done' : 'todo'} />
                      {s.title}
                    </button>
                  </li>
                )
              })}
            </ol>
            <button type="button" onClick={dismissOnboarding} aria-label="시작 체크리스트 닫기" className="press grid h-8 w-8 place-items-center rounded-md text-d-3 hover:bg-d-active hover:text-d-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* 1. 세션 */}
        <section className="mt-10 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_392px] lg:items-start">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-d-2">
              <Dot tone={sessionDot} pulse={session.status === 'playing'} />
              <span className="font-medium text-d-1">{live ? liveLabel : done ? '오늘 세션 완료' : next ? (tomorrow ? '내일 첫 세션' : '다음 세션') : '예정된 세션 없음'}</span>
              {!live && !done && next ? (
                <span className="text-d-3">
                  {next.place} · {next.staff}
                </span>
              ) : null}
            </p>

            <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
              <p className="tnum text-[60px] font-semibold leading-[0.95] tracking-[-0.04em]">{live ? fmtClock(remaining) : done ? '완료' : (next?.time ?? '--:--')}</p>
              <div className="pb-1">
                <p className="text-[18px] font-semibold leading-tight tracking-[-0.01em]">{shown ? shown.name : '오늘 운동이 모두 끝났습니다'}</p>
                <p className="mt-1 text-[13px] text-d-3">{live && stage ? `${session.stageIndex + 1}단계 ${stage.title} · 남은 시간` : shown?.tagline}</p>
              </div>
            </div>

            {/* 3단계: 길이가 곧 시간 */}
            {shown ? (
              <ol className="mt-8 flex gap-1.5">
                {shown.stages.map((s, i) => {
                  const active = live && i === session.stageIndex
                  const past = done || (live && i < session.stageIndex)
                  const kind: StatusKind = past ? 'done' : active ? (session.status === 'playing' ? 'progress' : session.status === 'emergency' ? 'alert' : 'paused') : 'todo'
                  return (
                    <li key={s.id} className="min-w-0" style={{ flex: `${stageDuration(s)} 1 0%` }}>
                      <div className="h-1 overflow-hidden rounded-full bg-d-line">
                        <div className="h-full rounded-full bg-d-a transition-[width] duration-500 ease-linear" style={{ width: `${(past ? 1 : active ? progress : 0) * 100}%` }} />
                      </div>
                      <p className={cx('mt-3 flex items-center gap-1.5 text-[13px]', active ? 'font-medium text-d-1' : 'text-d-2')}>
                        <StatusIcon kind={kind} value={progress} />
                        <span className="truncate">{s.title}</span>
                      </p>
                      <p className="tnum mt-0.5 pl-[22px] text-[12px] text-d-3">{Math.round(stageDuration(s) / 60)}분</p>
                    </li>
                  )
                })}
              </ol>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {live ? (
                <Btn variant="primary" size="lg" onClick={() => navigate('/tablet')}>
                  컨트롤러로 이동 <ArrowRight className="h-4 w-4" />
                </Btn>
              ) : (
                <Btn variant="primary" size="lg" disabled={!shown} onClick={() => shown && launch(shown.id)}>
                  <Play className="h-4 w-4 fill-current" /> 오늘의 운동 시작하기
                </Btn>
              )}
              <Btn size="lg" onClick={openTv}>
                <Tv className="h-4 w-4 text-d-3" /> 스마트 TV 화면 열기
              </Btn>
              <Btn size="lg" onClick={openTablet}>
                <Tablet className="h-4 w-4 text-d-3" /> 태블릿 컨트롤러 열기
              </Btn>
            </div>
          </div>

          {/* 스마트 TV 미리보기: 실제 TV 화면의 축소판 */}
          <figure className="max-w-[560px] lg:max-w-none">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0B0D11] text-white shadow-[0_0_0_1px_rgba(16,24,40,0.1),0_18px_36px_-18px_rgba(16,24,40,0.45)]">
              {live && stage && current && current.move.detail && session.status !== 'emergency' ? (
                <>
                  <img src={asset(current.move.detail.poster)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <p className="tnum absolute left-1/2 top-2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-1 text-[10px] text-white/85">
                    <Dot tone={session.status === 'playing' ? 'live' : 'warn'} pulse={session.status === 'playing'} />
                    {session.stageIndex + 1}단계 · {current.move.name} · {fmtClock(remaining)}
                  </p>
                </>
              ) : live && stage && current ? (
                <>
                  <p className="absolute left-3.5 top-3 flex items-center gap-1.5 text-[11px] text-white/70">
                    <Dot tone={session.status === 'playing' ? 'live' : 'warn'} pulse={session.status === 'playing'} />
                    {session.stageIndex + 1}단계 · {stage.title}
                  </p>
                  <p className="tnum absolute right-3.5 top-2.5 text-[18px] font-semibold leading-none">{fmtClock(remaining)}</p>
                  <div className="absolute inset-0 grid place-items-center pb-9 pt-5">
                    <Figure className="!h-[64%]" color="#E6EAF2" floor="#4A5261" />
                  </div>
                  <div className="absolute inset-x-2.5 bottom-2.5">
                    <CueBar size="sm" className="!rounded-md !bg-black/80 !py-1.5 !text-[12px]">
                      {session.status === 'emergency' ? '잠시 쉬어가요' : (phaseAt(current.move, elapsed - current.startSec)?.cue ?? current.move.cue)}
                    </CueBar>
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <Logo compact tone="neutral" inverse size={18} className="opacity-80" />
                    <p className="tnum mt-3 text-[40px] font-semibold leading-none tracking-[-0.03em]">{done ? '완료' : hhmm}</p>
                    <p className="tnum mt-2.5 text-[11px] text-white/55">{done ? '오늘 운동을 모두 마쳤습니다' : next ? `다음 운동 ${next.time} · ${shown?.name ?? ''}` : '오늘 예정된 운동이 없습니다'}</p>
                  </div>
                </div>
              )}
            </div>
            <figcaption className="mt-3 flex items-center justify-between text-[12px] text-d-3">
              <span>스마트 TV 미리보기</span>
              <span className="inline-flex items-center gap-1.5">
                <Dot tone={session.status === 'playing' ? 'live' : live ? 'warn' : 'idle'} />
                {live ? liveLabel : done ? '완료 화면' : '대기 화면'}
              </span>
            </figcaption>
          </figure>
        </section>

        <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0 space-y-12">
          {/* 2. 출석 체크 */}
          <section id="attendance">
            <SectionHead title={live ? '어르신 상태' : '출석 체크'} count={`${present.length} / ${seniors.length}명`} aside={<TextLink to="/dashboard/seniors">명단 관리</TextLink>} />
            {live ? (
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {seniors
                  .filter((s) => s.id in session.seniorStatus)
                  .map((s) => {
                    const st = session.seniorStatus[s.id]
                    return (
                      <li key={s.id} className="flex h-10 items-center gap-2.5 border-b border-d-line">
                        <Avatar name={s.name} size={22} />
                        <span className="flex-1 truncate">{s.name}</span>
                        <Label tone={statusTone[st]}>{statusLabel[st]}</Label>
                      </li>
                    )
                  })}
              </ul>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {seniors.map((s) => {
                  const on = !!attendance[s.id]
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleAttendance(s.id)}
                        className={cx('press inline-flex h-8 items-center gap-1.5 rounded-full border pl-1 pr-3 text-[13.5px]', on ? 'border-d-line2 bg-white text-d-1 hover:bg-d-hover' : 'border-dashed border-d-line2 text-d-3 hover:border-solid hover:text-d-1')}
                      >
                        <Avatar name={s.name} size={22} dim={!on} />
                        {s.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-4 text-[12px] text-d-3">{live ? '세션 중에는 태블릿에서 상태를 바꿉니다' : '이름을 누르면 출석이 바뀝니다. 점선은 미출석입니다'}</p>
          </section>

          {/* 4. 오늘 일정 */}
          <section>
            <SectionHead title="오늘 일정" count={`${todaySchedule.length}건`} />
            <ol>
              {todaySchedule.map((item) => {
                const st = scheduleStatus(item, clock)
                const prog = getProgram(item.programId)
                const isLiveItem = live && prog && prog.id === program?.id
                const kind: StatusKind = isLiveItem ? (session.status === 'playing' ? 'progress' : session.status === 'emergency' ? 'alert' : 'paused') : st === 'done' ? 'done' : 'todo'
                return (
                  <li key={item.id} className="flex min-h-[48px] items-center gap-3 border-b border-d-line py-2">
                    <StatusIcon kind={kind} />
                    <span className={cx('tnum w-11 shrink-0', st === 'done' ? 'text-d-3' : 'font-medium')}>{item.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cx('truncate', st === 'done' && 'text-d-3')}>{item.title}</p>
                      <p className="truncate text-[12px] text-d-3">
                        {kindLabel[item.kind]} · {item.place} · {item.staff}
                      </p>
                    </div>
                    {isLiveItem ? (
                      <Label tone={session.status === 'playing' ? 'live' : session.status === 'emergency' ? 'bad' : 'warn'}>{liveLabel}</Label>
                    ) : st === 'done' ? (
                      <span className="text-[12px] text-d-3">마침</span>
                    ) : prog && !live ? (
                      <Btn size="sm" onClick={() => launch(prog.id)}>
                        <Play className="h-3.5 w-3.5 fill-current text-d-3" /> 시작
                      </Btn>
                    ) : (
                      <span className="text-[12px] text-d-3">예정</span>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>

          </div>
          <div className="min-w-0 space-y-12">
          {/* 3. 살펴볼 어르신 */}
          <section>
            <SectionHead title="살펴볼 어르신" count={`출석 중 ${watch.length}명`} />
            {watch.length ? (
              <ul>
                {watch.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex gap-3 border-b border-d-line py-3">
                    <Avatar name={s.name} size={28} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">
                          {s.name} <span className="tnum font-normal text-d-3">{s.age}세</span>
                        </span>
                        <span className="tnum shrink-0 text-[12px] text-d-3">
                          {s.room}호 · {s.mobility}
                        </span>
                      </p>
                      <p className="mt-1.5 flex flex-wrap gap-1">
                        {s.conditions.map((c) => (
                          <Label key={c} tone={riskConditions.has(c) ? 'bad' : undefined}>
                            {c}
                          </Label>
                        ))}
                      </p>
                      {s.note ? <p className="mt-1.5 text-[13px] leading-snug text-d-2">{s.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13px] leading-relaxed text-d-3">오늘 출석한 어르신 중 밀착 보조가 필요한 분이 없습니다</p>
            )}
            {watch.length > 4 ? <p className="tnum mt-3 text-[12px] text-d-3">외 {watch.length - 4}명</p> : null}
          </section>

          {/* 5. 이번 주 */}
          <section>
            <SectionHead title="출석률 추이" count="최근 12주" aside={<TextLink to="/dashboard/biometrics">운동 기록</TextLink>} />
            <dl className="mt-4 flex gap-10">
              {[attendanceKpi, completionKpi].map((k) => (
                <div key={k.id}>
                  <dt className="text-[12px] text-d-3">{k.label}</dt>
                  <dd className="tnum mt-1 flex items-baseline gap-2">
                    <span className="text-[26px] font-semibold leading-none tracking-[-0.02em]">
                      {k.series[lastIdx]}
                      <span className="ml-0.5 text-[14px] font-normal text-d-3">%</span>
                    </span>
                    <span className="text-[12px] font-medium text-d-ok">+{delta(k.series)}%p</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <AreaChart data={attendanceKpi.series} labels={attendanceKpi.labels} unit="%" target={attendanceKpi.target} height={128} />
            </div>
          </section>

          </div>
          {/* 6. 세션 전 안전 점검 */}
          {shown && guide.length ? (
            <section className="lg:col-span-2">
              <SectionHead title="세션 전 안전 점검" count={`${checkedCount} / ${guide.length} 확인`} aside={shown.name} />
              <ul className="grid gap-x-12 md:grid-cols-2">
                {guide.map((g, i) => {
                  const on = !!checked[checkKey(i)]
                  return (
                    <li key={g.title} className="border-b border-d-line">
                      <button type="button" role="checkbox" aria-checked={on} onClick={() => setChecked((c) => ({ ...c, [checkKey(i)]: !on }))} className="flex w-full gap-3 py-3 text-left">
                        <CheckBox on={on} />
                        <span className="min-w-0">
                          <span className={cx('block', on ? 'text-d-3 line-through decoration-d-line2' : 'font-medium')}>{g.title}</span>
                          <span className="mt-0.5 block text-[13px] leading-snug text-d-3">{g.detail}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </Page>
    </>
  )
}
