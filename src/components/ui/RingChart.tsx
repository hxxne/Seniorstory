import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export interface RingSegment {
  value: number
  color: string
  label: string
}

interface RingChartProps {
  segments: RingSegment[]
  size?: number
  stroke?: number
  /** 0~1. 생략하면 segments 합을 가득 채운 비율로 봅니다 */
  total?: number
  children?: ReactNode
  trackColor?: string
  className?: string
  animate?: boolean
}

/**
 * 다중 세그먼트 링 차트. 세그먼트는 12시 방향부터 시계 방향으로 쌓입니다.
 */
export default function RingChart({
  segments,
  size = 160,
  stroke = 14,
  total,
  children,
  trackColor = 'rgba(20,37,31,0.08)',
  className = '',
  animate = true,
}: RingChartProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const sum = total ?? segments.reduce((a, s) => a + s.value, 0)
  // 각 세그먼트의 시작 오프셋(앞선 세그먼트 길이의 누적)
  const offsets = segments.reduce<number[]>((acc, _seg, i) => {
    const prev = i === 0 ? 0 : acc[i - 1] + (sum ? segments[i - 1].value / sum : 0) * c
    acc.push(prev)
    return acc
  }, [])

  return (
    <div className={`relative inline-grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const frac = sum ? seg.value / sum : 0
          const dash = frac * c
          return (
            <motion.circle
              key={seg.label + i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap={segments.length === 1 ? 'round' : 'butt'}
              strokeDasharray={`${dash} ${c - dash}`}
              initial={animate ? { strokeDashoffset: c } : false}
              animate={{ strokeDashoffset: -offsets[i] }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            />
          )
        })}
      </svg>
      {children ? <div className="absolute inset-0 grid place-items-center">{children}</div> : null}
    </div>
  )
}
