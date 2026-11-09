/** 영상에서 읽어 낸 동작 정보. MediMove 완성 영상 8편을 분석해 채웠습니다 */
export interface MoveDetail {
  area: '상체' | '하체'
  focus: string
  posture: '앉아서' | '서서'
  /** 세트 구성. 예: 3세트 × 10회 */
  dose: string
  /** 한 세트의 양. 예: 10회, 좌우 10회씩, 30초 */
  perSet: string
  /** 영상 속 지도자 */
  coach: string
  /** 시작 자세 */
  setup: string
  /** 세트 순서대로, 영상 왼쪽 위 안내 카드의 머리말과 문구 */
  guides: { head: string; tip: string }[]
  /** 세트가 시작하는 시각(초). restAt은 그 앞 쉬는 시간이 시작하는 시각 */
  timeline: { startAt: number; restAt?: number }[]
  /** 영상 자막에서 뽑은 구령 */
  cues: string[]
  /** public 폴더 기준 영상과 대표 장면 경로 */
  video: string
  poster: string
}

export interface Move {
  name: string
  durationSec: number
  cue: string
  detail?: MoveDetail
}

export interface Stage {
  id: string
  order: number
  title: string
  subtitle: string
  goal: string
  tone: 'moss' | 'amber' | 'coral' | 'ink'
  moves: Move[]
  /** TV 하단 큐잉 자막으로 순환 노출 */
  cues: string[]
  caution: string
}

export interface Program {
  id: string
  name: string
  minutes: 30 | 50
  tagline: string
  description: string
  stages: Stage[]
  effects: { category: '의학적' | '신체적' | '정서·인지'; text: string }[]
  safetyGuide: { title: string; detail: string }[]
}

const m = (name: string, min: number, cue: string): Move => ({ name, durationSec: Math.round(min * 60), cue })

/* ------------------------------------------------------------------ */
/* 동작 라이브러리: 영상 한 편이 동작 하나입니다.                        */
/* 길이는 영상 길이, 세트 시각은 화면의 세트 표시가 바뀌는 지점입니다.   */
/* ------------------------------------------------------------------ */

export const exercises = {
  shoulderRoll: {
    name: '어깨 뒤로 돌리기',
    durationSec: 245,
    cue: '어깨를 올려서, 뒤로 크게 돌려요',
    detail: {
      area: '상체',
      focus: '가동성',
      posture: '앉아서',
      dose: '3세트 × 10회',
      perSet: '10회',
      coach: '민혁',
      setup: '의자에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '이렇게 하세요', tip: '어깨를 귀 쪽으로 올렸다가 뒤로 크게 돌려요' },
        { head: '주의하세요', tip: '목은 그대로 두고 어깨만 천천히 돌려요' },
        { head: '어려우신 분은', tip: '작은 원으로 천천히 돌려도 괜찮아요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 86, startAt: 102 }, { restAt: 166, startAt: 180 }],
      cues: ['허리를 곧게 펴 주세요', '날개뼈를 모으면서 뒤로 돌려 주세요', '어깨를 올려서, 뒤로 돌려요'],
      video: '/videos/shoulder-roll.mp4',
      poster: '/videos/posters/shoulder-roll.jpg',
    },
  },
  chestOpen: {
    name: '가슴 활짝 열기',
    durationSec: 299,
    cue: '날개뼈를 모으며 가슴을 활짝 펴요',
    detail: {
      area: '상체',
      focus: '가동성',
      posture: '앉아서',
      dose: '3세트 × 10회',
      perSet: '10회',
      coach: '지훈',
      setup: '의자 앞쪽에 앉아 허리를 펴고, 어깨를 뒤로 아래로 내립니다',
      guides: [
        { head: '이렇게 하세요', tip: '두 손은 머리 뒤에 가볍게 대고 날개뼈를 모아요' },
        { head: '주의하세요', tip: '손으로 머리를 당기지 마세요' },
        { head: '어려우신 분은', tip: '팔꿈치를 조금만 벌려도 괜찮아요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 104, startAt: 120 }, { restAt: 202, startAt: 216 }],
      cues: ['허리를 곧게 펴 주세요', '어깨를 뒤로, 아래로 내려 주세요', '가슴을 활짝 펴 주세요', '제자리로 돌아오세요'],
      video: '/videos/chest-open.mp4',
      poster: '/videos/posters/chest-open.jpg',
    },
  },
  trunkTwist: {
    name: '등 돌리기',
    durationSec: 374,
    cue: '배꼽은 앞을 보고, 몸통만 천천히 돌려요',
    detail: {
      area: '상체',
      focus: '가동성',
      posture: '앉아서',
      dose: '3세트 × 10회',
      perSet: '10회',
      coach: '서연',
      setup: '의자 앞쪽에 앉아 두 팔을 가슴 앞에 X자로 모읍니다',
      guides: [
        { head: '이렇게 하세요', tip: '팔은 가슴 앞에 X자, 배꼽은 앞을 그대로' },
        { head: '주의하세요', tip: '허리가 아프면 조금만 돌리세요' },
        { head: '숨쉬기', tip: '돌릴 때 후~ 내쉬고 돌아올 때 들이쉬어요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 132, startAt: 146 }, { restAt: 254, startAt: 268 }],
      cues: ['오른쪽으로 돌리세요', '가운데로 오세요', '왼쪽으로 돌리세요', '가운데로 오세요'],
      video: '/videos/trunk-twist.mp4',
      poster: '/videos/posters/trunk-twist.jpg',
    },
  },
  kneeExtension: {
    name: '앉아서 무릎 펴기',
    durationSec: 577,
    cue: '한쪽 다리를 천천히 펴고, 천천히 내려요',
    detail: {
      area: '하체',
      focus: '근력',
      posture: '앉아서',
      dose: '3세트 × 좌우 10회씩',
      perSet: '좌우 10회씩',
      coach: '민혁',
      setup: '의자에 앉아 허리를 펴고, 왼쪽 다리부터 시작합니다',
      guides: [
        { head: '이렇게 하세요', tip: '발끝은 몸 쪽으로, 허벅지는 의자에 붙인 채로' },
        { head: '주의하세요', tip: '다리를 차지 말고 천천히 움직여요' },
        { head: '어려우신 분은', tip: '무릎을 끝까지 펴지 않아도 돼요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 194, startAt: 214 }, { restAt: 386, startAt: 406 }],
      cues: ['왼쪽 다리를 천천히 펴세요', '내리세요', '이번에는 오른쪽 다리예요', '오른쪽 다리를 천천히 펴세요', '내리세요'],
      video: '/videos/knee-extension.mp4',
      poster: '/videos/posters/knee-extension.jpg',
    },
  },
  heelRaise: {
    name: '까치발 들기',
    durationSec: 317,
    cue: '발끝은 바닥에 두고, 뒤꿈치를 천천히 들어요',
    detail: {
      area: '하체',
      focus: '근력 · 균형',
      posture: '앉아서',
      dose: '3세트 × 10회',
      perSet: '10회',
      coach: '지훈',
      setup: '의자 앞쪽에 앉아 양발을 바닥에 붙이고, 손은 허벅지 위에 올립니다',
      guides: [
        { head: '주의하세요', tip: '발끝은 바닥에 붙인 채로 천천히 하세요' },
        { head: '힘드신 분은', tip: '1세트처럼 잠깐만 멈췄다가 내려오셔도 돼요' },
        { head: '어려우신 분은', tip: '1세트 동작으로 하셔도 돼요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 100, startAt: 120 }, { restAt: 206, startAt: 226 }],
      cues: ['발뒤꿈치를 천천히 들어 올리세요', '올리세요', '내리세요', '3세트는 셋까지 세면서 3초 동안 천천히 내리세요'],
      video: '/videos/heel-raise.mp4',
      poster: '/videos/posters/heel-raise.jpg',
    },
  },
  sitToStand: {
    name: '앉았다 일어서기',
    durationSec: 330,
    cue: '허벅지를 짚고 천천히 일어나요',
    detail: {
      area: '하체',
      focus: '근력 · 보행',
      posture: '서서',
      dose: '3세트 × 10회',
      perSet: '10회',
      coach: '서연',
      setup: '의자가 밀리지 않게 벽에 붙이고, 의자 앞쪽에 앉습니다',
      guides: [
        { head: '주의하세요', tip: '무릎이 아프거나 어지러우시면 바로 쉬세요' },
        { head: '힘드신 분은', tip: '1세트처럼 허벅지를 짚고 하셔도 돼요' },
        { head: '어려우신 분은', tip: '2세트 동작이나 1세트 동작으로 하셔도 돼요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 106, startAt: 130 }, { restAt: 212, startAt: 238 }],
      cues: ['1세트: 허벅지를 짚고 일어나세요', '2세트: 양손을 가슴 앞에 엇갈려 모으고, 다리 힘으로 일어나세요', '3세트: 1초 만에 빠르게 일어나서, 4초 동안 천천히 앉으세요'],
      video: '/videos/sit-to-stand.mp4',
      poster: '/videos/posters/sit-to-stand.jpg',
    },
  },
  hipExtension: {
    name: '의자 잡고 다리 뒤로 들기',
    durationSec: 487,
    cue: '다리를 곧게 편 채로, 뒤로 천천히 들어 올려요',
    detail: {
      area: '하체',
      focus: '근력 · 보행',
      posture: '서서',
      dose: '3세트 × 좌우 10회씩',
      perSet: '좌우 10회씩',
      coach: '민혁',
      setup: '의자 등받이를 잡고 바르게 섭니다. 왼쪽 다리부터 시작합니다',
      guides: [
        { head: '이렇게 하세요', tip: '다리는 곧게 편 채로 발끝은 바닥을 향해' },
        { head: '주의하세요', tip: '허리를 젖히지 말고 엉덩이에 힘을 주세요' },
        { head: '주의하세요', tip: '어지러우면 바로 앉아 쉬세요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 164, startAt: 184 }, { restAt: 324, startAt: 344 }],
      cues: ['다리를 곧게 편 채로, 뒤로 천천히 들어 올리세요', '제자리로 돌아오세요', '허리를 젖히지 말고, 엉덩이에 힘을 주세요'],
      video: '/videos/hip-extension.mp4',
      poster: '/videos/posters/hip-extension.jpg',
    },
  },
  seatedMarch: {
    name: '제자리 걷기',
    durationSec: 106,
    cue: '팔을 앞뒤로 흔들며 무릎을 번갈아 들어요',
    detail: {
      area: '하체',
      focus: '보행',
      posture: '앉아서',
      dose: '2세트 × 30초',
      perSet: '30초',
      coach: '민혁',
      setup: '의자 앞쪽에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '주의하세요', tip: '허리를 펴고 의자 앞쪽에 앉아서 하세요' },
        { head: '주의하세요', tip: '허리를 펴고 의자 앞쪽에 앉아서 하세요' },
      ],
      timeline: [{ startAt: 6 }, { restAt: 57, startAt: 69 }],
      cues: ['허리를 곧게 펴 주세요', '팔을 앞뒤로 흔들면서, 무릎을 번갈아 들어 올리세요', '20초 남았어요!'],
      video: '/videos/seated-march.mp4',
      poster: '/videos/posters/seated-march.jpg',
    },
  },
} satisfies Record<string, Move>

const ex = exercises
const restCue = '잠시 쉬어갈게요. 숨을 크게 들이쉬고, 내쉬세요'

/** 동작 안에서 지금이 몇 세트인지, 쉬는 시간인지 */
export function phaseAt(move: Move, secIntoMove: number) {
  const d = move.detail
  if (!d) return null
  let idx = 0
  for (let i = 0; i < d.timeline.length; i++) {
    const t = d.timeline[i]
    if (secIntoMove >= (t.restAt ?? t.startAt)) idx = i
  }
  const t = d.timeline[idx]
  const resting = t.restAt !== undefined && secIntoMove < t.startAt
  return {
    set: idx + 1,
    total: d.timeline.length,
    resting,
    /** 쉬는 시간이면 다음 세트까지 남은 초 */
    restLeft: resting ? Math.ceil(t.startAt - secIntoMove) : 0,
    guide: d.guides[idx],
    cue: resting ? restCue : d.guides[idx].tip,
  }
}

const safetyGuide = [
  { title: '시작 전 확인', detail: '혈압·안색·수면 상태를 확인하고 평소와 다르면 참여를 보류합니다' },
  { title: '의자 준비', detail: '의자가 밀리지 않게 벽에 붙이고, 어르신이 의자 앞쪽에 앉도록 안내합니다' },
  { title: '배치', detail: '휠체어·보행기 어르신을 TV와 가까운 앞줄, 요양보호사 손이 닿는 위치에 배치합니다' },
  { title: '서는 동작', detail: '앉았다 일어서기와 다리 뒤로 들기는 어르신 옆에서 보조하고, 어려우면 화면의 쉬운 동작으로 바꿉니다' },
  { title: '통증 · 어지러움', detail: '무릎·허리 통증이나 어지러움을 호소하면 바로 앉히고 태블릿에서 상태를 「주의」로 바꿉니다' },
  { title: '긴급 상황', detail: '전체 긴급 일시정지 버튼을 누르면 TV가 휴식 안내로 전환됩니다. 어르신을 앉히고 호흡을 유도합니다' },
  { title: '마무리', detail: '운동 후 수분을 제공하고 5분간 관찰 뒤 출석 기록을 저장합니다' },
]

export const programs: Program[] = [
  {
    id: 'p30',
    name: '통합 프로그램 30분',
    minutes: 30,
    tagline: '아침을 여는 상체 가동성과 가벼운 하체 운동',
    description:
      '의자 하나로 진행하는 30분 통합 운동입니다. 어깨·가슴·등을 차례로 풀어 상체를 연 뒤, 까치발 들기와 앉았다 일어서기로 다리 힘을 기르고 제자리 걷기로 마무리합니다. 동작마다 3세트로 나뉘며 세트 사이에 쉬는 시간이 있습니다.',
    stages: [
      {
        id: 'p30-1',
        order: 1,
        title: '준비 · 호흡',
        subtitle: '몸 깨우기',
        goal: '의자에 바르게 앉아 호흡 리듬을 맞춥니다',
        tone: 'moss',
        moves: [m('복식 호흡', 1.5, '코로 천천히 들이쉬고, 입으로 길게 내쉬세요')],
        cues: ['의자 앞쪽에 앉아 주세요', '허리를 곧게 펴 주세요', '불편하면 손을 들어 주세요'],
        caution: '어지러움을 호소하면 즉시 멈추고 앉은 자세를 유지합니다',
      },
      {
        id: 'p30-2',
        order: 2,
        title: '관절 가동',
        subtitle: '상체 열기',
        goal: '어깨, 가슴, 등의 순서로 상체 가동범위를 넓힙니다',
        tone: 'amber',
        moves: [ex.shoulderRoll, ex.chestOpen, ex.trunkTwist],
        cues: ['통증이 없는 범위까지만', '천천히, 크게', '숨을 참지 마세요'],
        caution: '허리 통증이 있으면 등 돌리기의 범위를 줄이고, 가슴 열기에서 손으로 머리를 당기지 않도록 살핍니다',
      },
      {
        id: 'p30-3',
        order: 3,
        title: '근력 · 균형',
        subtitle: '다리 힘 기르기',
        goal: '종아리와 허벅지 근력을 길러 일어서기와 보행을 돕습니다',
        tone: 'coral',
        moves: [ex.heelRaise, ex.sitToStand],
        cues: ['허벅지를 짚고 하셔도 돼요', '숨을 참지 마세요', '힘들면 쉬운 동작으로 하세요'],
        caution: '앉았다 일어서기는 의자를 벽에 붙이고 요양보호사가 옆에서 보조합니다. 휠체어 어르신은 까치발 들기까지만 참여합니다',
      },
      {
        id: 'p30-4',
        order: 4,
        title: '보행 · 마무리',
        subtitle: '걷고 숨 고르기',
        goal: '앉아서 걷는 동작으로 리듬을 올린 뒤 호흡으로 가라앉힙니다',
        tone: 'ink',
        moves: [ex.seatedMarch, m('마무리 호흡', 1, '숨을 크게 들이쉬고, 길게 내쉬어요')],
        cues: ['오늘도 수고 많으셨어요', '천천히 숨을 내쉬어요', '물 한 잔 드세요'],
        caution: '운동 후 5분간 어르신의 안색과 호흡을 관찰합니다',
      },
    ],
    effects: [
      { category: '신체적', text: '어깨·가슴·등 가동범위 유지와 굽은 자세 완화' },
      { category: '신체적', text: '종아리·허벅지 근력 강화로 의자에서 일어서기가 수월해짐' },
      { category: '의학적', text: '하체 근력 유지로 낙상 위험 요인 감소' },
      { category: '의학적', text: '세트와 쉬는 시간을 나눈 저강도 구성으로 심박 부담 완화' },
      { category: '정서·인지', text: '구령에 맞춰 횟수를 세며 주의 집중과 참여 의욕 유지' },
    ],
    safetyGuide,
  },
  {
    id: 'p50',
    name: '통합 프로그램 50분',
    minutes: 50,
    tagline: '오후를 채우는 하체 근력 · 보행 세션',
    description:
      '50분 통합 세션은 상체 가동성 세 동작 뒤에 하체 근력 블록을 네 동작, 약 29분으로 늘렸습니다. 앉아서 무릎 펴기와 까치발 들기로 시작해 앉았다 일어서기, 의자 잡고 다리 뒤로 들기까지 이어지며, 어려우신 분을 위한 쉬운 동작이 세트마다 안내됩니다.',
    stages: [
      {
        id: 'p50-1',
        order: 1,
        title: '준비 · 호흡',
        subtitle: '몸 깨우기',
        goal: '호흡과 함께 자세를 바로 하고 집중을 모읍니다',
        tone: 'moss',
        moves: [m('복식 호흡', 2, '배가 부풀도록 깊게 들이쉬어요')],
        cues: ['오늘 컨디션은 어떠세요?', '의자 앞쪽에 앉아 주세요', '불편하면 손을 들어 주세요'],
        caution: '시작 전에 어르신 전체의 안색과 호흡을 한 번씩 확인합니다',
      },
      {
        id: 'p50-2',
        order: 2,
        title: '관절 가동',
        subtitle: '상체 열기',
        goal: '어깨, 가슴, 등의 순서로 상체 가동범위를 넓힙니다',
        tone: 'amber',
        moves: [ex.shoulderRoll, ex.chestOpen, ex.trunkTwist],
        cues: ['통증이 없는 범위까지만', '천천히, 크게', '숨을 참지 마세요'],
        caution: '파킨슨 어르신은 동작 전환 시 추가 시간을 주고, 반동 없이 진행합니다',
      },
      {
        id: 'p50-3',
        order: 3,
        title: '근력 · 균형',
        subtitle: '다리 힘 기르기',
        goal: '허벅지·종아리·엉덩이 근력을 길러 일어서기와 보행을 돕습니다',
        tone: 'coral',
        moves: [ex.kneeExtension, ex.heelRaise, ex.sitToStand, ex.hipExtension],
        cues: ['다리를 차지 말고 천천히', '의자 등받이를 꼭 잡아요', '힘들면 쉬운 동작으로 하세요', '아주 잘하고 계세요'],
        caution: '서는 동작 두 가지는 요양보호사 1인당 어르신 3명 이내로 보조합니다. 어지러우면 바로 앉혀 쉬게 합니다',
      },
      {
        id: 'p50-4',
        order: 4,
        title: '보행 · 마무리',
        subtitle: '걷고 숨 고르기',
        goal: '앉아서 걷는 동작으로 리듬을 올린 뒤 호흡으로 가라앉힙니다',
        tone: 'ink',
        moves: [ex.seatedMarch, m('마무리 호흡', 2, '숨을 크게 들이쉬고, 길게 내쉬어요')],
        cues: ['오늘도 수고 많으셨어요', '천천히 숨을 내쉬어요', '물 한 잔 드세요'],
        caution: '운동 후 수분을 제공하고 5분간 관찰합니다',
      },
    ],
    effects: [
      { category: '의학적', text: '약 29분의 하체 근력 블록으로 근감소 진행을 늦추고 낙상 위험 요인 감소' },
      { category: '의학적', text: '세트와 쉬는 시간을 나눈 구성으로 심박 부담 완화' },
      { category: '신체적', text: '허벅지 앞·엉덩이·종아리 근력 강화로 보행과 계단 오르기 보조' },
      { category: '신체적', text: '어깨·가슴·등 가동범위 유지와 굽은 자세 완화' },
      { category: '정서·인지', text: '좌우를 번갈아 세는 동작으로 주의 집중 유지' },
      { category: '정서·인지', text: '여럿이 구령을 맞추는 집단 운동으로 사회적 교류' },
    ],
    safetyGuide,
  },
]

export const getProgram = (id: string | null | undefined) => programs.find((p) => p.id === id) ?? null

export const stageDuration = (stage: Stage) => stage.moves.reduce((acc, mv) => acc + mv.durationSec, 0)

export const programDuration = (program: Program) => program.stages.reduce((acc, s) => acc + stageDuration(s), 0)

/** 단계 내 경과 시간으로 현재 동작 인덱스와 동작 내 진행률을 구합니다. */
export function moveAt(stage: Stage, elapsedSec: number) {
  let acc = 0
  for (let i = 0; i < stage.moves.length; i++) {
    const mv = stage.moves[i]
    if (elapsedSec < acc + mv.durationSec) {
      return { index: i, move: mv, startSec: acc, progress: (elapsedSec - acc) / mv.durationSec }
    }
    acc += mv.durationSec
  }
  const last = stage.moves.length - 1
  return { index: last, move: stage.moves[last], startSec: acc - stage.moves[last].durationSec, progress: 1 }
}

export const moveStartSec = (stage: Stage, moveIndex: number) =>
  stage.moves.slice(0, moveIndex).reduce((acc, mv) => acc + mv.durationSec, 0)

export const toneClass: Record<Stage['tone'], { bg: string; text: string; border: string; solid: string; dot: string }> = {
  moss: { bg: 'bg-moss-50', text: 'text-moss-700', border: 'border-moss-200', solid: 'bg-moss-500', dot: 'bg-moss-500' },
  amber: { bg: 'bg-amber-soft', text: 'text-amber-deep', border: 'border-amber/40', solid: 'bg-amber', dot: 'bg-amber' },
  coral: { bg: 'bg-coral-soft', text: 'text-coral-deep', border: 'border-coral/40', solid: 'bg-coral', dot: 'bg-coral' },
  ink: { bg: 'bg-sand-100', text: 'text-ink-2', border: 'border-ink/15', solid: 'bg-ink-2', dot: 'bg-ink-2' },
}
