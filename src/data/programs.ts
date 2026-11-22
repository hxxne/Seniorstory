/** 영상에서 읽어 낸 동작 정보. MediMove 완성 영상 8편을 분석해 채웠습니다 */
export interface MoveDetail {
  area: '상체' | '하체' | '전신'
  focus: string
  posture: '앉아서' | '서서' | '의자에서'
  /** 세트 구성. 예: 3세트 × 10회 */
  dose: string
  /** 한 세트의 양. 예: 10회, 좌우 10회씩, 30초 */
  perSet: string
  /** 영상 속 지도자. 모르면 비웁니다 */
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
  effects: { category: '건강' | '신체적' | '정서·인지'; text: string }[]
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
        { head: '이렇게 하세요', tip: '두 손은 머리 뒤에 가볍게 대고 날개뼈를 모아요' },
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

/* ------------------------------------------------------------------ */
/* 30분 프로그램의 동작 12개. 한 편짜리 영상(33분 30초, 2026-11-22에 받음)을 */
/* 동작 사이의 빈 구간에서 잘랐습니다. 이름·구성·안내 문구는 영상 화면에  */
/* 나오는 글자 그대로이고, 세트 시각은 화면의 세트 표시가 바뀌는 지점입니다. */
/* ------------------------------------------------------------------ */

export const p30Moves = {
  ankleCircle: {
    name: '발목 돌리기',
    durationSec: 132,
    cue: '다리를 앞으로 뻗고 발목을 위아래로 까딱까딱 움직여요',
    detail: {
      area: '하체',
      focus: '발목 · 종아리',
      posture: '앉아서',
      dose: '좌우 12회씩',
      perSet: '12회',
      coach: '',
      setup: '의자에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '이렇게 하세요', tip: '다리를 앞으로 뻗고 발목을 위아래로 까딱까딱 움직여요' },
        { head: '주의하세요', tip: '뻗기 힘들면 손으로 다리를 받쳐 주세요' },
      ],
      timeline: [{ startAt: 31 }, { startAt: 75 }],
      cues: ['다리를 앞으로 뻗고 발목을 위아래로 까딱까딱 움직여요', '뻗기 힘들면 손으로 다리를 받쳐 주세요', '허리는 곧게 펴 주세요'],
      video: '/videos/p30/ankle-circle.mp4',
      poster: '/videos/p30/posters/ankle-circle.jpg',
    },
  },
  shoulderCircle: {
    name: '어깨 돌리기',
    durationSec: 80,
    cue: '어깨를 귀 쪽으로 올렸다가 뒤로 크게 돌려요',
    detail: {
      area: '상체',
      focus: '어깨 · 등',
      posture: '앉아서',
      dose: '2세트 × 10회',
      perSet: '10회',
      coach: '',
      setup: '의자에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '이렇게 하세요', tip: '어깨를 귀 쪽으로 올렸다가 뒤로 크게 돌려요' },
        { head: '주의하세요', tip: '목은 그대로 두고 어깨만 천천히 돌려요' },
      ],
      timeline: [{ startAt: 3 }, { startAt: 37 }],
      cues: ['어깨를 귀 쪽으로 올렸다가 뒤로 크게 돌려요', '목은 그대로 두고 어깨만 천천히 돌려요'],
      video: '/videos/p30/shoulder-circle.mp4',
      poster: '/videos/p30/posters/shoulder-circle.jpg',
    },
  },
  backTwist: {
    name: '등 돌리기',
    durationSec: 84,
    cue: '양팔을 가슴 앞에 엇갈려 모으고 좌우로 번갈아 돌려요',
    detail: {
      area: '상체',
      focus: '등 · 허리',
      posture: '앉아서',
      dose: '2세트 × 8회',
      perSet: '8회',
      coach: '',
      setup: '의자에 앉아 양팔을 가슴 앞에 엇갈려 모읍니다',
      guides: [
        { head: '이렇게 하세요', tip: '양팔을 가슴 앞에 엇갈려 모으고 좌우로 번갈아 돌려요' },
        { head: '주의하세요', tip: '엉덩이와 무릎은 앞을 향하게 두세요' },
      ],
      timeline: [{ startAt: 4 }, { startAt: 42 }],
      cues: ['양팔을 가슴 앞에 엇갈려 모으고 좌우로 번갈아 돌려요', '엉덩이와 무릎은 앞을 향하게 두세요'],
      video: '/videos/p30/back-twist.mp4',
      poster: '/videos/p30/posters/back-twist.jpg',
    },
  },
  seatedWalk: {
    name: '제자리 걷기',
    durationSec: 108,
    cue: '허리를 곧게 펴고 무릎을 번갈아 들며 팔도 함께 흔들어요',
    detail: {
      area: '전신',
      focus: '다리 · 전신',
      posture: '앉아서',
      dose: '2세트 × 30초',
      perSet: '30초',
      coach: '',
      setup: '의자에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '이렇게 하세요', tip: '허리를 곧게 펴고 무릎을 번갈아 들며 팔도 함께 흔들어요' },
        { head: '주의하세요', tip: '숨을 참지 말고 편하게 쉬세요' },
      ],
      timeline: [{ startAt: 3 }, { restAt: 51, startAt: 65 }],
      cues: ['허리를 곧게 펴고 무릎을 번갈아 들며 팔도 함께 흔들어요', '숨을 참지 말고 편하게 쉬세요', '허리를 곧게 펴고 자연스럽게 걸어 보세요'],
      video: '/videos/p30/seated-walk.mp4',
      poster: '/videos/p30/posters/seated-walk.jpg',
    },
  },
  chairStand: {
    name: '앉았다 일어나기',
    durationSec: 260,
    cue: '무릎을 짚고 일어났다가 천천히 앉아요',
    detail: {
      area: '하체',
      focus: '허벅지 · 엉덩이',
      posture: '의자에서',
      dose: '2세트 × 10회',
      perSet: '10회',
      coach: '',
      setup: '발바닥 전체가 바닥에 닿게 앉습니다',
      guides: [
        { head: '이렇게 하세요', tip: '무릎을 짚고 일어났다가 천천히 앉아요' },
        { head: '이렇게 하세요', tip: '가슴 앞에 손을 X자로 모으고 일어났다 앉아요' },
      ],
      timeline: [{ startAt: 3 }, { restAt: 133, startAt: 153 }],
      cues: ['무릎을 짚고 일어났다가 천천히 앉아요', '가슴 앞에 손을 X자로 모으고 일어났다 앉아요', '발바닥 전체가 바닥에 닿게 해 주세요', '무릎이나 허리가 아프면 바로 멈추고 쉬세요', '힘들면 무릎을 짚고 일어나도 괜찮아요'],
      video: '/videos/p30/sit-to-stand.mp4',
      poster: '/videos/p30/posters/sit-to-stand.jpg',
    },
  },
  kneeStraighten: {
    name: '무릎 펴기',
    durationSec: 422,
    cue: '발을 바닥에서 떼고 무릎을 천천히 펴서 올려요',
    detail: {
      area: '하체',
      focus: '허벅지 앞쪽',
      posture: '앉아서',
      dose: '좌우 각 10회 · 6회',
      perSet: '좌우 각각',
      coach: '',
      setup: '의자에 앉아 허리를 곧게 폅니다',
      guides: [
        { head: '이렇게 하세요', tip: '발을 바닥에서 떼고 무릎을 천천히 펴서 올려요' },
        { head: '이렇게 하세요', tip: '발끝을 내 쪽으로 당기고 끝까지 펴서 잠깐 멈춰요' },
      ],
      timeline: [{ startAt: 5 }, { restAt: 207, startAt: 225 }],
      cues: ['발을 바닥에서 떼고 무릎을 천천히 펴서 올려요', '발끝을 내 쪽으로 당기고 끝까지 펴서 잠깐 멈춰요', '허벅지 앞쪽에 힘이 들어가는 걸 느껴 보세요', '무릎이 아프면 아프지 않을 만큼만 펴 주셔도 괜찮아요'],
      video: '/videos/p30/knee-extension.mp4',
      poster: '/videos/p30/posters/knee-extension.jpg',
    },
  },
  heelLift: {
    name: '뒤꿈치 들기',
    durationSec: 240,
    cue: '손끝을 의자에 대고 뒤꿈치를 들었다가 천천히 내려요',
    detail: {
      area: '하체',
      focus: '종아리',
      posture: '서서',
      dose: '15회 · 10회',
      perSet: '1세트 15회, 2세트 10회',
      coach: '',
      setup: '의자 옆에 서서 손끝을 의자에 댑니다',
      guides: [
        { head: '이렇게 하세요', tip: '손끝을 의자에 대고 뒤꿈치를 들었다가 천천히 내려요' },
        { head: '이렇게 하세요', tip: '손을 떼고 까치발에서 잠깐 멈춰요' },
      ],
      timeline: [{ startAt: 4 }, { restAt: 102, startAt: 124 }],
      cues: ['손끝을 의자에 대고 뒤꿈치를 들었다가 천천히 내려요', '손을 떼고 까치발에서 잠깐 멈춰요', '천천히 내려 주세요', '흔들리면 바로 의자를 잡으세요'],
      video: '/videos/p30/heel-raise.mp4',
      poster: '/videos/p30/posters/heel-raise.jpg',
    },
  },
  sideLegRaise: {
    name: '다리 옆으로 들기',
    durationSec: 342,
    cue: '의자를 잡고 다리만 옆으로 들었다 내려요',
    detail: {
      area: '하체',
      focus: '엉덩이 옆',
      posture: '서서',
      dose: '좌우 각 10회 · 6회',
      perSet: '좌우 각각',
      coach: '',
      setup: '의자 옆에 서서 의자를 잡습니다',
      guides: [
        { head: '이렇게 하세요', tip: '의자를 잡고 다리만 옆으로 들었다 내려요' },
        { head: '이렇게 하세요', tip: '손끝만 의자에 대고 다리를 든 채 잠깐 멈춰요' },
      ],
      timeline: [{ startAt: 5 }, { restAt: 155, startAt: 178 }],
      cues: ['의자를 잡고 다리만 옆으로 들었다 내려요', '손끝만 의자에 대고 다리를 든 채 잠깐 멈춰요', '몸이 기울지 않게 곧게 서세요', '흔들리면 반드시 의자를 잡고 해 주세요'],
      video: '/videos/p30/side-leg-raise.mp4',
      poster: '/videos/p30/posters/side-leg-raise.jpg',
    },
  },
  toePull: {
    name: '발끝 당기기',
    durationSec: 100,
    cue: '다리를 앞으로 뻗고 발끝을 몸 쪽으로 당겨 주세요',
    detail: {
      area: '하체',
      focus: '허벅지 뒤 · 종아리',
      posture: '앉아서',
      dose: '좌우 10회씩',
      perSet: '10회',
      coach: '',
      setup: '의자에 앉아 한쪽 다리를 앞으로 뻗습니다',
      guides: [
        { head: '이렇게 하세요', tip: '다리를 앞으로 뻗고 발끝을 몸 쪽으로 당겨 주세요' },
        { head: '주의하세요', tip: '가슴을 펴고 상체는 숙이지 마세요' },
      ],
      timeline: [{ startAt: 14 }, { startAt: 50 }],
      cues: ['다리를 앞으로 뻗고 발끝을 몸 쪽으로 당겨 주세요', '가슴을 펴고 상체는 숙이지 마세요'],
      video: '/videos/p30/toe-pull.mp4',
      poster: '/videos/p30/posters/toe-pull.jpg',
    },
  },
  chestStretch: {
    name: '가슴 펴기',
    durationSec: 68,
    cue: '양손을 등 뒤에서 깍지 끼고 가슴을 활짝 열어요',
    detail: {
      area: '상체',
      focus: '가슴 · 어깨',
      posture: '앉아서',
      dose: '10회',
      perSet: '10회',
      coach: '',
      setup: '의자에 앉아 양손을 등 뒤로 보냅니다',
      guides: [
        { head: '이렇게 하세요', tip: '양손을 등 뒤에서 깍지 끼고 가슴을 활짝 열어요' },
      ],
      timeline: [{ startAt: 4 }],
      cues: ['양손을 등 뒤에서 깍지 끼고 가슴을 활짝 열어요', '어려우면 손을 허리에 대도 괜찮아요'],
      video: '/videos/p30/chest-stretch.mp4',
      poster: '/videos/p30/posters/chest-stretch.jpg',
    },
  },
  neckTilt: {
    name: '목 기울이기',
    durationSec: 80,
    cue: '턱을 살짝 당기고 귀를 어깨 쪽으로 내려요',
    detail: {
      area: '상체',
      focus: '목 · 어깨',
      posture: '앉아서',
      dose: '좌우 5회씩',
      perSet: '5회',
      coach: '',
      setup: '의자에 앉아 턱을 살짝 당깁니다',
      guides: [
        { head: '이렇게 하세요', tip: '턱을 살짝 당기고 귀를 어깨 쪽으로 내려요' },
        { head: '주의하세요', tip: '어깨를 으쓱대지 않도록 해요' },
      ],
      timeline: [{ startAt: 4 }, { startAt: 36 }],
      cues: ['턱을 살짝 당기고 귀를 어깨 쪽으로 내려요', '어깨를 으쓱대지 않도록 해요'],
      video: '/videos/p30/neck-tilt.mp4',
      poster: '/videos/p30/posters/neck-tilt.jpg',
    },
  },
  bellyBreath: {
    name: '호흡',
    durationSec: 94,
    cue: '코로 들이쉬며 배를 부풀리고 입으로 길게 내쉬어요',
    detail: {
      area: '전신',
      focus: '배 호흡',
      posture: '앉아서',
      dose: '5회',
      perSet: '5회',
      coach: '',
      setup: '의자에 편하게 앉습니다',
      guides: [
        { head: '이렇게 하세요', tip: '코로 들이쉬며 배를 부풀리고 입으로 길게 내쉬어요' },
      ],
      timeline: [{ startAt: 4 }],
      cues: ['코로 들이쉬며 배를 부풀리고 입으로 길게 내쉬어요', '숨을 참지 말고 편안하게 쉬어요'],
      video: '/videos/p30/breathing.mp4',
      poster: '/videos/p30/posters/breathing.jpg',
    },
  },
} satisfies Record<string, Move>
const n = p30Moves
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
    tagline: '몸을 풀고 다리 힘을 기르는 기본 운동',
    description:
      '의자 하나로 진행하는 운동입니다. 준비운동에서 발목·어깨·등을 풀고 제자리 걷기로 몸을 데운 뒤, 본운동에서 앉았다 일어나기와 무릎 펴기, 뒤꿈치 들기, 다리 옆으로 들기로 다리 힘을 기릅니다. 마무리운동은 스트레칭과 호흡입니다. 영상 길이는 33분 30초입니다.',
    stages: [
      {
        id: 'p30-1',
        order: 1,
        title: '준비운동',
        subtitle: '몸 풀기',
        goal: '발목·어깨·등을 돌려 풀고 제자리 걷기로 몸을 데웁니다',
        tone: 'moss',
        moves: [n.ankleCircle, n.shoulderCircle, n.backTwist, n.seatedWalk],
        cues: ['의자 앞쪽에 앉아 주세요', '허리를 곧게 펴 주세요', '불편하면 손을 들어 주세요'],
        caution: '어지러움을 호소하면 즉시 멈추고 앉은 자세를 유지합니다',
      },
      {
        id: 'p30-2',
        order: 2,
        title: '본운동',
        subtitle: '하지 근력',
        goal: '허벅지·엉덩이·종아리 힘을 길러 일어서기와 걷기를 돕습니다',
        tone: 'coral',
        moves: [n.chairStand, n.kneeStraighten, n.heelLift, n.sideLegRaise],
        cues: ['통증이 없는 범위까지만', '숨을 참지 마세요', '흔들리면 의자를 잡으세요', '힘들면 쉬운 동작으로 하세요'],
        caution: '앉았다 일어나기는 의자를 벽에 붙이고 요양보호사가 옆에서 보조합니다. 뒤꿈치 들기와 다리 옆으로 들기는 서서 하는 동작이므로 의자를 잡게 하고, 서기 어려운 어르신은 앉아서 무릎 펴기까지만 참여합니다',
      },
      {
        id: 'p30-3',
        order: 3,
        title: '마무리운동',
        subtitle: '스트레칭과 호흡',
        goal: '다리 뒤쪽과 가슴, 목을 늘리고 배 호흡으로 숨을 고릅니다',
        tone: 'ink',
        moves: [n.toePull, n.chestStretch, n.neckTilt, n.bellyBreath],
        cues: ['오늘도 수고 많으셨어요', '천천히 숨을 내쉬어요', '물 한 잔 드세요'],
        caution: '운동 후 5분간 어르신의 안색과 호흡을 관찰합니다',
      },
    ],
    effects: [
      { category: '신체적', text: '발목·어깨·등을 풀어 몸이 굳지 않게 유지' },
      { category: '신체적', text: '허벅지·엉덩이·종아리 근력을 길러 일어서기와 걷기를 돕는 것이 목표' },
      { category: '건강', text: '다리 근력을 유지해 넘어질 위험을 줄이는 것이 목표' },
      { category: '건강', text: '세트 사이에 쉬는 시간을 둔 구성으로 숨이 차지 않게 진행' },
      { category: '정서·인지', text: '구령에 맞춰 횟수를 세며 주의 집중과 참여 의욕 유지' },
    ],
    safetyGuide,
  },
  {
    id: 'p50',
    name: '통합 프로그램 50분',
    minutes: 50,
    tagline: '다리 운동을 더 길게, 걷는 힘까지 기르는 운동',
    description:
      '50분 프로그램은 30분 구성의 본운동에 앉아서 무릎 펴기와 의자 잡고 다리 뒤로 들기를 더해, 다리 운동을 네 동작 약 29분으로 늘렸습니다. 준비운동과 마무리운동의 흐름은 같고, 어려우신 분을 위한 쉬운 동작이 세트마다 안내됩니다.',
    stages: [
      {
        id: 'p50-1',
        order: 1,
        title: '준비운동',
        subtitle: '몸 풀기',
        goal: '호흡과 함께 자세를 바로 하고 어깨를 돌려 몸을 데웁니다',
        tone: 'moss',
        moves: [m('복식 호흡', 2, '배가 부풀도록 깊게 들이쉬어요'), ex.shoulderRoll],
        cues: ['오늘 컨디션은 어떠세요?', '의자 앞쪽에 앉아 주세요', '불편하면 손을 들어 주세요'],
        caution: '시작 전에 어르신 전체의 안색과 호흡을 한 번씩 확인합니다',
      },
      {
        id: 'p50-2',
        order: 2,
        title: '본운동',
        subtitle: '상체 펴기와 다리 힘 기르기',
        goal: '가슴과 등을 편 뒤 허벅지·종아리·엉덩이 힘을 길러 일어서기와 걷기를 돕습니다',
        tone: 'coral',
        moves: [ex.chestOpen, ex.trunkTwist, ex.kneeExtension, ex.heelRaise, ex.sitToStand, ex.hipExtension],
        cues: ['통증이 없는 범위까지만', '다리를 차지 말고 천천히', '의자 등받이를 꼭 잡아요', '힘들면 쉬운 동작으로 하세요', '아주 잘하고 계세요'],
        caution: '서는 동작 두 가지는 요양보호사 1인당 어르신 3명 이내로 보조하고, 어지러우면 바로 앉혀 쉬게 합니다. 파킨슨 어르신은 동작이 바뀔 때 시간을 더 드립니다',
      },
      {
        id: 'p50-3',
        order: 3,
        title: '마무리운동',
        subtitle: '걷고 숨 고르기',
        goal: '앉아서 걷는 동작으로 리듬을 올린 뒤 호흡으로 가라앉힙니다',
        tone: 'ink',
        moves: [ex.seatedMarch, m('마무리 호흡', 2, '숨을 크게 들이쉬고, 길게 내쉬어요')],
        cues: ['오늘도 수고 많으셨어요', '천천히 숨을 내쉬어요', '물 한 잔 드세요'],
        caution: '운동 후 수분을 제공하고 5분간 관찰합니다',
      },
    ],
    effects: [
      { category: '건강', text: '약 29분의 다리 근력 운동으로 근력을 유지하고 넘어질 위험을 줄이는 것이 목표' },
      { category: '건강', text: '세트와 쉬는 시간을 나눈 구성으로 숨이 차지 않게 진행' },
      { category: '신체적', text: '허벅지 앞·엉덩이·종아리 근력 강화로 걷기와 계단 오르기 보조' },
      { category: '신체적', text: '어깨·가슴·등이 굳지 않게 유지하고 굽은 자세 완화' },
      { category: '정서·인지', text: '좌우를 번갈아 세는 동작으로 주의 집중 유지' },
      { category: '정서·인지', text: '여럿이 구령을 맞추는 집단 운동으로 사회적 교류' },
    ],
    safetyGuide,
  },
]

/**
 * 이름과 길이만 정해지고 영상은 아직 없는 프로그램. 목록에 "준비 중"으로만 보이고 시작할 수 없습니다.
 * 영상이 오면 programs로 옮기고 여기서 지웁니다.
 */
export const upcomingPrograms = [{ id: 'c30', name: '인지 향상 훈련 30분', minutes: 30, kind: '인지 향상 훈련' }] as const

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
