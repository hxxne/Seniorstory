import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, LayoutDashboard, OctagonAlert, Pause, Play, RotateCcw, SkipForward, Tv } from 'lucide-react'
import Logo from '../components/Logo'
import { Avatar, Btn, Dot, StatusIcon, cx, statusLabel, statusTone, type StatusKind } from '../components/dash'
import { CueBar } from '../components/ui/Primitives'
import { phaseAt, programs, stageDuration } from '../data/programs'
import { seniors } from '../data/seniors'
import { openTv } from '../lib/launch'
import { cycleSeniorStatus, emergencyStop, endSession, gotoStage, nextMove, play, startProgram, togglePlay, useStore } from '../lib/store'
import { fmtClock, useStageClock } from '../lib/useStageClock'

const ease = [0.22, 1, 0.36, 1] as const
const ramp = ['#C9D8FB', '#93B0F5', '#2F5FE3']
const tile = {
  normal: 'border-d-line2 bg-white',
  caution: 'border-[#E3C277] bg-d-warnsoft',
  rest: 'border-[#E9A9A9] bg-d-badsoft',
} as const

/* 태블릿 컨트롤러: 대시보드와 같은 체계, 손가락 크기의 컨트롤 (56~64px) */
export default function Tablet() {
  const attendance = useStore((s) => s.attendance)
  const { session, program, stage, remaining, progress, current, elapsed } = useStageClock(true)
  const phase = current ? phaseAt(current.move, elapsed - current.startSec) : null
  const present = seniors.filter((s) => attendance[s.id])
  const active = session.status !== 'idle'
  const playing = session.status === 'playing'
  const emergency = session.status === 'emergency'
  const counts = (k: 'normal' | 'caution' | 'rest') => Object.values(session.seniorStatus).filter((v) => v === k).length

  return (
    <div className="font-dash flex min-h-screen flex-col bg-white text-[15px] text-d-1">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-d-line px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo compact tone="neutral" size={26} />
          <div className="min-w-0 leading-tight">
            <p className="text-[14px] font-semibold">태블릿 컨트롤러</p>
            <p className="tnum truncate text-[12px] text-d-3">{program ? `${program.name} · ${session.stageIndex + 1} / ${program.stages.length}단계` : '세션 대기'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-2 hidden items-center gap-1.5 text-[13px] text-d-2 sm:inline-flex">
            <Dot tone={playing ? 'live' : 'ok'} pulse={playing} />
            {playing ? 'TV 송출 중' : 'TV 연결됨'}
          </span>
          <Btn size="lg" onClick={openTv}>
            <Tv className="h-4 w-4 text-d-3" /> <span className="hidden sm:inline">TV 열기</span>
          </Btn>
          <Btn size="lg" variant="ghost" to="/dashboard">
            <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">대시보드</span>
          </Btn>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {!active ? (
          /* ---------- 프로그램 선택 ---------- */
          <motion.main key="picker" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease }} className="mx-auto w-full max-w-4xl flex-1 px-5 pb-16 pt-10 md:px-8 md:pt-16">
            <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em]">어떤 프로그램으로 시작할까요</h1>
            <p className="tnum mt-2 text-d-2">출석 어르신 {present.length}명 · 재생을 누르면 TV 화면이 바로 켜집니다</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {programs.map((p) => (
                <button key={p.id} type="button" onClick={() => startProgram(p.id, true)} className="press group rounded-2xl border border-d-line2 p-6 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-d-a">
                  <p className="text-[13px] font-medium text-d-a">{p.tagline}</p>
                  <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.02em]">{p.name}</h2>
                  <div className="mt-5 flex gap-1">
                    {p.stages.map((s, i) => (
                      <span key={s.id} className="h-1.5 rounded-full" style={{ flex: `${stageDuration(s)} 1 0%`, background: ramp[i] }} />
                    ))}
                  </div>
                  <ul className="mt-4">
                    {p.stages.map((s) => (
                      <li key={s.id} className="flex h-9 items-center justify-between border-b border-d-line text-[14px]">
                        <span>
                          <span className="tnum mr-2 text-d-3">{s.order}</span>
                          {s.title}
                        </span>
                        <span className="tnum text-[13px] text-d-3">{Math.round(stageDuration(s) / 60)}분</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 flex h-14 items-center justify-center gap-2 rounded-xl bg-d-a text-[16px] font-medium text-white transition-colors group-hover:bg-d-a2">
                    <Play className="h-4 w-4 fill-current" /> 재생 시작
                  </span>
                </button>
              ))}
            </div>
          </motion.main>
        ) : (
          /* ---------- 컨트롤러 ---------- */
          <motion.main key="controller" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease }} className="grid flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* 좌측: 재생 제어 */}
            <section className="flex flex-col p-5 md:p-8">
              {session.status === 'completed' || !stage || !program ? (
                <div className="my-auto py-10 text-center">
                  <StatusIcon kind="done" size={56} className="mx-auto" />
                  <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.02em]">오늘 운동을 모두 마쳤습니다</h2>
                  <p className="tnum mt-2 text-d-2">참여 {Object.keys(session.seniorStatus).length}명 · 마무리운동까지 완수</p>
                  <div className="mt-8 flex justify-center gap-2">
                    <Btn size="xl" onClick={() => gotoStage(0)}>
                      <RotateCcw className="h-4 w-4 text-d-3" /> 처음부터 다시
                    </Btn>
                    <Btn size="xl" variant="primary" onClick={endSession}>
                      새 세션 준비
                    </Btn>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[13px] text-d-2">
                        <StatusIcon kind={emergency ? 'alert' : playing ? 'progress' : 'paused'} value={progress} />
                        {session.stageIndex + 1}단계 · {stage.subtitle}
                      </p>
                      <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.025em]">{stage.title}</h2>
                      <p className="mt-1 text-[14px] text-d-2">{stage.goal}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum text-[56px] font-semibold leading-none tracking-[-0.04em]">{fmtClock(remaining)}</p>
                      <p className="mt-1.5 text-[12px] text-d-3">단계 남은 시간</p>
                    </div>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-d-line">
                    <div className={cx('h-full rounded-full transition-[width] duration-500 ease-linear', playing ? 'bg-d-a' : 'bg-d-warn')} style={{ width: `${progress * 100}%` }} />
                  </div>

                  {/* 현재 동작과 큐 자막: TV에 지금 나가는 문장 */}
                  {current ? (
                    <div className="mt-8">
                      <p className="tnum flex items-baseline justify-between text-[13px] text-d-3">
                        <span>
                          동작 {current.index + 1} / {stage.moves.length} · <span className="font-medium text-d-1">{current.move.name}</span>
                        </span>
                        <span>{fmtClock(current.move.durationSec)}</span>
                      </p>
                      <CueBar size="lg" className="mt-2 !rounded-xl">
                        {emergency ? '잠시 쉬어가요' : (phase?.cue ?? current.move.cue)}
                      </CueBar>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-d-line">
                        <div className="h-full rounded-full bg-d-1 transition-[width] duration-500 ease-linear" style={{ width: `${current.progress * 100}%` }} />
                      </div>
                      {phase ? (
                        <p className="tnum mt-2 text-[13px] text-d-2">
                          {phase.resting ? (
                            <>
                              <span className="font-medium text-d-1">쉬는 시간 {phase.restLeft}초</span> · 다음은 {phase.set}세트
                            </>
                          ) : (
                            <>
                              <span className="font-medium text-d-1">
                                {phase.set} / {phase.total}세트
                              </span>{' '}
                              · {current.move.detail?.perSet} · {phase.guide.head}
                            </>
                          )}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[13px] text-d-3">다음: {stage.moves[current.index + 1]?.name ?? program.stages[session.stageIndex + 1]?.title ?? '세션 완료'}</p>
                    </div>
                  ) : null}

                  {/* 트랜스포트 */}
                  <div className="mt-8 grid grid-cols-[1fr_auto] gap-2">
                    <button type="button" onClick={togglePlay} disabled={emergency} className={cx('press flex h-16 items-center justify-center gap-2 rounded-xl text-[18px] font-medium text-white disabled:opacity-40', playing ? 'bg-d-1 hover:bg-[#33333A]' : 'bg-d-a hover:bg-d-a2')}>
                      {playing ? (
                        <>
                          <Pause className="h-5 w-5 fill-current" /> 일시정지
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 fill-current" /> 재생
                        </>
                      )}
                    </button>
                    <button type="button" onClick={nextMove} disabled={emergency} className="press flex h-16 items-center justify-center gap-2 rounded-xl border border-d-line2 bg-white px-6 text-[16px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-d-hover disabled:opacity-40">
                      <SkipForward className="h-5 w-5 text-d-3" /> 다음 동작
                    </button>
                  </div>
                </>
              )}

              {/* 단계 바로 이동 */}
              {program ? (
                <div className="mt-8">
                  <p className="text-[13px] text-d-3">단계 바로 이동</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {program.stages.map((s, i) => {
                      const on = i === session.stageIndex && session.status !== 'completed'
                      const past = i < session.stageIndex || session.status === 'completed'
                      const kind: StatusKind = past ? 'done' : on ? (emergency ? 'alert' : playing ? 'progress' : 'paused') : 'todo'
                      return (
                        <button key={s.id} type="button" onClick={() => gotoStage(i)} aria-current={on ? 'step' : undefined} className={cx('press flex min-h-[76px] flex-col justify-between rounded-xl border p-3 text-left', on ? 'border-d-a bg-d-asoft' : 'border-d-line2 bg-white hover:bg-d-hover')}>
                          <span className="tnum flex items-center gap-1.5 text-[12px] text-d-3">
                            <StatusIcon kind={kind} value={progress} />
                            {s.order}단계 · {Math.round(stageDuration(s) / 60)}분
                          </span>
                          <span className={cx('text-[14px] font-medium leading-tight', past && 'text-d-3')}>{s.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {/* 긴급 */}
              <div className="mt-auto pt-8">
                {emergency ? (
                  <button type="button" onClick={play} className="press flex h-16 w-full items-center justify-center gap-3 rounded-xl border-2 border-d-bad bg-d-badsoft text-[17px] font-medium text-[#A93838]">
                    <Dot tone="bad" pulse />
                    긴급 일시정지 중 · 누르면 운동 재개
                  </button>
                ) : (
                  <button type="button" onClick={emergencyStop} disabled={session.status === 'completed'} className="press flex h-16 w-full items-center justify-center gap-2.5 rounded-xl bg-d-bad text-[17px] font-medium text-white hover:bg-[#C43F3F] disabled:opacity-40">
                    <OctagonAlert className="h-5 w-5" /> 전체 긴급 일시정지
                  </button>
                )}
              </div>
            </section>

            {/* 우측: 어르신 상태 */}
            <section className="flex flex-col border-t border-d-line bg-d-side p-5 md:p-8 lg:border-l lg:border-t-0">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em]">출석 어르신 상태</h2>
                  <p className="mt-1 text-[13px] text-d-3">이름을 누르면 정상, 주의, 휴식 순으로 바뀝니다</p>
                </div>
                <p className="tnum flex gap-3 text-[13px] text-d-2">
                  {(['normal', 'caution', 'rest'] as const).map((k) => (
                    <span key={k} className="inline-flex items-center gap-1.5">
                      <Dot tone={statusTone[k]} />
                      {statusLabel[k]} {counts(k)}
                    </span>
                  ))}
                </p>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {seniors
                  .filter((s) => s.id in session.seniorStatus)
                  .map((s) => {
                    const st = session.seniorStatus[s.id]
                    return (
                      <li key={s.id}>
                        <button type="button" onClick={() => cycleSeniorStatus(s.id)} aria-label={`${s.name} 상태: ${statusLabel[st]}. 눌러서 변경`} className={cx('press flex min-h-[84px] w-full flex-col justify-between rounded-xl border p-3 text-left', tile[st])}>
                          <span className="flex w-full items-center gap-2">
                            <Avatar name={s.name} size={26} />
                            <span className="truncate text-[16px] font-medium">{s.name}</span>
                          </span>
                          <span className="flex w-full items-center justify-between gap-2 text-[12px]">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <Dot tone={statusTone[st]} pulse={st === 'rest'} />
                              {statusLabel[st]}
                            </span>
                            <span className="tnum truncate text-d-3">
                              {s.room}호 · {s.mobility}
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
              </ul>
              {Object.keys(session.seniorStatus).length === 0 ? <p className="py-10 text-center text-[14px] text-d-3">출석 어르신이 없습니다. 대시보드에서 출석을 체크하세요</p> : null}
              <div className="mt-auto pt-6">
                <button type="button" onClick={endSession} className="press -ml-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] text-d-2 hover:bg-d-active hover:text-d-1">
                  <ChevronLeft className="h-4 w-4" /> 세션 종료하고 프로그램 선택으로
                </button>
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
