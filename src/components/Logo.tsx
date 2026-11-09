interface LogoProps {
  className?: string
  /** 어두운 배경 위 */
  inverse?: boolean
  compact?: boolean
  /** 대시보드·태블릿·TV: 색을 뺀 중립 마크 */
  tone?: 'brand' | 'neutral'
  /** 마크 크기(px) */
  size?: number
}

/** 랜딩과 같은 육각 마크: 잉크 육각형 위에 라임색 사람 형상 */
export default function Logo({ className = '', inverse = false, compact = false, tone = 'brand', size = 28 }: LogoProps) {
  const neutral = tone === 'neutral'
  const hex = neutral ? (inverse ? '#FFFFFF' : '#1C1C1F') : inverse ? '#C6F35C' : '#10291A'
  const figure = neutral ? (inverse ? '#0B0D11' : '#FFFFFF') : inverse ? '#10291A' : '#C6F35C'
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" width={size} height={size} className="shrink-0" aria-hidden>
        <path d="M16 2l12 7v14l-12 7-12-7V9z" fill={hex} />
        <g fill="none" stroke={figure} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="9.5" r="2.1" fill={figure} stroke="none" />
          <path d="M10.5 14l5.5 1.4 5.5-1.4" />
          <path d="M16 15.5v4l-3 3.6" />
          <path d="M16 19.5l3 3.6" />
        </g>
      </svg>
      {!compact ? <span className={neutral ? `text-[15px] font-semibold tracking-[-0.01em] ${inverse ? 'text-white' : 'text-d-1'}` : `font-serif text-[19px] font-semibold tracking-[-0.02em] ${inverse ? 'text-white' : 'text-ink'}`}>시니어스토리</span> : null}
    </span>
  )
}
