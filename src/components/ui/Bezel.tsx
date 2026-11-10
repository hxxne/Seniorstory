import type { HTMLAttributes, ReactNode } from 'react'

interface BezelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** 안쪽 패널 클래스 */
  innerClassName?: string
  /** 바깥 베젤 톤 */
  tone?: 'sand' | 'moss' | 'dark'
}

/**
 * Double-Bezel 카드: 바깥 프레임(베젤) + 안쪽 패널.
 * 하드웨어 기기(TV·태블릿)의 베젤을 연상시키는 MediMove의 기본 컨테이너입니다.
 * 바깥 28px, 안쪽 22px = 28 − 6px 패딩.
 */
export default function Bezel({ children, className = '', innerClassName = '', tone = 'sand', ...rest }: BezelProps) {
  const outer =
    tone === 'moss'
      ? 'rounded-bezel border border-white/10 bg-moss-800 p-1.5'
      : tone === 'dark'
        ? 'rounded-bezel border border-white/10 bg-[#121C17] p-1.5'
        : 'bezel'
  const inner =
    tone === 'moss'
      ? 'rounded-bezel-in border border-white/[0.08] bg-moss-900'
      : tone === 'dark'
        ? 'rounded-bezel-in border border-white/[0.08] bg-tv-bg'
        : 'bezel-inner'
  return (
    <div className={`${outer} ${className}`} {...rest}>
      <div className={`${inner} ${innerClassName}`}>{children}</div>
    </div>
  )
}
