import { useId, useState, type PointerEvent } from 'react'

interface SparklineProps {
  data: number[]
  labels?: string[]
  width?: number
  height?: number
  color?: string
  unit?: string
  target?: number
  className?: string
  onHover?: (index: number | null) => void
}

/**
 * 인터랙티브 스파크라인: 마우스/터치 위치의 데이터 포인트를 하이라이트하고
 * 값·레이블 툴팁을 표시합니다. 포인터가 없으면 마지막 값을 강조합니다.
 */
export default function Sparkline({
  data,
  labels,
  width = 240,
  height = 72,
  color = '#2E7D5B',
  unit = '',
  target,
  className = '',
  onHover,
}: SparklineProps) {
  const [hover, setHover] = useState<number | null>(null)
  const gid = useId()
  const pad = 6
  const min = Math.min(...data, target ?? Infinity)
  const max = Math.max(...data, target ?? -Infinity)
  const span = max - min || 1
  const x = (i: number) => pad + (i / (data.length - 1)) * (width - pad * 2)
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2 - 10) + 4

  const path = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const area = `${path} L${x(data.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`
  const active = hover ?? data.length - 1
  const ax = x(active)
  const ay = y(data[active])

  const handleMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * width
    const idx = Math.round(((px - pad) / (width - pad * 2)) * (data.length - 1))
    const clamped = Math.max(0, Math.min(data.length - 1, idx))
    setHover(clamped)
    onHover?.(clamped)
  }
  const handleLeave = () => {
    setHover(null)
    onHover?.(null)
  }

  const tipLeft = Math.min(Math.max(ax, 36), width - 36)

  return (
    <div className={`relative ${className}`} style={{ width: '100%', aspectRatio: `${width} / ${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full touch-none overflow-visible"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        role="img"
        aria-label={`최근 ${data.length}개 구간 추이`}
      >
        <defs>
          <linearGradient id={`${gid}-g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {target !== undefined ? (
          <line
            x1={pad}
            x2={width - pad}
            y1={y(target)}
            y2={y(target)}
            stroke="rgba(20,37,31,0.25)"
            strokeDasharray="3 4"
            strokeWidth={1}
          />
        ) : null}
        <path d={area} fill={`url(#${gid}-g)`} />
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={ax} x2={ax} y1={ay} y2={height} stroke={color} strokeOpacity={0.35} strokeWidth={1} />
        <circle cx={ax} cy={ay} r={4.5} fill="#fff" stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        className="pointer-events-none absolute -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium leading-none text-white shadow-card transition-[left] duration-150 ease-out"
        style={{ left: `${(tipLeft / width) * 100}%` }}
      >
        <span className="tnum">
          {data[active]}
          {unit}
        </span>
        {labels?.[active] ? <span className="ml-1.5 text-white/60">{labels[active]}</span> : null}
      </div>
    </div>
  )
}
