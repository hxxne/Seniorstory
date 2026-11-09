/* 대시보드·태블릿 공용 부품 (Linear·Notion 계열)
 * 흰 바탕, 가는 구분선, 차분한 파랑 하나. 상자를 쌓지 않고 여백과 선으로 나눕니다.
 * 반경: 컨트롤 6px, 미디어 8~12px. 본문 14px, 보조 13px, 메타 12px. */
import { useId, useState, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

const ease = [0.22, 1, 0.36, 1] as const
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

/* ---------- 버튼 ---------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'xl'
const variants: Record<Variant, string> = {
  primary: 'bg-d-a text-white shadow-[0_1px_2px_rgba(16,24,40,0.12)] hover:bg-d-a2',
  secondary: 'border border-d-line2 bg-white text-d-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-d-hover',
  ghost: 'text-d-2 hover:bg-d-hover hover:text-d-1',
  danger: 'bg-d-bad text-white shadow-[0_1px_2px_rgba(16,24,40,0.12)] hover:bg-[#C43F3F]',
}
const sizes: Record<Size, string> = {
  sm: 'h-7 gap-1.5 rounded-md px-2 text-[13px]',
  md: 'h-8 gap-2 rounded-md px-3 text-[13px]',
  lg: 'h-10 gap-2 rounded-lg px-4 text-[14px]',
  xl: 'h-14 gap-2 rounded-xl px-5 text-[16px]',
}
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
}
export function Btn({ variant = 'secondary', size = 'md', to, className, children, ...rest }: BtnProps) {
  const cls = cx('press inline-flex items-center justify-center whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-45', variants[variant], sizes[size], className)
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-d-2 transition-colors hover:text-d-a">
      {children}
    </Link>
  )
}

/* ---------- 페이지 틀 ---------- */

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto w-full max-w-[1120px] px-5 pb-24 sm:px-8 lg:px-12', className)}>{children}</div>
}

export function PageHead({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pb-6 pt-10">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-d-1">{title}</h1>
        {description ? <p className="mt-1.5 text-[14px] text-d-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

/* ---------- 섹션 머리 ---------- */

export function SectionHead({ title, count, aside, className }: { title: string; count?: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center justify-between gap-4 border-b border-d-line pb-2.5', className)}>
      <h2 className="flex items-baseline gap-2 text-[15px] font-semibold text-d-1">
        {title}
        {count !== undefined ? <span className="tnum text-[13px] font-normal text-d-3">{count}</span> : null}
      </h2>
      {aside ? <div className="shrink-0 text-[13px] text-d-3">{aside}</div> : null}
    </div>
  )
}

/* ---------- 상태 아이콘: 빈 원 → 채워지는 원 → 체크 ---------- */

export type StatusKind = 'todo' | 'progress' | 'done' | 'paused' | 'alert'
export function StatusIcon({ kind, value = 0.5, size = 16, className }: { kind: StatusKind; value?: number; size?: number; className?: string }) {
  const r = 3.25
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={cx('shrink-0', className)} aria-hidden>
      {kind === 'todo' ? <circle cx="8" cy="8" r="6.25" fill="none" stroke="#B9B9C0" strokeWidth="1.5" /> : null}
      {kind === 'progress' ? (
        <>
          <circle cx="8" cy="8" r="6.25" fill="none" stroke="#2F5FE3" strokeWidth="1.5" />
          <circle cx="8" cy="8" r={r} fill="none" stroke="#2F5FE3" strokeWidth={r * 2} strokeDasharray={`${Math.max(0.04, Math.min(1, value)) * c} ${c}`} transform="rotate(-90 8 8)" />
        </>
      ) : null}
      {kind === 'done' ? (
        <>
          <circle cx="8" cy="8" r="7" fill="#2F5FE3" />
          <path d="M5 8.2l2 2 4-4.2" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {kind === 'paused' ? (
        <>
          <circle cx="8" cy="8" r="6.25" fill="none" stroke="#C4860A" strokeWidth="1.5" />
          <path d="M6.4 5.6v4.8M9.6 5.6v4.8" stroke="#C4860A" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : null}
      {kind === 'alert' ? (
        <>
          <circle cx="8" cy="8" r="7" fill="#D94B4B" />
          <path d="M8 4.6v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="8" cy="11.2" r="0.9" fill="#fff" />
        </>
      ) : null}
    </svg>
  )
}

/* ---------- 작은 표시들 ---------- */

export type Tone = 'ok' | 'warn' | 'bad' | 'live' | 'idle' | 'accent'
const dotTone: Record<Tone, string> = { ok: 'bg-d-ok', warn: 'bg-d-warn', bad: 'bg-d-bad', live: 'bg-d-bad', idle: 'bg-d-line2', accent: 'bg-d-a' }
export function Dot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  return <span className={cx('inline-block h-2 w-2 shrink-0 rounded-full', dotTone[tone], pulse && 'animate-pulse')} />
}

export const statusTone = { normal: 'ok', caution: 'warn', rest: 'bad' } as const
export const statusLabel = { normal: '정상', caution: '주의', rest: '휴식' } as const

/** 라벨: 점과 글자가 든 얇은 테두리 칩 */
export function Label({ tone, children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-d-line2 px-2 text-[12px] text-d-2">
      {tone ? <Dot tone={tone} /> : null}
      {children}
    </span>
  )
}

/** 모노그램 아바타: 이름에서 고른 여섯 가지 차분한 바탕 */
const avatarTones = ['bg-[#E6EEFD] text-[#2B4FB8]', 'bg-[#E4F3EA] text-[#256F48]', 'bg-[#FBEFD9] text-[#8A5E08]', 'bg-[#FBE7E7] text-[#A93838]', 'bg-[#E9ECF1] text-[#4A5568]', 'bg-[#E0F1F4] text-[#1F6C7A]']
export function Avatar({ name, size = 24, dim }: { name: string; size?: number; dim?: boolean }) {
  const tone = avatarTones[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % avatarTones.length]
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full font-medium', dim ? 'bg-d-hover text-d-3' : tone)} style={{ width: size, height: size, fontSize: Math.round(size * 0.46) }} aria-hidden>
      {name.slice(0, 1)}
    </span>
  )
}

/** 체크 상자: 할 일 목록용 */
export function CheckBox({ on }: { on: boolean }) {
  return (
    <span className={cx('mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition-colors duration-150', on ? 'border-d-a bg-d-a' : 'border-[#B9B9C0] bg-white')} aria-hidden>
      {on ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3">
          <path d="M4 8.2l2.6 2.6L12 5.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
  )
}

/** 지표 옆에 붙는 작은 추이선 */
export function MiniLine({ data, color = '#8B8B93', width = 72, height = 24 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * (width - 4) + 2).toFixed(1)},${((1 - (v - min) / (max - min || 1)) * (height - 6) + 3).toFixed(1)}`)
  const last = pts[pts.length - 1].split(',')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={color} />
    </svg>
  )
}

/* ---------- 분할 선택 ---------- */

export function Seg<T extends string>({ id, value, options, onChange, label }: { id: string; value: T; options: readonly (readonly [T, string, ReactNode?])[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex gap-0.5 rounded-lg bg-d-hover p-0.5">
      {options.map(([k, l, n]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={cx('relative h-7 rounded-md px-3 text-[13px] transition-colors duration-150', value === k ? 'font-medium text-d-1' : 'text-d-2 hover:text-d-1')}>
          {value === k ? <motion.span layoutId={id} className="absolute inset-0 rounded-md bg-white shadow-[0_1px_2px_rgba(16,24,40,0.1)]" transition={{ duration: 0.18, ease }} /> : null}
          <span className="relative inline-flex items-center gap-1.5">
            {l}
            {n !== undefined ? <span className="tnum text-[12px] font-normal text-d-3">{n}</span> : null}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ---------- 스위치 ---------- */

export function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={cx('press relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150', on ? 'bg-d-a' : 'bg-d-line2')}>
      <span className={cx('absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.2)] transition-transform duration-150 ease-out', on && 'translate-x-4')} />
    </button>
  )
}

/* ---------- 면이 채워진 추이 차트 ---------- */

export function AreaChart({ data, labels, unit = '', target, height = 220, onHover, color = '#2F5FE3' }: { data: number[]; labels: string[]; unit?: string; target?: number; height?: number; onHover?: (i: number | null) => void; color?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const gid = useId()
  const min = Math.min(...data, target ?? Infinity)
  const max = Math.max(...data, target ?? -Infinity)
  const step = max - min > 15 ? 10 : 5
  const lo = Math.floor((min - step * 0.4) / step) * step
  const hi = Math.ceil((max + step * 0.2) / step) * step
  const x = (i: number) => (i / (data.length - 1)) * 100
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * 100
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  const ticks = Array.from({ length: (hi - lo) / step + 1 }, (_, i) => lo + i * step)
  const active = hover ?? data.length - 1

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((e.clientX - r.left) / r.width) * (data.length - 1))))
    setHover(i)
    onHover?.(i)
  }
  const leave = () => {
    setHover(null)
    onHover?.(null)
  }

  return (
    <div className="grid grid-cols-[32px_1fr] gap-x-2">
      <div className="relative" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="tnum absolute right-0 -translate-y-1/2 text-[11px] text-d-3" style={{ top: `${y(t)}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="relative touch-none" style={{ height }} onPointerMove={move} onPointerLeave={leave} role="img" aria-label={`최근 ${data.length}주 추이`}>
        {ticks.map((t) => (
          <span key={t} className="absolute inset-x-0 h-px bg-d-line" style={{ top: `${y(t)}%` }} />
        ))}
        {target !== undefined ? <span className="absolute inset-x-0 border-t border-dashed border-d-3/60" style={{ top: `${y(target)}%` }} /> : null}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L100,100 L0,100 Z`} fill={`url(#${gid})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute bottom-0 w-px bg-d-3/40" style={{ left: `${x(active)}%`, top: `${y(data[active])}%` }} />
        <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${x(active)}%`, top: `${y(data[active])}%`, borderColor: color }} />
        <span
          className="tnum pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-d-1 px-2 py-1 text-[12px] font-medium text-white shadow-[0_4px_12px_rgba(16,24,40,0.18)]"
          style={{ left: `${x(active)}%`, top: `${y(data[active])}%`, transform: `translate(${active > data.length - 3 ? '-100%' : active < 2 ? '0' : '-50%'}, calc(-100% - 12px))` }}
        >
          {data[active]}
          {unit} <span className="font-normal text-white/60">{labels[active]}</span>
        </span>
      </div>
      <span />
      <div className="tnum mt-2 flex justify-between text-[11px] text-d-3">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor((data.length - 1) / 2)]}</span>
        <span>{labels[data.length - 1]}</span>
      </div>
    </div>
  )
}
