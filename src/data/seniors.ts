export type Mobility = '자립 보행' | '보행기' | '휠체어'

export interface Senior {
  id: string
  name: string
  age: number
  room: string
  conditions: string[]
  mobility: Mobility
  note?: string
  /** 기본 출석 여부(최초 1회만 사용) */
  defaultPresent: boolean
}

export const seniors: Senior[] = [
  { id: 's01', name: '김영자', age: 82, room: '101', conditions: ['경도 치매', '고혈압'], mobility: '자립 보행', defaultPresent: true },
  { id: 's02', name: '박순희', age: 79, room: '101', conditions: ['관절염'], mobility: '보행기', defaultPresent: true },
  { id: 's03', name: '이재문', age: 85, room: '102', conditions: ['파킨슨', '당뇨'], mobility: '보행기', note: '오후 떨림 심화, 균형 동작 보조 필요', defaultPresent: true },
  { id: 's04', name: '최명숙', age: 77, room: '102', conditions: ['골다공증'], mobility: '자립 보행', defaultPresent: true },
  { id: 's05', name: '정길수', age: 88, room: '103', conditions: ['뇌졸중 후 재활', '고혈압'], mobility: '휠체어', note: '좌측 상지 가동범위 제한', defaultPresent: true },
  { id: 's06', name: '한옥분', age: 81, room: '103', conditions: ['경도 치매'], mobility: '자립 보행', defaultPresent: false },
  { id: 's07', name: '오병철', age: 76, room: '104', conditions: ['당뇨', '관절염'], mobility: '자립 보행', defaultPresent: true },
  { id: 's08', name: '윤정희', age: 84, room: '104', conditions: ['고혈압'], mobility: '자립 보행', defaultPresent: true },
  { id: 's09', name: '장복례', age: 90, room: '105', conditions: ['중등도 치매', '골다공증'], mobility: '휠체어', note: '언어 큐 반복 필요', defaultPresent: true },
  { id: 's10', name: '서동만', age: 78, room: '105', conditions: ['파킨슨'], mobility: '보행기', defaultPresent: false },
  { id: 's11', name: '문숙자', age: 83, room: '106', conditions: ['관절염', '고혈압'], mobility: '자립 보행', defaultPresent: true },
  { id: 's12', name: '강태호', age: 80, room: '106', conditions: ['뇌졸중 후 재활'], mobility: '보행기', defaultPresent: true },
  { id: 's13', name: '노말순', age: 86, room: '107', conditions: ['경도 치매', '당뇨'], mobility: '자립 보행', defaultPresent: false },
  { id: 's14', name: '백인수', age: 75, room: '107', conditions: ['고혈압'], mobility: '자립 보행', defaultPresent: true },
]

/** 낙상·급변 위험이 높아 밀착 보조가 필요한 질환 */
export const riskConditions = new Set(['파킨슨', '뇌졸중 후 재활', '중등도 치매'])

export const specialties = ['치매', '파킨슨', '뇌졸중 재활', '관절염', '골다공증', '고혈압·당뇨']
