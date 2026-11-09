export interface ScheduleItem {
  id: string
  time: string // HH:mm
  title: string
  programId: 'p30' | 'p50' | null
  place: string
  staff: string
  kind: 'exercise' | 'cognitive' | 'consult'
}

export const todaySchedule: ScheduleItem[] = [
  { id: 'a1', time: '09:30', title: '아침 체조 · 통합 프로그램 30분', programId: 'p30', place: '1층 다목적실', staff: '김민지 요양보호사', kind: 'exercise' },
  { id: 'a2', time: '11:00', title: '인지 자극 활동 · 색칠과 회상', programId: null, place: '2층 프로그램실', staff: '박소연 사회복지사', kind: 'cognitive' },
  { id: 'a3', time: '14:00', title: '오후 운동 · 통합 프로그램 50분', programId: 'p50', place: '1층 다목적실', staff: '이정훈 요양보호사', kind: 'exercise' },
  { id: 'a4', time: '15:30', title: '개별 재활 상담 · 정길수, 강태호', programId: null, place: '상담실', staff: '최유진 물리치료사', kind: 'consult' },
]

export const minutesOf = (hhmm: string) => {
  const [h, mm] = hhmm.split(':').map(Number)
  return h * 60 + mm
}

export type ScheduleStatus = 'done' | 'now' | 'upcoming'

export function scheduleStatus(item: ScheduleItem, now = new Date()): ScheduleStatus {
  const cur = now.getHours() * 60 + now.getMinutes()
  const start = minutesOf(item.time)
  const len = item.programId === 'p50' ? 50 : item.programId === 'p30' ? 30 : 60
  if (cur >= start + len) return 'done'
  if (cur >= start - 15) return 'now'
  return 'upcoming'
}

export const nextExercise = (now = new Date()) =>
  todaySchedule.find((s) => s.programId && scheduleStatus(s, now) !== 'done') ??
  todaySchedule.find((s) => s.programId) ??
  null
