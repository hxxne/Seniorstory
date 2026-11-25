import { useEffect, useRef, useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Check, Play, Tv, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn, Dot, cx } from './dash'
import { pendingPrograms, readyPrograms, stageDuration } from '../data/programs'
import { openTv } from '../lib/launch'
import { closeSetup, startProgram, useStore } from '../lib/store'
import { joinRoom, syncReady, useSync, type JoinResult } from '../lib/sync'

const problems: Record<Exclude<JoinResult, 'ok'>, string> = {
  'bad-code': '코드는 숫자 여섯 자리입니다',
  'no-tv': '이 코드로 켜진 TV를 찾지 못했습니다. TV 화면의 코드를 다시 확인해 주세요',
  offline: '연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요',
}

/**
 * 로그인하거나 기관을 등록한 직후에 뜨는 창.
 * 1) TV 화면의 코드를 입력해 TV를 묶고 2) 프로그램을 고르면 진행 화면(태블릿)으로 넘어갑니다.
 * 닫으면 다음 로그인 때까지 다시 뜨지 않습니다.
 */
export default function StartGuide() {
  const navigate = useNavigate()
  const sync = useSync()
  const institution = useStore((s) => s.institution)
  const [step, setStep] = useState<1 | 2>(1)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [sent, setSent] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSetup()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // 코드를 보낸 뒤 TV가 들어오면 바로 다음 단계로 넘어갑니다
  useEffect(() => {
    if (sent && sync.tv) setStep(2)
  }, [sent, sync.tv])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setProblem('')
    setSent(false)
    const result = await joinRoom(code)
    setBusy(false)
    if (result === 'ok') {
      setCode('')
      setSent(true)
    } else {
      setProblem(problems[result])
      input.current?.focus()
    }
  }

  const choose = (id: string) => {
    startProgram(id, false)
    // 묶인 TV가 없으면 이 기기에서 TV 화면을 새 창으로 띄웁니다
    if (!sync.tv) openTv()
    closeSetup()
    navigate('/tablet')
  }

  const stepLabel = (n: 1 | 2, text: string) => (
    <span className={cx('inline-flex items-center gap-2 text-[13px]', step === n ? 'font-medium text-d-1' : 'text-d-3')}>
      <span className={cx('tnum grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold', step > n ? 'bg-d-ok text-white' : step === n ? 'bg-d-a text-white' : 'bg-d-hover text-d-3')}>{step > n ? <Check className="h-3 w-3" strokeWidth={3} /> : n}</span>
      {text}
    </span>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[rgba(16,24,40,0.32)] p-4">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="startguide-title"
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[520px] rounded-2xl bg-white p-6 text-left shadow-[0_0_0_1px_rgba(16,24,40,0.06),0_24px_48px_-12px_rgba(16,24,40,0.28)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {stepLabel(1, 'TV 연결')}
            <span aria-hidden className="h-px w-5 bg-d-line2" />
            {stepLabel(2, '프로그램 선택')}
          </div>
          <button type="button" aria-label="닫기" onClick={closeSetup} className="press -mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-d-3 hover:bg-d-hover hover:text-d-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={submit}>
            <h2 id="startguide-title" className="mt-5 text-[21px] font-semibold tracking-[-0.02em]">
              {institution ? <span className="nb">{institution.name},</span> : null} <span className="nb">TV부터 연결할까요</span>
            </h2>
            {sync.tv ? (
              <p className="mt-4 flex items-center gap-2 rounded-xl bg-d-hover px-4 py-3.5 text-[14px]">
                <Dot tone="ok" /> TV 화면이 연결되어 있습니다
              </p>
            ) : (
              <>
                <p className="mt-2 text-[14px] leading-relaxed text-d-2">
                  TV에서 <span className="nb font-medium text-d-1">medimove.co.kr/tv</span>를 열면 화면 아래에 <span className="nb">여섯 자리 코드가</span> 보입니다. 그 코드를 입력해 주세요. TV에 <span className="nb">「기관 계정에 연결되어 있습니다」가</span> 보이면 코드 없이 이미 연결된 것입니다.
                </p>
                {syncReady ? (
                  <>
                    <label htmlFor="startguide-code" className="mt-5 block text-[13px] font-medium text-d-2">
                      TV에 보이는 코드
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        id="startguide-code"
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
                        aria-describedby={problem ? 'startguide-problem' : undefined}
                        className="tnum h-14 min-w-0 flex-1 rounded-xl border border-d-line2 px-4 text-[26px] font-semibold tracking-[0.18em] outline-none placeholder:font-normal placeholder:text-d-line2 focus:border-d-a"
                      />
                      <Btn size="lg" variant="primary" type="submit" disabled={code.length !== 6 || busy} className="!h-14 px-6">
                        {busy ? '연결하는 중' : '연결'}
                      </Btn>
                    </div>
                    {problem ? (
                      <p id="startguide-problem" role="alert" className="mt-2 text-[13px] leading-snug text-d-bad">
                        {problem}
                      </p>
                    ) : sent ? (
                      <p role="status" className="mt-2 text-[13px] leading-snug text-d-2">
                        TV를 불러오고 있습니다. 연결되면 다음으로 넘어갑니다.
                      </p>
                    ) : null}
                  </>
                ) : null}
                <p className="mt-5 text-[13px] leading-relaxed text-d-3">
                  이 컴퓨터를 TV에 연결해 쓰신다면 코드 없이{' '}
                  <button type="button" onClick={() => void openTv()} className="press inline-flex items-center gap-1 font-medium text-d-a hover:underline">
                    <Tv className="h-3.5 w-3.5" /> TV 화면을 새 창으로 열어도
                  </button>{' '}
                  됩니다.
                </p>
              </>
            )}
            <div className="mt-6 flex justify-end gap-2">
              {sync.tv ? null : (
                <Btn size="lg" onClick={() => setStep(2)}>
                  나중에 연결
                </Btn>
              )}
              {sync.tv ? (
                <Btn size="lg" variant="primary" onClick={() => setStep(2)}>
                  다음
                </Btn>
              ) : null}
            </div>
          </form>
        ) : (
          <>
            <h2 id="startguide-title" className="mt-5 text-[21px] font-semibold tracking-[-0.02em]">
              어떤 프로그램으로 시작할까요
            </h2>
            <p className="mt-2 flex items-center gap-2 text-[14px] text-d-2">
              <Dot tone={sync.tv ? 'ok' : 'warn'} />
              {sync.tv ? 'TV 화면이 연결되어 있습니다' : '연결된 TV가 아직 없습니다. 고르면 이 기기에서 TV 화면이 열립니다'}
            </p>
            <ul className="mt-4 grid gap-2">
              {readyPrograms.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => choose(p.id)} className="press group flex w-full items-center gap-4 rounded-xl border border-d-line2 p-4 text-left hover:border-d-a">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-semibold tracking-[-0.015em]">{p.name}</span>
                      <span className="tnum mt-0.5 block text-[13px] text-d-2">
                        {p.stages.map((s) => `${s.title} ${Math.round(stageDuration(s) / 60)}분`).join(' · ')}
                      </span>
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-d-a text-white transition-colors group-hover:bg-d-a2">
                      <Play className="h-4 w-4 fill-current" />
                    </span>
                  </button>
                </li>
              ))}
              {pendingPrograms.map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-xl border border-dashed border-d-line2 p-4">
                  <span className="min-w-0 flex-1 text-[15px] font-medium text-d-2">{p.name}</span>
                  <span className="shrink-0 text-[13px] text-d-3">준비 중</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-relaxed text-d-3">고르면 진행 화면으로 넘어갑니다. 거기서 재생을 눌러야 TV에서 영상이 시작됩니다.</p>
            <div className="mt-5 flex justify-between gap-2">
              <Btn size="lg" onClick={() => setStep(1)}>
                이전
              </Btn>
              <Btn size="lg" onClick={closeSetup}>
                나중에 하기
              </Btn>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
