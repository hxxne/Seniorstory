interface LogoProps {
  className?: string
  /** 어두운 배경 위. 색은 바꾸지 않습니다: 로고는 어디서나 붉은색과 금색입니다 (2026-11-22 사용자 결정) */
  inverse?: boolean
  compact?: boolean
  /** 대시보드·태블릿·TV에서는 글자를 한 단계 작게 씁니다 */
  tone?: 'brand' | 'neutral'
  /** 마크 크기(px) */
  size?: number
}

export const BRAND = 'MediMove'
const RED = '#9E161C'
const GOLD = '#C39D5E'

/**
 * MediMove 기호: 넓은 붉은 M 안에 금색 체크가 오른쪽 위로 뻗습니다.
 * 가로가 세로의 1.34배입니다. 같은 도형이 logo/_src/logo.html과 overlay-templates/_src/template.html에도 있습니다.
 */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  const m = RED
  return (
    <svg viewBox="-1 -1 136.4 102" height={size} width={Math.round(size * 1.337)} className={`shrink-0 ${className}`} aria-hidden>
      <path d="M0,0 H30 L67.2,38.7 L104.4,0 H134.4 V100 H102.4 V48.2 L67.2,83.4 L32,48.2 V100 H0 Z" fill={m} stroke={m} strokeWidth="2" strokeLinejoin="round" />
      <path d="M104.4,12.4 H122.1 V28.5 L67.2,83.4 L48.9,65.1 Z" fill={GOLD} stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

/** 글자 표지: 각지고 굵은 Pretendard Black. Medi는 붉은색, Move는 금색 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-dash font-black tracking-[-0.035em] ${className}`}>
      <span style={{ color: RED }}>Medi</span>
      <span style={{ color: GOLD }}>Move</span>
    </span>
  )
}

export default function Logo({ className = '', compact = false, tone = 'brand', size = 28 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {!compact ? <Wordmark className={tone === 'neutral' ? 'text-[16px]' : 'text-[20px]'} /> : null}
    </span>
  )
}
