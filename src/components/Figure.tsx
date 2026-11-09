import { motion } from 'motion/react'

/** 운동 코치 실루엣: 좌우로 팔을 들어 올리는 반복 모션 (TV·랜딩 공용) */
export default function Figure({ className = '', color = '#C9E7D4', floor = '#5F8F78' }: { className?: string; color?: string; floor?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`h-[62%] w-auto ${className}`}
      fill="none"
      stroke={color}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="100" cy="42" r="16" fill={color} stroke="none" />
      <path d="M100 62v62" />
      <motion.path
        d="M100 76 L64 104"
        animate={{ d: ['M100 76 L64 104', 'M100 76 L58 54', 'M100 76 L64 104'] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.path
        d="M100 76 L136 104"
        animate={{ d: ['M100 76 L136 104', 'M100 76 L142 54', 'M100 76 L136 104'] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M100 124 L78 170" />
      <path d="M100 124 L122 170" />
      <path d="M60 172 H140" stroke={floor} strokeWidth="4" />
    </svg>
  )
}
