import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link2, Unlink, X } from 'lucide-react'
import { Btn, Dot } from './dash'
import { joinRoom, leaveRoom, syncReady, useSync, type JoinResult } from '../lib/sync'

const problems: Record<Exclude<JoinResult, 'ok'>, string> = {
  'bad-code': '코드는 숫자 여섯 자리입니다',
  'no-tv': '이 코드로 켜진 TV를 찾지 못했습니다. TV 화면의 코드를 다시 확인해 주세요',
  offline: '연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요',
}

/** 연결 코드를 세 자리씩 띄어 읽기 쉽게 */
export const spaced = (code: string) => `${code.slice(0, 3)} ${code.slice(3)}`

/** 태블릿·PC에서 다른 기기의 TV와 묶는 버튼과 창 */
export default function TvLink() {
  const sync = useSync()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!syncReady) return null

  const linked = sync.room !== null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    const result = await joinRoom(code)
    setBusy(false)
    if (result === 'ok') {
      setCode('')
      setOpen(false)
    } else {
      setProblem(problems[result])
      input.current?.focus()
    }
  }

  return (
    <>
      <Btn size="lg" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Link2 className="h-4 w-4 text-d-3" /> <span className="hidden sm:inline">{linked ? `코드 ${spaced(sync.room ?? '')}` : 'TV 연결'}</span>
      </Btn>

      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 grid place-items-center bg-[rgba(16,24,40,0.32)] p-4" onClick={() => setOpen(false)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="tvlink-title"
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] rounded-2xl bg-white p-6 text-left shadow-[0_0_0_1px_rgba(16,24,40,0.06),0_24px_48px_-12px_rgba(16,24,40,0.28)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="tvlink-title" className="text-[19px] font-semibold tracking-[-0.02em]">
                  {linked ? 'TV와 연결되어 있습니다' : 'TV와 연결하기'}
                </h2>
                <button type="button" aria-label="닫기" onClick={() => setOpen(false)} className="press -mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-d-3 hover:bg-d-hover hover:text-d-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {linked ? (
                <>
                  <p className="tnum mt-5 text-[34px] font-semibold leading-none tracking-[0.04em]">{spaced(sync.room ?? '')}</p>
                  <p className="mt-4 flex items-center gap-2 text-[14px] text-d-2">
                    <Dot tone={sync.link === 'lost' ? 'bad' : sync.tv ? 'ok' : 'warn'} />
                    {sync.link === 'lost' ? '연결이 끊겨 다시 시도하고 있습니다' : sync.tv ? '이 코드의 TV가 켜져 있습니다' : '이 코드의 TV가 꺼져 있거나 아직 응답이 없습니다'}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-d-3">이 태블릿에서 재생, 일시정지, 단계 이동을 누르면 TV가 따라갑니다. 같은 와이파이가 아니어도 인터넷만 되면 됩니다.</p>
                  <div className="mt-6 flex justify-end gap-2">
                    <Btn
                      size="lg"
                      onClick={() => {
                        leaveRoom()
                        setOpen(false)
                      }}
                    >
                      <Unlink className="h-4 w-4 text-d-3" /> 연결 끊기
                    </Btn>
                    <Btn size="lg" variant="primary" onClick={() => setOpen(false)}>
                      확인
                    </Btn>
                  </div>
                </>
              ) : (
                <form onSubmit={submit}>
                  <p className="mt-2 text-[14px] leading-relaxed text-d-2">TV에서 이 사이트의 TV 화면을 열면 여섯 자리 코드가 보입니다. 그 코드를 입력해 주세요.</p>
                  <label htmlFor="tvlink-code" className="mt-5 block text-[13px] font-medium text-d-2">
                    연결 코드
                  </label>
                  <input
                    id="tvlink-code"
                    ref={input}
                    autoFocus
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={7}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      setProblem('')
                    }}
                    placeholder="000000"
                    aria-invalid={problem ? true : undefined}
                    aria-describedby={problem ? 'tvlink-problem' : undefined}
                    className="tnum mt-1.5 h-14 w-full rounded-xl border border-d-line2 px-4 text-[26px] font-semibold tracking-[0.18em] outline-none placeholder:font-normal placeholder:text-d-line2 focus:border-d-a"
                  />
                  {problem ? (
                    <p id="tvlink-problem" role="alert" className="mt-2 text-[13px] leading-snug text-d-bad">
                      {problem}
                    </p>
                  ) : null}
                  <div className="mt-6 flex justify-end gap-2">
                    <Btn size="lg" onClick={() => setOpen(false)}>
                      취소
                    </Btn>
                    <Btn size="lg" variant="primary" type="submit" disabled={code.length !== 6 || busy}>
                      {busy ? '연결하는 중' : '연결'}
                    </Btn>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
