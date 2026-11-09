export interface Move {
  name: string
  durationSec: number
  cue: string
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

export const programs: Program[] = [
  {
    id: 'p30',
    name: '통합 프로그램 30분',
    minutes: 30,
    tagline: '아침을 여는 가벼운 전신 순환',
    description:
      '좌식 중심으로 구성된 30분 통합 운동입니다. 호흡으로 몸을 깨우고, 관절을 부드럽게 돌린 뒤 가벼운 근력·균형 동작으로 이어집니다. 휠체어 어르신도 모든 동작에 참여할 수 있습니다.',
    stages: [
      {
        id: 'p30-1',
        order: 1,
        title: '준비 · 호흡',
        subtitle: '몸 깨우기',
        goal: '심박수를 서서히 올리고 호흡 리듬을 맞춥니다',
        tone: 'moss',
        moves: [
          m('복식 호흡', 1.5, '코로 천천히 들이쉬고, 입으로 길게 내쉬세요'),
          m('목 좌우 돌리기', 1.5, '어깨는 그대로, 고개만 천천히 돌려요'),
          m('어깨 으쓱 내리기', 2, '어깨를 귀까지 올렸다가 툭 내려요'),
        ],
        cues: ['천천히, 숨을 먼저 고르세요', '어깨에 힘을 빼요', '불편하면 손을 들어 주세요'],
        caution: '어지러움을 호소하면 즉시 멈추고 앉은 자세를 유지합니다',
      },
      {
        id: 'p30-2',
        order: 2,
        title: '관절 가동',
        subtitle: '부드럽게 돌리기',
        goal: '어깨·손목·발목의 가동범위를 유지합니다',
        tone: 'amber',
        moves: [
          m('팔 앞으로 뻗기', 2, '손끝을 앞으로 멀리 보내요'),
          m('손목 돌리기', 1.5, '손목을 크게, 둥글게 돌려요'),
          m('발목 펌프', 2, '발끝을 당기고, 다시 밀어요'),
          m('무릎 들어 올리기', 2.5, '한쪽 무릎을 가슴 쪽으로 천천히'),
        ],
        cues: ['통증이 없는 범위까지만', '숫자를 함께 세어 봐요, 하나, 둘', '좌우 번갈아 가며'],
        caution: '관절염 어르신은 가동범위를 70%로 제한하고 반동을 주지 않도록 안내합니다',
      },
      {
        id: 'p30-3',
        order: 3,
        title: '근력 · 균형',
        subtitle: '힘 기르기',
        goal: '하지 근력과 체간 안정성을 강화해 낙상을 예방합니다',
        tone: 'coral',
        moves: [
          m('앉아서 다리 뻗기', 3, '무릎을 펴고 3초 버텨요'),
          m('의자 잡고 일어서기', 3, '등받이를 잡고 천천히 일어나요'),
          m('옆으로 발 디디기', 3, '한 발씩 옆으로, 천천히'),
          m('팔 벌려 균형 잡기', 3, '팔을 벌리고 시선은 앞을 봐요'),
        ],
        cues: ['의자나 요양보호사의 손을 잡아도 좋아요', '숨을 참지 마세요', '힘들면 앉아서 따라 해요'],
        caution: '서는 동작은 요양보호사가 어르신 옆에 위치해 보조합니다. 휠체어 어르신은 좌식 변형 동작으로 진행합니다.',
      },
      {
        id: 'p30-4',
        order: 4,
        title: '마무리 · 이완',
        subtitle: '숨 고르기',
        goal: '심박수를 안정시키고 근육을 이완합니다',
        tone: 'ink',
        moves: [
          m('팔 늘려 스트레칭', 2, '두 팔을 하늘로, 길게 늘려요'),
          m('허벅지 뒤 스트레칭', 1.5, '발뒤꿈치를 앞으로, 상체를 살짝 숙여요'),
          m('마무리 호흡 · 박수', 1.5, '다 함께 큰 박수로 마무리해요'),
        ],
        cues: ['오늘도 수고 많으셨어요', '천천히 숨을 내쉬어요', '물 한 잔 드세요'],
        caution: '운동 후 5분간 어르신의 안색과 호흡을 관찰합니다',
      },
    ],
    effects: [
      { category: '의학적', text: '규칙적 유산소 자극으로 안정 시 혈압·혈당 변동 폭 완화' },
      { category: '의학적', text: '하지 근력 강화로 낙상 위험 감소' },
      { category: '신체적', text: '어깨·손목·발목 가동범위 유지 및 관절 강직 예방' },
      { category: '신체적', text: '체간 안정성 향상으로 보행 보조 의존도 완화' },
      { category: '정서·인지', text: '구령·박수 리듬을 통한 주의 집중 및 참여 의욕 향상' },
    ],
    safetyGuide: [
      { title: '시작 전 확인', detail: '혈압·안색·수면 상태를 확인하고 평소와 다르면 참여를 보류합니다' },
      { title: '배치', detail: '휠체어·보행기 어르신을 TV와 가까운 앞줄, 요양보호사 손이 닿는 위치에 배치합니다' },
      { title: '진행 중', detail: '서는 동작에서는 어르신 옆에 서서 보조하고, 불편 호소 시 태블릿의 상태 토글을 「주의」로 바꿉니다' },
      { title: '긴급 상황', detail: '전체 긴급 일시정지 버튼을 누르면 TV가 휴식 안내로 전환됩니다. 어르신을 앉히고 호흡을 유도합니다.' },
      { title: '마무리', detail: '운동 후 수분을 제공하고 5분간 관찰 뒤 출석 기록을 저장합니다' },
    ],
  },
  {
    id: 'p50',
    name: '통합 프로그램 50분',
    minutes: 50,
    tagline: '오후를 채우는 근력·인지 통합 세션',
    description:
      '50분 통합 세션은 근력·균형 블록을 20분으로 확장하고, 마무리에 인지 자극 동작을 결합했습니다. 중간 휴식 큐가 포함되어 있으며, 체력에 따라 좌식·입식을 선택할 수 있습니다.',
    stages: [
      {
        id: 'p50-1',
        order: 1,
        title: '준비 · 호흡',
        subtitle: '몸 깨우기',
        goal: '호흡과 함께 체온을 올리고 집중을 모읍니다',
        tone: 'moss',
        moves: [
          m('복식 호흡', 2, '배가 부풀도록 깊게 들이쉬어요'),
          m('목 · 어깨 풀기', 2.5, '고개를 천천히, 어깨를 둥글게'),
          m('손뼉 · 손가락 체조', 2, '손가락을 하나씩 접었다 펴요'),
          m('제자리 발 구르기', 1.5, '발로 바닥을 가볍게 톡톡'),
        ],
        cues: ['오늘 컨디션은 어떠세요?', '천천히 숨을 고르며 시작해요', '불편하면 손을 들어 주세요'],
        caution: '첫 5분 동안 어르신 전체의 안색과 호흡을 한 번씩 확인합니다',
      },
      {
        id: 'p50-2',
        order: 2,
        title: '관절 가동',
        subtitle: '크게 돌리기',
        goal: '전신 관절의 가동범위를 넓히고 혈액 순환을 촉진합니다',
        tone: 'amber',
        moves: [
          m('팔 크게 원 그리기', 2.5, '팔로 큰 원을 천천히 그려요'),
          m('몸통 좌우 비틀기', 2.5, '허리를 돌려 뒤를 바라봐요'),
          m('손목 · 발목 돌리기', 2, '손목과 발목을 동시에 돌려요'),
          m('무릎 들어 올리기', 2.5, '무릎을 들어 손바닥에 닿게'),
          m('발끝 · 뒤꿈치 번갈아', 2.5, '발끝, 뒤꿈치, 발끝, 뒤꿈치'),
        ],
        cues: ['통증 없는 범위까지만', '천천히 크게', '하나, 둘, 셋, 넷'],
        caution: '파킨슨 어르신은 동작 전환 시 추가 시간을 주고, 반동 없이 진행합니다',
      },
      {
        id: 'p50-3',
        order: 3,
        title: '근력 · 균형',
        subtitle: '힘 기르기',
        goal: '하지·체간 근력을 강화하고 동적 균형 능력을 높입니다',
        tone: 'coral',
        moves: [
          m('앉아서 다리 뻗기', 3.5, '무릎을 펴고 5초 버텨요'),
          m('의자 잡고 일어서기', 4, '천천히 일어나고, 천천히 앉아요'),
          m('옆으로 발 디디기', 3, '옆으로 한 발, 다시 제자리'),
          m('중간 휴식 · 물 마시기', 2, '잠시 쉬어가요, 물 한 모금'),
          m('뒤꿈치 들기', 3.5, '뒤꿈치를 들고 3초, 내려요'),
          m('팔 벌려 균형 잡기', 4, '팔을 벌리고 한 발을 살짝 들어요'),
        ],
        cues: ['의자 등받이를 꼭 잡아요', '숨을 참지 마세요', '힘들면 앉아서 따라 해요', '아주 잘하고 있어요'],
        caution: '입식 동작은 요양보호사 1인당 어르신 3명 이내로 배치하고, 중간 휴식 큐에서 수분을 제공합니다',
      },
      {
        id: 'p50-4',
        order: 4,
        title: '인지 · 마무리',
        subtitle: '머리와 몸 함께',
        goal: '인지 자극 동작으로 집중력을 유지하며 심박수를 안정시킵니다',
        tone: 'ink',
        moves: [
          m('숫자 따라 손뼉', 2.5, '짝, 짝, 셋에 손뼉 치세요'),
          m('좌우 반대 동작', 2.5, '오른손은 위로, 왼손은 옆으로'),
          m('팔 늘려 스트레칭', 2, '두 팔을 하늘로, 길게 늘려요'),
          m('마무리 호흡 · 박수', 3, '다 함께 큰 박수로 마무리해요'),
        ],
        cues: ['틀려도 괜찮아요, 함께 웃어요', '천천히 숨을 내쉬어요', '오늘도 수고 많으셨어요'],
        caution: '인지 동작은 정답보다 참여를 칭찬합니다. 운동 후 5분간 관찰합니다.',
      },
    ],
    effects: [
      { category: '의학적', text: '20분 근력 블록으로 근감소증 진행 지연 및 낙상 위험 감소' },
      { category: '의학적', text: '규칙적 유산소 자극으로 혈압·혈당 변동 폭 완화' },
      { category: '신체적', text: '동적 균형 능력 향상으로 보행 속도·보폭 개선' },
      { category: '신체적', text: '전신 관절 가동범위 유지 및 강직 예방' },
      { category: '정서·인지', text: '좌우 반대 동작·숫자 손뼉으로 실행 기능 자극' },
      { category: '정서·인지', text: '집단 리듬 운동을 통한 우울감 완화와 사회적 교류' },
    ],
    safetyGuide: [
      { title: '시작 전 확인', detail: '혈압·안색·식사 여부를 확인하고, 식후 1시간 이내에는 강도를 낮춥니다' },
      { title: '배치', detail: '입식 가능 어르신은 뒷줄, 휠체어·보행기 어르신은 앞줄에 배치해 시야와 보조 동선을 확보합니다' },
      { title: '진행 중', detail: '근력 블록에서 요양보호사 1인당 3명 이내로 밀착 보조하고, 중간 휴식 큐에서 반드시 수분을 제공합니다' },
      { title: '상태 토글', detail: '얼굴 홍조·호흡 가쁨이 보이면 태블릿에서 해당 어르신을 「주의」, 지속되면 「휴식」으로 전환합니다' },
      { title: '긴급 상황', detail: '전체 긴급 일시정지로 TV를 휴식 안내로 전환하고, 어르신을 앉혀 호흡을 유도한 뒤 간호 인력에게 알립니다' },
      { title: '마무리', detail: '운동 후 수분 제공, 5분 관찰, 출석·완수 기록 저장을 완료합니다' },
    ],
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
