import { useState } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { AreaChart, MiniLine, Page, PageHead, SectionHead, cx } from '../../components/dash'
import { kpis, statusBreakdown, weekdayAttendance, type Kpi } from '../../data/metrics'

const shareColor = { moss: '#2F9E63', amber: '#C4860A', coral: '#D94B4B', ink: '#8B8B93' } as const

const diff = (k: Kpi, i: number) => k.series[i] - k.series[Math.max(0, i - 1)]
const diffUnit = (k: Kpi) => (k.unit === '%' ? '%p' : k.unit)

export default function Biometrics() {
  const [id, setId] = useState(kpis[0].id)
  const [hover, setHover] = useState<number | null>(null)
  const kpi = kpis.find((k) => k.id === id) ?? kpis[0]
  const last = kpi.series.length - 1
  const at = hover ?? last
  const d = diff(kpi, at)
  const lowest = weekdayAttendance.reduce((x, y) => (y.present < x.present ? y : x))
  const todayIdx = (new Date().getDay() + 6) % 7 // 월요일 = 0

  return (
    <Page>
      <PageHead title="바이오메트릭" description="최근 12주의 출석과 완수 기록입니다. 지표를 누르면 아래 차트가 바뀝니다" />

      {/* 지표 네 개: 누르면 큰 차트의 주제가 됩니다 */}
      <div role="tablist" aria-label="지표 선택" className="grid grid-cols-2 border-y border-d-line lg:grid-cols-4">
        {kpis.map((k, i) => {
          const on = k.id === id
          const dd = diff(k, k.series.length - 1)
          return (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setId(k.id)
                setHover(null)
              }}
              className={cx('group relative px-4 py-4 text-left transition-colors hover:bg-d-side', i > 0 && 'lg:border-l lg:border-d-line', i % 2 === 1 && 'max-lg:border-l max-lg:border-d-line', i > 1 && 'max-lg:border-t max-lg:border-d-line')}
            >
              {on ? <span className="absolute inset-x-0 -top-px h-0.5 bg-d-a" /> : null}
              <span className={cx('block text-[13px]', on ? 'font-medium text-d-1' : 'text-d-2')}>{k.label}</span>
              <span className="mt-2 flex items-end justify-between gap-3">
                <span className="tnum text-[28px] font-semibold leading-none tracking-[-0.025em]">
                  {k.series[k.series.length - 1]}
                  <span className="ml-0.5 text-[14px] font-normal tracking-normal text-d-3">{k.unit}</span>
                </span>
                <MiniLine data={k.series} color={on ? '#2F5FE3' : '#B9B9C0'} />
              </span>
              <span className={cx('tnum mt-2 inline-flex items-center gap-1 text-[12px] font-medium', dd >= 0 ? 'text-d-ok' : 'text-d-bad')}>
                {dd >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {dd >= 0 ? '+' : ''}
                {dd}
                {diffUnit(k)} <span className="font-normal text-d-3">전주 대비</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* 주 차트 */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold">{kpi.label}</h2>
            <p className="mt-1 text-[13px] text-d-3">{kpi.description}</p>
          </div>
          <p className="tnum flex items-center gap-4 text-[12px] text-d-3">
            <span className="text-d-2">
              {hover === null ? '이번 주' : kpi.labels[at]} {kpi.series[at]}
              {kpi.unit} · {d >= 0 ? '+' : ''}
              {d}
              {diffUnit(kpi)}
            </span>
            {kpi.target !== undefined ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 border-t border-dashed border-d-3" /> 목표 {kpi.target}
                {kpi.unit}
              </span>
            ) : null}
          </p>
        </div>
        <div className="mt-6">
          <AreaChart key={kpi.id} data={kpi.series} labels={kpi.labels} unit={kpi.unit} target={kpi.target} height={260} onHover={setHover} />
        </div>
      </section>

      <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-12">
        {/* 요일별: 세로 막대 다섯 개 */}
        <section className="lg:col-span-7">
          <SectionHead title="요일별 출석" count={`이번 주 · 등록 ${weekdayAttendance[0].total}명`} />
          <ul className="mt-6 grid grid-cols-5 gap-3">
            {weekdayAttendance.map((day, i) => {
              const low = day.day === lowest.day
              return (
                <li key={day.day} className="text-center">
                  <p className={cx('tnum text-[13px]', low ? 'font-semibold text-d-warn' : 'font-medium')}>{day.present}명</p>
                  <div className="mx-auto mt-2 flex h-[132px] w-full max-w-[56px] items-end overflow-hidden rounded-md bg-d-hover">
                    <div className="w-full rounded-md" style={{ height: `${(day.present / day.total) * 100}%`, background: low ? '#C4860A' : i === todayIdx ? '#2F5FE3' : '#93B0F5' }} />
                  </div>
                  <p className={cx('mt-2 text-[13px]', i === todayIdx ? 'font-semibold text-d-1' : 'text-d-3')}>{day.day}</p>
                </li>
              )
            })}
          </ul>
          <p className="mt-5 text-[13px] leading-relaxed text-d-2">{lowest.day}요일 출석이 가장 낮습니다. 인지 자극 활동과 겹치는 날인지 확인하세요</p>
        </section>

        {/* 완수 상태: 비율이므로 누적 막대 하나 */}
        <section className="lg:col-span-5">
          <SectionHead title="세션 완수 상태" count="최근 12주" />
          <div className="mt-6 flex h-3 gap-0.5">
            {statusBreakdown.map((s) => (
              <div key={s.label} className="rounded-full" style={{ flex: `${s.value} 1 0%`, background: shareColor[s.tone] }} title={`${s.label} ${s.value}%`} />
            ))}
          </div>
          <ul className="mt-3">
            {statusBreakdown.map((s) => (
              <li key={s.label} className="flex h-10 items-center justify-between border-b border-d-line">
                <span className="inline-flex items-center gap-2 text-d-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: shareColor[s.tone] }} />
                  {s.label}
                </span>
                <span className="tnum font-medium">{s.value}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-d-2">주의 상태로 전환된 뒤에도 세션을 마친 비율이 늘고 있습니다. 근력 블록의 중간 휴식 큐를 유지하세요</p>
        </section>
      </div>
    </Page>
  )
}
