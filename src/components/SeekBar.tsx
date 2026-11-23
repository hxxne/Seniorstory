import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { moveAt, moveStartSec, stageDuration, type Stage } from '../data/programs'
import { fmtClock } from '../lib/useStageClock'
import { cx } from './dash'

/**
 * 단계 진행 막대. 누르거나 끌어서 그 단계 안의 원하는 시각으로 옮깁니다.
 * 끄는 동안에는 미리보기만 움직이고, 손을 뗄 때 한 번만 옮깁니다 (TV가 끄는 내내 따라 움직이지 않게).
 * 동작이 바뀌는 지점에 눈금이 있고, 끄는 동안 그 위치의 동작 이름과 시각을 보여 줍니다.
 */
export default function SeekBar({ stage, elapsed, playing, disabled = false, onSeek }: { stage: Stage; elapsed: number; playing: boolean; disabled?: boolean; onSeek: (sec: number) => void }) {
  const track = useRef<HTMLDivElement>(null)
  const [drag, setDragState] = useState<number | null>(null)
  // 화면이 다시 그려지기 전에 손을 떼도(아주 짧게 누른 경우) 위치를 잃지 않게 따로 들고 있습니다
  const dragging = useRef<number | null>(null)
  const setDrag = (v: number | null) => {
    dragging.current = v
    setDragState(v)
  }
  const total = stageDuration(stage)
  const last = Math.max(0, total - 1)
  const clamp = (sec: number) => Math.max(0, Math.min(last, sec))

  const at = (clientX: number) => {
    const r = track.current?.getBoundingClientRect()
    if (!r || !r.width) return elapsed
    return clamp(((clientX - r.left) / r.width) * total)
  }

  const shown = drag ?? elapsed
  const pct = total ? (shown / total) * 100 : 0
  const here = moveAt(stage, shown)
  const tone = playing ? 'bg-d-a' : 'bg-d-warn'

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag(at(e.clientX))
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== null) setDrag(at(e.clientX))
  }
  const up = () => {
    const to = dragging.current
    if (to === null) return
    onSeek(Math.round(to))
    setDrag(null)
  }

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -30, PageUp: 30 }[e.key]
    if (step !== undefined) onSeek(Math.round(clamp(elapsed + step)))
    else if (e.key === 'Home') onSeek(0)
    else return
    e.preventDefault()
  }

  return (
    <div className="mt-3">
      <div
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="단계 진행 위치. 끌어서 되돌리거나 앞으로 넘깁니다"
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={Math.round(shown)}
        aria-valuetext={`${fmtClock(shown)} / ${fmtClock(total)}, ${here.move.name}`}
        aria-disabled={disabled}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={key}
        className={cx('group relative h-11 touch-none select-none rounded-md', disabled ? 'opacity-50' : 'cursor-pointer')}
      >
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-d-line">
          <div className={cx('h-full rounded-full', tone, drag === null && 'transition-[width] duration-500 ease-linear')} style={{ width: `${pct}%` }} />
        </div>
        {/* 동작이 바뀌는 지점 */}
        {stage.moves.slice(1).map((mv, i) => (
          <span key={mv.name} aria-hidden className="absolute top-1/2 h-2 w-[3px] -translate-x-1/2 -translate-y-1/2 bg-white" style={{ left: `${(moveStartSec(stage, i + 1) / total) * 100}%` }} />
        ))}
        <span
          aria-hidden
          className={cx('absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(16,24,40,0.3)]', tone, drag === null && 'transition-[left,transform] duration-500 ease-linear', drag !== null && 'scale-125')}
          style={{ left: `${pct}%` }}
        />
        {drag !== null ? (
          <span aria-hidden className="tnum pointer-events-none absolute bottom-full mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-d-1 px-2.5 py-1.5 text-[13px] font-medium text-white" style={{ left: `clamp(70px, ${pct}%, calc(100% - 70px))` }}>
            {fmtClock(shown)} · {here.move.name}
          </span>
        ) : null}
      </div>
      <p className="tnum -mt-1 flex justify-between text-[12px] text-d-3">
        <span>{fmtClock(shown)}</span>
        <span>{fmtClock(total)}</span>
      </p>
    </div>
  )
}
