export interface Kpi {
  id: string
  label: string
  unit: '%' | '명' | '분'
  series: number[] // 최근 12주
  labels: string[]
  target?: number
  tone: 'moss' | 'amber' | 'coral' | 'ink'
  description: string
}

const weeks = Array.from({ length: 12 }, (_, i) => (i === 11 ? '이번 주' : `${11 - i}주 전`))

export const kpis: Kpi[] = [
  {
    id: 'attendance',
    label: '평균 출석률',
    unit: '%',
    series: [71, 74, 72, 78, 80, 77, 83, 85, 84, 88, 86, 91],
    labels: weeks,
    target: 85,
    tone: 'moss',
    description: '등록 어르신 대비 운동 세션 출석 비율의 주간 평균',
  },
  {
    id: 'completion',
    label: '프로그램 완수율',
    unit: '%',
    series: [62, 65, 68, 66, 73, 75, 79, 78, 82, 84, 87, 89],
    labels: weeks,
    target: 80,
    tone: 'amber',
    description: '마무리운동까지 마친 어르신의 비율 (중도 휴식 제외)',
  },
  {
    id: 'participants',
    label: '주간 참여 어르신',
    unit: '명',
    series: [9, 9, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14],
    labels: weeks,
    tone: 'ink',
    description: '해당 주에 1회 이상 세션에 참여한 어르신 수',
  },
  {
    id: 'minutes',
    label: '평균 운동 시간',
    unit: '분',
    series: [24, 26, 27, 29, 31, 30, 33, 35, 34, 37, 38, 40],
    labels: weeks,
    tone: 'coral',
    description: '어르신 1인당 주간 누적 실제 운동 시간',
  },
]

export const weekdayAttendance = [
  { day: '월', present: 12, total: 14 },
  { day: '화', present: 13, total: 14 },
  { day: '수', present: 11, total: 14 },
  { day: '목', present: 13, total: 14 },
  { day: '금', present: 12, total: 14 },
]

export const statusBreakdown = [
  { label: '정상 완수', value: 78, tone: 'moss' as const },
  { label: '주의 후 완수', value: 11, tone: 'amber' as const },
  { label: '중도 휴식', value: 11, tone: 'coral' as const },
]
