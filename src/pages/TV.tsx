import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Maximize2, Pause } from 'lucide-react'
import Logo from '../components/Logo'
import Figure from '../components/Figure'
import { stageDuration } from '../data/programs'
import { nextExercise } from '../data/schedule'
import { useStore } from '../lib/store'
import { fmtClock, useStageClock } from '../lib/useStageClock'

const ease = [0.22, 1, 0.36, 1] as const
/* 단계별 무대 조명. 영상 영역의 분위기를 바꾸는 유일한 색 변화 */
const toneBg = {
  moss: 'radial-gradient(ellipse at 30% 20%, #18263F 0%, #0B0D11 65%)',
  amber: 'radial-gradient(ellipse at 30% 20%, #2B2617 0%, #0B0D11 65%)',
  coral: 'radial-gradient(ellipse at 30% 20%, #2C1C1F 0%, #0B0D11 65%)',
  ink: 'radial-gradient(ellipse at 30% 20%, #1D2029 0%, #0B0D11 65%)',
} as const

export default function TV() {
  const { session, program, stage, remaining, progress, current } = useStageClock(true)
  const attendance = useStore((s) => s.attendance)
  const presentCount = Object.values(attendance).filter(Boolean).length
  const [clock, setClock] = useState(() => new Date())
  const [cueIdx, setCueIdx] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  // 큐잉 자막: 현재 동작 큐 + 단계 큐를 6초 간격으로 순환
  useEffect(() => {
    if (session.status !== 'playing') return
    const id = window.setInterval(() => setCueIdx((i) => i + 1), 6000)
    return () => window.clearInterval(id)
  }, [session.status])

  const cues = stage && current ? [current.move.cue, ...stage.cues] : []
  const cue = cues.length ? cues[cueIdx % cues.length] : ''

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen?.()
  }

  const idle = session.status === 'idle'
  const next = nextExercise()

  return (
    <div className="font-dash group relative h-screen w-screen select-none overflow-hidden bg-[#0B0D11] text-white" style={{ background: stage ? toneBg[stage.tone] : undefined }}>
      <button
        type="button"
        onClick={fullscreen}
        aria-label="전체 화면"
        className="absolute right-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white/70 opacity-0 transition-opacity hover:bg-white/20 hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <AnimatePresence mode="wait">
        {idle ? (
          /* ---------- 대기 화면 ---------- */
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex flex-col items-center justify-center p-10">
            <Logo inverse tone="neutral" size={36} className="[&>span]:!text-[22px]" />
            <p className="tnum mt-10 text-[clamp(64px,12vw,160px)] font-semibold leading-none tracking-[-0.04em]">{clock.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
            <p className="mt-4 text-[clamp(18px,2.4vw,30px)] text-white/70">{clock.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
            <div className="mt-12 w-[min(720px,80vw)] border-t border-white/15 pt-8 text-center">
              <p className="text-[clamp(14px,1.4vw,18px)] text-white/55">다음 운동</p>
              <p className="mt-1 text-[clamp(20px,2.6vw,34px)] font-medium">{next ? `${next.time} · ${next.title}` : '오늘 예정된 운동이 없습니다'}</p>
              <p className="mt-2 text-[clamp(13px,1.3vw,17px)] text-white/55">출석 어르신 {presentCount}명 · 태블릿에서 재생을 누르면 화면이 켜집니다</p>
            </div>
          </motion.div>
        ) : session.status === 'completed' ? (
          /* ---------- 완료 화면 ---------- */
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
            <span className="grid h-[clamp(96px,14vw,160px)] w-[clamp(96px,14vw,160px)] place-items-center rounded-full bg-d-a text-white">
              <Check className="h-1/2 w-1/2" strokeWidth={2.5} />
            </span>
            <h1 className="mt-8 text-[clamp(40px,6vw,88px)] font-semibold leading-tight tracking-[-0.03em]">오늘 운동을 모두 마쳤습니다</h1>
            <p className="mt-4 text-[clamp(22px,3vw,40px)] font-medium text-tv-cue">정말 수고 많으셨어요. 물 한 잔 드세요</p>
            <p className="mt-10 text-[clamp(16px,1.8vw,24px)] text-white/55">
              {program?.name} · 참여 {Object.keys(session.seniorStatus).length}명
            </p>
          </motion.div>
        ) : (
          /* ---------- 송출 화면 ---------- */
          <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
            {/* 영상 영역 */}
            <div className="absolute inset-0 grid place-items-center">
              <motion.div key={current?.index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }} className="flex h-full w-full flex-col items-center justify-center pb-[18vh] pt-[12vh]">
                <Figure className="h-[min(48vh,56vw)]" color="#E6EAF2" floor="#4A5261" />
                <p className="mt-6 text-[clamp(28px,4vw,56px)] font-medium">{current?.move.name}</p>
                <p className="tnum mt-2 text-[clamp(16px,1.8vw,24px)] text-white/55">
                  동작 {current ? current.index + 1 : 0} / {stage?.moves.length ?? 0}
                </p>
              </motion.div>
            </div>

            {/* 상단 브로드캐스트 HUD */}
            {program && stage ? (
              <header className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 bg-gradient-to-b from-black/60 to-transparent px-[4vw] pb-[6vh] pt-[3vh]">
                <div className="min-w-0">
                  <p className="flex items-center gap-3 text-[clamp(14px,1.5vw,20px)] text-white/70">
                    <span className={`h-3 w-3 rounded-full ${session.status === 'playing' ? 'animate-pulse bg-[#F06A6A]' : 'bg-[#F2B84B]'}`} />
                    {session.status === 'playing' ? '송출 중' : '일시정지'} · {program.name}
                  </p>
                  <h1 className="mt-2 truncate text-[clamp(28px,3.6vw,52px)] font-medium leading-tight">
                    {session.stageIndex + 1}단계 · {stage.title}
                  </h1>
                  <div className="mt-4 flex w-[min(520px,40vw)] gap-2">
                    {program.stages.map((s, i) => (
                      <div key={s.id} className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-tv-cue transition-[width] duration-500 ease-linear" style={{ width: i < session.stageIndex ? '100%' : i === session.stageIndex ? `${progress * 100}%` : '0%' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[clamp(14px,1.5vw,20px)] text-white/70">남은 시간</p>
                  <p className="tnum text-[clamp(44px,6.5vw,96px)] font-semibold leading-none tracking-[-0.04em]">{fmtClock(remaining)}</p>
                  <p className="tnum mt-1 text-[clamp(13px,1.3vw,18px)] text-white/50">단계 {fmtClock(stageDuration(stage))}</p>
                </div>
              </header>
            ) : null}

            {/* 일시정지 오버레이 */}
            <AnimatePresence>
              {session.status === 'paused' ? (
                <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 grid place-items-center bg-black/45">
                  <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/60 px-10 py-6">
                    <Pause className="h-[clamp(32px,4vw,56px)] w-[clamp(32px,4vw,56px)] fill-current text-[#F2B84B]" />
                    <span className="text-[clamp(28px,4vw,56px)] font-medium">잠시 멈춤</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* 하단 큐잉 자막 바 (시그니처) */}
            <footer className="absolute inset-x-0 bottom-0 px-[3vw] pb-[3vh]">
              <div className="rounded-2xl bg-black/85 px-[3vw] py-[2.4vh] text-center">
                <motion.p key={cue} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }} className="text-[clamp(30px,4.6vw,66px)] font-semibold leading-[1.25] text-tv-cue">
                  {cue}
                </motion.p>
              </div>
            </footer>

            {/* 긴급 휴식 오버레이 */}
            <AnimatePresence>
              {session.status === 'emergency' ? (
                <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0B0D11]/95 p-10 text-center">
                  {/* 호흡 유도용 원: 4초 주기로 커졌다 작아지는, 목적이 있는 유일한 반복 모션 */}
                  <div className="relative grid place-items-center">
                    <span className="absolute h-[clamp(160px,26vw,340px)] w-[clamp(160px,26vw,340px)] animate-breathe rounded-full bg-white/10" />
                    <span className="relative grid h-[clamp(88px,14vw,180px)] w-[clamp(88px,14vw,180px)] place-items-center rounded-full bg-white text-[clamp(22px,3vw,40px)] font-semibold text-[#0B0D11]">휴식</span>
                  </div>
                  <h1 className="mt-12 text-[clamp(44px,7vw,104px)] font-semibold leading-tight tracking-[-0.03em]">잠시 쉬어가요</h1>
                  <p className="mt-6 text-[clamp(24px,3.4vw,48px)] font-semibold text-tv-cue">천천히 숨을 들이쉬고, 길게 내쉬어요</p>
                  <p className="mt-6 text-[clamp(16px,2vw,28px)] text-white/60">의자에 편하게 앉아 요양보호사의 안내를 기다려 주세요</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
