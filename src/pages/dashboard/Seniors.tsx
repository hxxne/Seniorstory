import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Avatar, Btn, Dot, Label, Page, PageHead, SectionHead, Seg, StatusIcon, Switch, cx } from '../../components/dash'
import { riskConditions, seniors, type Senior } from '../../data/seniors'
import { setAllAttendance, toggleAttendance, useStore } from '../../lib/store'

const mask = (name: string) => (name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(name.length - 2) + name[name.length - 1])

const accessLog = [
  { who: '관리자', what: '명단 조회', when: '방금' },
  { who: '김민지 요양보호사', what: '출석 변경 2건', when: '09:21' },
  { who: '시스템', what: '야간 백업 완료', when: '03:00' },
]

type Filter = 'all' | 'present' | 'absent'

// 열 너비는 머리행과 본문행이 함께 씁니다
const cols = 'md:grid md:grid-cols-[minmax(132px,1fr)_minmax(0,1.7fr)_76px_44px] md:items-center md:gap-4'

export default function Seniors() {
  const attendance = useStore((s) => s.attendance)
  const institution = useStore((s) => s.institution)
  const [q, setQ] = useState('')
  const [masked, setMasked] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const present = seniors.filter((s) => attendance[s.id]).length
  const filters = [
    ['all', '전체', seniors.length],
    ['present', '출석', present],
    ['absent', '미출석', seniors.length - present],
  ] as const

  const groups = useMemo(() => {
    const kw = q.trim().toLowerCase()
    const match = (s: Senior) => !kw || s.name.toLowerCase().includes(kw) || s.conditions.some((c) => c.toLowerCase().includes(kw)) || s.room.includes(kw) || s.mobility.includes(kw)
    const on = seniors.filter((s) => attendance[s.id] && match(s))
    const off = seniors.filter((s) => !attendance[s.id] && match(s))
    return [
      { key: 'present', title: '출석', list: on, show: filter !== 'absent' },
      { key: 'absent', title: '미출석', list: off, show: filter !== 'present' },
    ].filter((g) => g.show)
  }, [q, filter, attendance])
  const shown = groups.reduce((a, g) => a + g.list.length, 0)

  return (
    <Page>
      <PageHead
        title="어르신 명단"
        description={`등록 ${seniors.length}명 · 오늘 출석 ${present}명`}
        actions={
          <>
            <Btn variant="ghost" onClick={() => setAllAttendance(false)}>
              전체 해제
            </Btn>
            <Btn onClick={() => setAllAttendance(true)}>전체 출석</Btn>
          </>
        }
      />

      <div className="grid gap-x-12 gap-y-12 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* 명단 */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <label className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-d-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="성함, 질환, 호실 검색"
                aria-label="어르신 검색"
                className="h-8 w-full rounded-md border border-d-line2 bg-white pl-8 pr-8 text-[13px] text-d-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors placeholder:text-d-3 focus:border-d-a focus:outline-none"
              />
              {q ? (
                <button type="button" onClick={() => setQ('')} aria-label="검색어 지우기" className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-d-3 hover:bg-d-hover hover:text-d-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </label>
            <Seg id="senior-filter" label="출석 필터" value={filter} options={filters} onChange={setFilter} />
            <span className="tnum ml-auto text-[12px] text-d-3">{shown}명 표시</span>
          </div>

          {/* 머리행 */}
          <div className={cx('hidden border-y border-d-line px-2 py-2 text-[12px] text-d-3', cols)}>
            <span>성함</span>
            <span>질환 · 메모</span>
            <span>보행</span>
            <span className="text-right">출석</span>
          </div>

          {groups.map((g) => (
            <div key={g.key}>
              <p className="flex h-9 items-center gap-2 border-b border-d-line bg-d-side px-2 text-[13px] font-medium">
                <StatusIcon kind={g.key === 'present' ? 'done' : 'todo'} />
                {g.title}
                <span className="tnum font-normal text-d-3">{g.list.length}</span>
              </p>
              <ul>
                {g.list.map((s) => {
                  const on = !!attendance[s.id]
                  return (
                    <li key={s.id} className={cx('border-b border-d-line px-2 py-2.5 transition-colors hover:bg-d-side', cols)}>
                      <p className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={s.name} size={26} dim={!on} />
                        <span className="min-w-0">
                          <span className={cx('block truncate', on ? 'font-medium' : 'text-d-2')}>{masked ? mask(s.name) : s.name}</span>
                          <span className="tnum block text-[12px] text-d-3">
                            {s.age}세 · {s.room}호
                          </span>
                        </span>
                      </p>
                      <div className="mt-2 min-w-0 md:mt-0">
                        <p className="flex flex-wrap gap-1">
                          {s.conditions.map((c) => (
                            <Label key={c} tone={riskConditions.has(c) ? 'bad' : undefined}>
                              {c}
                            </Label>
                          ))}
                        </p>
                        {s.note ? <p className="mt-1 text-[12px] leading-snug text-d-3">{s.note}</p> : null}
                      </div>
                      <p className="mt-2 text-[13px] text-d-2 md:mt-0">{s.mobility}</p>
                      <div className="mt-2 flex justify-end md:mt-0">
                        <Switch on={on} onChange={() => toggleAttendance(s.id)} label={`${s.name} ${on ? '출석 해제' : '출석 처리'}`} />
                      </div>
                    </li>
                  )
                })}
                {g.list.length === 0 ? <li className="border-b border-d-line px-2 py-6 text-[13px] text-d-3">{q ? '검색 결과가 없습니다' : `${g.title} 어르신이 없습니다`}</li> : null}
              </ul>
            </div>
          ))}
          <p className="mt-4 flex items-center gap-2 text-[12px] text-d-3">
            <Dot tone="bad" /> 빨간 점은 밀착 보조가 필요한 질환입니다
          </p>
        </div>

        {/* 요약 + 보안 */}
        <aside className="space-y-10">
          <section>
            <SectionHead title="오늘 출석" />
            <p className="tnum mt-4 text-[40px] font-semibold leading-none tracking-[-0.03em]">
              {present}
              <span className="ml-1.5 text-[14px] font-normal tracking-normal text-d-3">/ {seniors.length}명</span>
            </p>
            {/* 한 사람이 한 칸 */}
            <ul className="mt-4 flex flex-wrap gap-1" aria-hidden>
              {seniors.map((s) => (
                <li key={s.id} title={masked ? mask(s.name) : s.name} className={cx('h-2.5 w-2.5 rounded-full transition-colors duration-200', attendance[s.id] ? 'bg-d-a' : 'bg-d-line2')} />
              ))}
            </ul>
            <p className="tnum mt-3 text-[12px] text-d-3">출석률 {Math.round((present / seniors.length) * 100)}%</p>
          </section>

          <section>
            <SectionHead title="보안 관리" />
            <div className="flex items-start justify-between gap-4 border-b border-d-line py-3">
              <div>
                <p className="font-medium">성함 가리기</p>
                <p className="mt-0.5 text-[12px] leading-snug text-d-3">화면 공유나 외부인 방문 때 성함을 가립니다</p>
              </div>
              <Switch on={masked} onChange={() => setMasked((m) => !m)} label="성함 가리기" />
            </div>
            <dl className="border-b border-d-line py-3 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-d-3">계정</dt>
                <dd className="truncate">{institution?.name}</dd>
              </div>
              <div className="mt-1.5 flex justify-between gap-3">
                <dt className="text-d-3">권한</dt>
                <dd>관리자</dd>
              </div>
            </dl>
            <p className="mt-4 text-[12px] font-medium text-d-3">최근 접근</p>
            <ul className="mt-1">
              {accessLog.map((l) => (
                <li key={l.what} className="flex items-baseline justify-between gap-3 py-1.5 text-[13px]">
                  <span className="min-w-0 truncate text-d-2">
                    <span className="text-d-1">{l.who}</span> · {l.what}
                  </span>
                  <span className="tnum shrink-0 text-[12px] text-d-3">{l.when}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Page>
  )
}
