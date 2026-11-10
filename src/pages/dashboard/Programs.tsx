import { useState } from 'react'
import { Clock, Layers, ListChecks, Play, TriangleAlert, Tv, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Btn, Label, Page, PageHead, SectionHead, Seg } from '../../components/dash'
import { programs, stageDuration } from '../../data/programs'
import { asset } from '../../lib/asset'
import { openTablet, openTv } from '../../lib/launch'
import { startProgram, useStore } from '../../lib/store'
import { fmtClock } from '../../lib/useStageClock'

const tabs = programs.map((p) => [p.id, p.name] as const)
// 단계가 뒤로 갈수록 한 단계씩 짙어지는 파랑: 색이 아니라 순서를 보여 줍니다
const steps = ['#C9D8FB', '#93B0F5', '#2F5FE3']
const covers: Record<string, { src: string; pos: string }> = {
  p30: { src: '/landing/stretch.webp', pos: '50% 32%' },
  p50: { src: '/landing/hero.webp', pos: '50% 40%' },
}

export default function Programs() {
  const navigate = useNavigate()
  const [id, setId] = useState(programs[0].id)
  const program = programs.find((p) => p.id === id) ?? programs[0]
  const session = useStore((s) => s.session)
  const live = session.status === 'playing' || session.status === 'paused' || session.status === 'emergency'
  const total = program.stages.reduce((a, s) => a + stageDuration(s), 0)
  const moves = program.stages.reduce((a, s) => a + s.moves.length, 0)
  const cover = covers[program.id] ?? covers.p30
  const detailed = program.stages.flatMap((stage) => stage.moves.filter((mv) => mv.detail).map((mv) => ({ mv, stage })))

  const start = () => {
    startProgram(program.id, false)
    const tv = openTv()
    const tab = openTablet()
    if (!tv && !tab) navigate('/tablet')
  }

  const props = [
    { icon: Clock, k: '소요 시간', v: `${program.minutes}분` },
    { icon: Layers, k: '구성', v: `${program.stages.length}단계 · 동작 ${moves}개` },
    { icon: UserRound, k: '진행', v: '요양보호사 1인' },
    { icon: ListChecks, k: '안전 가이드', v: `${program.safetyGuide.length}개 항목` },
  ]

  return (
    <Page>
      <PageHead title="운동 프로그램" description="통합 프로그램 두 가지 중에서 골라 시작합니다" actions={<Seg id="program-tab" label="프로그램 선택" value={id} options={tabs} onChange={setId} />} />

      {/* 개요 */}
      <section className="grid gap-x-12 gap-y-8 border-t border-d-line pt-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-d-a">{program.tagline}</p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.025em]">{program.name}</h2>
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-d-2">{program.description}</p>

          <dl className="mt-6 max-w-md">
            {props.map((p) => (
              <div key={p.k} className="grid h-9 grid-cols-[132px_1fr] items-center text-[13.5px]">
                <dt className="inline-flex items-center gap-2 text-d-3">
                  <p.icon className="h-4 w-4" /> {p.k}
                </dt>
                <dd className="tnum">{p.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <Btn variant="primary" size="lg" disabled={live} onClick={start}>
              <Play className="h-4 w-4 fill-current" /> {live ? '세션 진행 중' : '이 프로그램으로 시작'}
            </Btn>
            <Btn size="lg" onClick={openTv}>
              <Tv className="h-4 w-4 text-d-3" /> TV 미리보기
            </Btn>
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-d-side">
          <img key={cover.src} src={asset(cover.src)} alt="" className="h-full w-full object-cover" style={{ objectPosition: cover.pos }} />
        </div>
      </section>

      {/* 3단계 진행 순서: 길이가 곧 시간인 타임라인 하나와 단계별 열 */}
      <section className="mt-14">
        <SectionHead title={`${program.stages.length}단계 진행 순서`} count={`총 ${fmtClock(total)}`} />
        <ol className="mt-6 flex gap-1">
          {program.stages.map((s, i) => (
            <li key={s.id} className="min-w-[72px]" style={{ flex: `${stageDuration(s)} 1 0%` }}>
              <div className="h-2 rounded-full" style={{ background: steps[i] }} />
              <p className="tnum mt-2 truncate text-[12px] text-d-3">
                {s.order}단계 · {Math.round(stageDuration(s) / 60)}분
              </p>
            </li>
          ))}
        </ol>

        <ol className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-3">
          {program.stages.map((s, i) => (
            <li key={s.id} className="min-w-0">
              <p className="flex items-center gap-2 text-[12px] text-d-3">
                <span className="tnum grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold" style={{ background: steps[i], color: i > 1 ? '#fff' : '#1E3F9E' }}>
                  {s.order}
                </span>
                {s.subtitle}
                <span className="tnum ml-auto">{Math.round(stageDuration(s) / 60)}분</span>
              </p>
              <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-1 min-h-[2.6em] text-[13px] leading-snug text-d-2">{s.goal}</p>
              <ul className="mt-4 border-t border-d-line">
                {s.moves.map((mv) => (
                  <li key={mv.name} className="flex min-h-9 items-center justify-between gap-2 border-b border-d-line py-1.5 text-[13.5px]">
                    <span className="min-w-0">
                      <span className="block truncate">{mv.name}</span>
                      {mv.detail ? <span className="tnum block truncate text-[12px] text-d-3">{mv.detail.dose}</span> : null}
                    </span>
                    <span className="tnum shrink-0 text-[12px] text-d-3">{fmtClock(mv.durationSec)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex gap-1.5 text-[12px] leading-snug text-d-2">
                <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0 text-d-warn" />
                {s.caution}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 동작별 안내: 운동 영상에서 읽은 세트 구성과 세트마다 바뀌는 안내 문구 */}
      <section className="mt-14">
        <SectionHead title="동작별 진행 안내" count={`${detailed.length}개 동작`} aside="TV에 나가는 영상의 세트 구성과 안내 문구" />
        <ul>
          {detailed.map(({ mv, stage }) => {
            const d = mv.detail
            if (!d) return null
            return (
              <li key={mv.name} className="grid gap-x-8 gap-y-4 border-b border-d-line py-5 sm:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_232px_minmax(0,1fr)]">
                <img src={asset(d.poster)} alt={`${mv.name} 영상의 한 장면`} loading="lazy" className="aspect-video w-full rounded-lg bg-d-side object-cover" />
                <div className="min-w-0">
                  <p className="text-[12px] text-d-3">
                    {stage.order}단계 · {stage.title}
                  </p>
                  <h3 className="mt-1 text-[17px] font-semibold tracking-[-0.01em]">{mv.name}</h3>
                  <p className="mt-2 flex flex-wrap gap-1">
                    <Label>
                      {d.area} · {d.focus}
                    </Label>
                    <Label>{d.posture}</Label>
                  </p>
                  <p className="tnum mt-3 text-[13.5px]">
                    {d.dose} <span className="text-d-3">· {fmtClock(mv.durationSec)}</span>
                  </p>
                  <p className="mt-1 text-[13px] leading-snug text-d-3">{d.setup}</p>
                </div>
                <ol className="grid content-start gap-x-8 gap-y-4 sm:col-span-2 sm:grid-cols-3 xl:col-span-1">
                  {d.guides.map((g, i) => (
                    <li key={i} className="min-w-0">
                      <p className="tnum flex items-center gap-1.5 text-[12px] text-d-3">
                        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[10px] font-semibold" style={{ background: steps[i], color: i > 1 ? '#fff' : '#1E3F9E' }}>
                          {i + 1}
                        </span>
                        {i + 1}세트 · {g.head}
                      </p>
                      <p className="mt-1.5 text-[14px] leading-snug">{g.tip}</p>
                    </li>
                  ))}
                </ol>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-14 grid gap-x-12 gap-y-12 lg:grid-cols-12">
        {/* 기대 효과 */}
        <section className="lg:col-span-5">
          <SectionHead title="의학적 · 신체적 기대 효과" count={`${program.effects.length}가지`} />
          <ul>
            {program.effects.map((e) => (
              <li key={e.text} className="flex items-start gap-3 border-b border-d-line py-3">
                <span className="w-[76px] shrink-0">
                  <Label>{e.category}</Label>
                </span>
                <span className="pt-0.5 leading-snug">{e.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 안전 가이드: 순서가 정보이므로 번호를 답니다 */}
        <section className="lg:col-span-7">
          <SectionHead title="요양보호사 안전 진행 가이드" count={`${program.safetyGuide.length}단계`} />
          <ol>
            {program.safetyGuide.map((g, i) => (
              <li key={g.title} className="grid grid-cols-[20px_1fr] gap-x-3 border-b border-d-line py-3 sm:grid-cols-[20px_128px_1fr]">
                <span className="tnum pt-0.5 text-[12px] text-d-3">{i + 1}</span>
                <span className="font-medium">{g.title}</span>
                <span className="col-start-2 text-[13.5px] leading-snug text-d-2 sm:col-start-3">{g.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Page>
  )
}
