import { useEffect, useState } from 'react'
import { getProgram, moveAt, stageDuration } from '../data/programs'
import { advanceStage, stageElapsed, useStore } from './store'

/**
 * 현재 세션 단계의 경과·남은 시간을 0.5초 간격으로 갱신합니다.
 * 단계 시간이 끝나면 자동으로 다음 단계로 넘어갑니다(중복 호출은 store가 막습니다).
 */
export function useStageClock(autoAdvance = true) {
  const session = useStore((s) => s.session)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (session.status !== 'playing') return
    const id = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [session.status])

  const program = getProgram(session.programId)
  const stage = program ? program.stages[session.stageIndex] : null
  const total = stage ? stageDuration(stage) : 0
  const elapsed = stage ? Math.min(total, stageElapsed(session, session.status === 'playing' ? now : Date.now())) : 0
  const remaining = Math.max(0, total - elapsed)
  const progress = total ? elapsed / total : 0
  const current = stage ? moveAt(stage, elapsed) : null

  useEffect(() => {
    if (!autoAdvance || !stage || session.status !== 'playing') return
    if (remaining <= 0) advanceStage(session.stageIndex)
  }, [autoAdvance, remaining, session.status, session.stageIndex, stage])

  // 세션 전체 진행률 (단계 가중)
  const programTotal = program ? program.stages.reduce((a, s) => a + stageDuration(s), 0) : 0
  const programElapsed = program
    ? program.stages.slice(0, session.stageIndex).reduce((a, s) => a + stageDuration(s), 0) + elapsed
    : 0

  return {
    session,
    program,
    stage,
    total,
    elapsed,
    remaining,
    progress,
    current,
    programProgress: programTotal ? programElapsed / programTotal : 0,
  }
}

export const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.round(sec))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}
