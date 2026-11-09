import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

/* ---------- Tag (조용한 라벨) ---------- */

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-6 items-center gap-2 rounded-md px-2 text-[12px] font-medium leading-none ${className}`}>
      {children}
    </span>
  )
}

/* ---------- Button ---------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber' | 'lime'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const variantClass: Record<Variant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-2 border border-ink',
  /* 화면에서 단 하나의 핵심 행동에만 쓰는 라임 버튼 */
  lime: 'bg-lime text-ink hover:bg-lime-2 border border-lime-2',
  secondary: 'bg-white text-ink border border-ink/10 hover:bg-sand-100',
  ghost: 'bg-transparent text-ink-2 hover:bg-ink/5 border border-transparent',
  danger: 'bg-coral text-white hover:bg-coral-deep border border-coral-deep/30',
  amber: 'bg-amber text-ink hover:bg-[#DD962F] border border-amber-deep/30',
}
const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-lg gap-2',
  md: 'h-10 px-4 text-[14px] rounded-[10px] gap-2',
  lg: 'h-12 px-5 text-[15px] rounded-[10px] gap-2',
  xl: 'h-14 px-6 text-[16px] rounded-xl gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
}

export function Button({ variant = 'primary', size = 'md', className = '', to, children, ...rest }: ButtonProps) {
  const cls = `press inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:pointer-events-none ${variantClass[variant]} ${sizeClass[size]} ${className}`
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

/* ---------- Section heading ---------- */

export function SectionTitle({
  title,
  action,
  className = '',
}: {
  /** 하위 호환용, 더 이상 렌더링하지 않습니다 */
  eyebrow?: string
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      {action}
    </div>
  )
}

/* ---------- Status ---------- */

export const statusMeta = {
  normal: { label: '정상', cls: 'bg-moss-50 text-moss-700 border-moss-200', dot: 'bg-moss-500' },
  caution: { label: '주의', cls: 'bg-amber-soft text-amber-deep border-amber/40', dot: 'bg-amber' },
  rest: { label: '휴식', cls: 'bg-coral-soft text-coral-deep border-coral/40', dot: 'bg-coral' },
} as const

export function StatusPill({ status }: { status: keyof typeof statusMeta }) {
  const m = statusMeta[status]
  return (
    <Badge className={`border ${m.cls}`}>
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
    </Badge>
  )
}

/* ---------- Cue bar (시그니처) ----------
 * TV 하단 큐잉 자막의 노랑·검정 고대비 바. 랜딩·대시보드·태블릿에서 같은 형태로 반복됩니다.
 */
export function CueBar({ children, size = 'md', className = '' }: { children: ReactNode; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = size === 'sm' ? 'px-3 py-2 text-[13px] rounded-lg' : size === 'lg' ? 'px-5 py-4 text-[20px] rounded-xl' : 'px-4 py-3 text-[15px] rounded-[10px]'
  return <div className={`bg-tv-bg text-center font-semibold leading-snug text-tv-cue ${s} ${className}`}>{children}</div>
}
