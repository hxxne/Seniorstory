import { useId, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Btn, Page, PageHead, SectionHead } from '../../components/dash'
import { deleteAccount } from '../../lib/auth'
import { useStore } from '../../lib/store'

/* 계정: 이 기기에 저장된 내 정보를 보고, 지울 수 있는 곳 */
export default function Account() {
  const institution = useStore((s) => s.institution)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputId = useId()
  const errorId = useId()

  if (!institution) return null

  const rows: [string, string][] = [
    ['기관명', institution.name],
    ['기관 유형', institution.type ?? ''],
    ['관리자', institution.manager],
    ['이메일', institution.email],
    ['등록 어르신 수', institution.capacity ? `${institution.capacity}명` : ''],
    ['기관 연락처', institution.phone ?? ''],
    ['기본 프로그램', institution.defaultProgram === 'p50' ? '통합 프로그램 50분' : institution.defaultProgram === 'p30' ? '통합 프로그램 30분' : ''],
    ['주 운동 시간대', institution.slot ?? ''],
  ]

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!password) return setError('비밀번호를 입력해 주세요')
    setBusy(true)
    const result = await deleteAccount(institution.email, password)
    if (result === 'ok') return navigate('/', { replace: true })
    setBusy(false)
    setError(result === 'wrong-password' ? '비밀번호가 맞지 않습니다' : '이 브라우저에서는 처리할 수 없습니다')
  }

  return (
    <Page>
      <PageHead title="계정" description="이 기기에 저장된 기관 정보입니다" />

      <div className="max-w-[640px]">
        <SectionHead title="저장된 정보" />
        <dl className="mt-2 divide-y divide-d-line border-y border-d-line">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-2.5">
                <dt className="text-d-2">{k}</dt>
                <dd className="min-w-0 break-words">{v}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-3 text-[13px] leading-relaxed text-d-2">
          이 정보는 지금 쓰는 브라우저에만 저장되어 있고 서버로 보내지 않습니다. 자세한 내용은{' '}
          <Link to="/privacy" className="font-medium text-d-a underline-offset-4 hover:underline">
            개인정보 처리방침
          </Link>
          과{' '}
          <Link to="/terms" className="font-medium text-d-a underline-offset-4 hover:underline">
            이용약관
          </Link>
          에 있습니다.
        </p>

        <SectionHead title="계정 삭제" className="mt-12" />
        <p className="mt-2 leading-relaxed text-d-2">이 기기에 저장된 계정, 출석, 운동 기록, TV 연결이 모두 지워집니다. 지운 뒤에는 되돌릴 수 없습니다.</p>

        {open ? (
          <form onSubmit={submit} noValidate className="mt-4 rounded-lg border border-d-line2 p-4">
            <label htmlFor={inputId} className="block text-[13px] font-medium">
              확인을 위해 비밀번호를 입력해 주세요
            </label>
            <input
              id={inputId}
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className={`mt-2 h-10 w-full max-w-[320px] rounded-md border bg-white px-3 text-[14px] outline-none focus-visible:border-d-a focus-visible:ring-2 focus-visible:ring-d-a/25 ${error ? 'border-d-bad' : 'border-d-line2'}`}
            />
            {error ? (
              <p id={errorId} role="alert" className="mt-2 text-[13px] text-[#B83232]">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Btn type="submit" variant="danger" size="lg" disabled={busy}>
                {busy ? '지우는 중' : '계정과 기록 지우기'}
              </Btn>
              <Btn
                variant="ghost"
                size="lg"
                onClick={() => {
                  setOpen(false)
                  setPassword('')
                  setError('')
                }}
              >
                취소
              </Btn>
            </div>
          </form>
        ) : (
          <Btn className="mt-4" size="lg" onClick={() => setOpen(true)}>
            계정 삭제
          </Btn>
        )}
      </div>
    </Page>
  )
}
