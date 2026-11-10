interface LogoProps {
  className?: string
  /** 어두운 배경 위 */
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

/** MediMove 기호: 붉은 M 위에 금색 체크. 어두운 배경에서는 M만 흰색으로 바꿉니다 */
export function LogoMark({ size = 28, inverse = false, className = '' }: { size?: number; inverse?: boolean; className?: string }) {
  return (
    <svg viewBox="5 2.5 50 50" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden>
      <path d="M5,45 V5 H18 L30,22 L42,5 H55 V45 H43 V22 L30,40 L17,22 V45 Z" fill={inverse ? '#FFFFFF' : RED} />
      <path d="M30,40 L45,15 L55,25 L30,50 Z" fill={GOLD} />
    </svg>
  )
}

/** 글자 표지: Medi는 붉은색(어두운 배경에서는 흰색), Move는 금색 */
export function Wordmark({ inverse = false, className = '' }: { inverse?: boolean; className?: string }) {
  return (
    <span className={`font-dash font-bold tracking-[-0.03em] ${className}`}>
      <span style={{ color: inverse ? '#FFFFFF' : RED }}>Medi</span>
      <span style={{ color: GOLD }}>Move</span>
    </span>
  )
}

export default function Logo({ className = '', inverse = false, compact = false, tone = 'brand', size = 28 }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} inverse={inverse} />
      {!compact ? <Wordmark inverse={inverse} className={tone === 'neutral' ? 'text-[16px]' : 'text-[20px]'} /> : null}
    </span>
  )
}
