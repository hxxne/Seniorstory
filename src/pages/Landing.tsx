import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { programs, stageDuration } from '../data/programs'
import './landing.css'
import { asset } from '../lib/asset'
import { LogoMark, Wordmark } from '../components/Logo'

/* 이미지: MediMove 전용으로 생성한 4장 (public/landing) */

const IMG_A = asset('/landing/hero.webp')
const IMG_B = asset('/landing/room.webp')
const IMG_C = asset('/landing/stretch.webp')
const IMG_D = asset('/landing/tablet.webp')

const VISION = [['어르신은', 'TV를', '보고'], ['요양보호사는'], ['태블릿으로', '진행합니다']]
const ACCT =
  '출석을 체크한 어르신이 그대로 태블릿의 상태 카드가 되고, 태블릿의 조작이 그대로 TV 화면이 됩니다 — 요양보호사는 기록이 아니라 어르신에게 집중할 수 있습니다.'

const HOTS = [
  { left: '82%', top: '15%', label: '스마트 TV', value: '2단계 · 본운동' },
  { left: '85%', top: '33%', label: '태블릿', value: '재생 · 단계 · 긴급 정지' },
  { left: '55%', top: '52%', label: '좌식 변형', value: '휠체어도 함께 참여' },
  { left: '27%', top: '61%', label: '현재 동작', value: '팔 앞으로 뻗기' },
]

const FEATS = [
  { label: '통합 관제 홈', to: '/dashboard' },
  { label: '어르신 명단 및 보안 관리', to: '/dashboard/seniors' },
  { label: '운동 프로그램', to: '/dashboard/programs' },
  { label: '운동 기록', to: '/dashboard/biometrics' },
  { label: 'TV · 태블릿 화면', to: '/tablet' },
]

const CARDS = [
  {
    img: IMG_C,
    pos: '50% 40%',
    size: 'cover',
    label: '[통합 프로그램 30분]',
    title: ['상체는 풀고,', '다리 힘은 기르고'],
    body: '준비운동으로 몸을 풀고, 가슴 열기부터 앉았다 일어서기까지 본운동을 한 뒤 걷기로 마무리합니다.',
    to: '/dashboard/programs',
  },
  {
    img: IMG_D,
    pos: '60% 50%',
    size: 'cover',
    label: '[TV와 태블릿]',
    title: ['어르신은 TV를 보고,', '요양보호사는 태블릿으로'],
    body: '재생과 단계 이동, 어르신별 상태, 긴급 일시정지가 두 화면에 실시간으로 동기화됩니다.',
    to: '/tablet',
  },
  {
    img: IMG_B,
    pos: '38% 60%',
    size: 'auto 135%',
    label: '[통합 프로그램 50분]',
    title: ['다리 운동을 더 길게,', '걷는 힘까지'],
    body: '30분 구성에 다리 운동 두 가지를 더하고, 세트마다 쉬운 동작을 함께 안내합니다.',
    to: '/dashboard/programs',
  },
]

const p30 = programs[0]
const stageMin = p30.stages.map((s) => Math.round(stageDuration(s) / 60))
const peak = Math.max(...stageMin)

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)
  const [hot, setHot] = useState<number | null>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const $ = <T extends HTMLElement = HTMLElement>(s: string) => el.querySelector(s) as T
    const $$ = <T extends HTMLElement = HTMLElement>(s: string) => Array.from(el.querySelectorAll(s)) as T[]

    const story = $('.story')
    const cam = $('.cam')
    const pa = $('.pa')
    const pb = $('.pb')
    const fog = $('.fog')
    const veil = $('.veil')
    const hero = $('.hero-copy')
    const line = $('.hero-copy .line')
    const h1 = $('.hero-copy h1')
    const hud = $('.hud')
    const cap = $('.cap')
    const hint = $('.hint')
    const layers = [0, 1, 2, 3, 4].map((i) => $(`.l${i}`))
    const rocks = $$('.rock')
    const vWords = $$('.vision h2 span')
    const vChip = $('.vision .chip')
    const vP = $('.vision p')
    const aWords = $$('.acct span')
    const hots = $$('.hot')
    const cred = $('.cred')
    const card = $('.ccard')
    const num = $('.ccard .big b')
    const spark = el.querySelector('.ccard polyline') as SVGPolylineElement
    const rows = $$('.feats li')
    const prog = $('.prog i')

    const sparkLen = spark.getTotalLength()
    spark.style.strokeDasharray = String(sparkLen)

    /* 히어로 헤드라인 배치: 글자 아랫부분이 안개 속에서 떠오르는 사진 윗선에 걸리도록 */
    const layoutHero = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      if (W < 821) {
        hero.style.top = ''
        h1.style.fontSize = ''
        return
      }
      const bw = W * 1.06
      const bh = H * 1.12
      const k = Math.max(bw / 1600, bh / 900)
      let fs = Math.min(96, 68 * k)
      h1.style.fontSize = `${fs}px`
      const max = W * 0.86
      if (line.scrollWidth > max) {
        fs *= max / line.scrollWidth
        h1.style.fontSize = `${fs}px`
      }
      // 히어로 사진(1536x864, cover)에서 들어 올린 손끝은 위에서 약 34% 지점
      const imgH = 864 * Math.max(bw / 1536, bh / 864)
      const handTop = -0.09 * H + (bh - imgH) / 2 + imgH * 0.34 + 0.06 * H
      hero.style.top = `${handTop - 0.1 * fs - hero.offsetHeight}px`
    }
    layoutHero()
    window.addEventListener('resize', layoutHero)
    document.fonts?.ready.then(layoutHero)

    let mx = 0
    let my = 0
    let sx = 0
    let sy = 0
    let sp = 0
    let last = performance.now()
    let raf = 0

    const onMove = (e: globalThis.PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('pointermove', onMove)

    const show = (n: HTMLElement, on: boolean) => {
      n.style.visibility = on ? 'visible' : 'hidden'
    }

    const frame = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const H = window.innerHeight
      const p = clamp(-story.getBoundingClientRect().top / (story.offsetHeight - H))
      sp += (p - sp) * (1 - Math.pow(0.86, dt / 16.7))
      if (Math.abs(p - sp) < 0.0002) sp = p
      sx += (mx - sx) * 0.06
      sy += (my - sy) * 0.06

      /* 카메라: 영상 스크럽 대신 두 장의 사진 사이를 밀고 들어갑니다 */
      const vp = ease(seg(sp, 0.05, 0.7))
      cam.style.transform = `translate3d(${-sx * 18}px,${-sy * 12 + (1 - vp) * H * 0.06}px,0) scale(${1 + 0.02 * (1 - vp)})`
      const aOp = 1 - seg(vp, 0.22, 0.6)
      pa.style.opacity = String(aOp)
      pa.style.transform = `scale(${1 + vp * 1.7})`
      pa.style.filter = `blur(${seg(vp, 0.02, 0.5) * 12}px)`
      show(pa, aOp > 0)
      const bOp = seg(vp, 0.16, 0.55)
      pb.style.opacity = String(bOp)
      pb.style.transform = `scale(${1 + 0.38 * (1 - vp)})`
      pb.style.filter = `blur(${(1 - seg(vp, 0.3, 0.85)) * 10}px)`
      show(pb, bOp > 0)

      /* 떠다니는 조각이 카메라를 스쳐 지나갑니다 */
      const fp = seg(sp, 0.02, 0.2)
      const fe = fp * fp
      rocks.forEach((r) => {
        const x = Number(r.dataset.x)
        const y = Number(r.dataset.y)
        const d = Number(r.dataset.d)
        r.style.transform = `translate3d(${x * fp * 70 + sx * -24 * d}vw,${y * fp * 60 + sy * -16 * d}vh,0) scale(${1 + fe * 1.6 * d})`
        r.style.filter = `blur(${fe * 5 * d}px)`
        show(r, fp < 1)
      })

      /* 안개 */
      const fg = ease(seg(sp, 0.38, 0.47))
      fog.style.opacity = String(fg * (1 - seg(sp, 0.93, 0.99)))
      fog.style.transform = `translate3d(${(fg - 1) * 18 + sx * -10}vw,${sy * -6}px,0)`
      show(fog, fg > 0)

      /* 히어로 */
      const h = seg(sp, 0.02, 0.1)
      hero.style.transform = `translate3d(${-sx * 10}px,${-h * 80 - sy * 6}px,0) scale(${1 + h * 0.12})`
      hero.style.filter = `blur(${h * 14}px)`
      hero.style.opacity = String(1 - h)
      hud.style.transform = `translate3d(${sx * 26}px,${sy * 18 - h * 40}px,0)`
      hud.style.opacity = String(1 - seg(sp, 0.02, 0.08))
      const co = String(1 - seg(sp, 0.01, 0.05))
      cap.style.opacity = co
      hint.style.opacity = co
      show(layers[0], h < 1)
      show(layers[1], h < 1)

      /* 비전 */
      const vIn = seg(sp, 0.16, 0.27)
      const vOut = seg(sp, 0.34, 0.42)
      vWords.forEach((w, i) => {
        const k = clamp(vIn * 1.6 - i * 0.08)
        w.style.transform = `translate3d(0,${(1 - k) * 30 - vOut * 60}px,0)`
        w.style.filter = `blur(${(1 - k) * 12 + vOut * 14}px)`
        w.style.opacity = String(k * (1 - vOut))
      })
      const vc = clamp(vIn * 2 - 0.6) * (1 - vOut)
      ;[vChip, vP].forEach((n) => {
        n.style.opacity = String(vc)
        n.style.transform = `translateY(${-vOut * 50}px)`
      })
      show(layers[2], vIn > 0 && vOut < 1)
      // 밝은 사진 위에서 흰 글자가 읽히도록, 비전 구간에만 어두운 베일을 씌웁니다
      const ve = clamp(vIn * 1.4) * (1 - vOut)
      veil.style.opacity = String(ve)
      show(veil, ve > 0)

      /* 문단 + 핫스팟 */
      const aIn = seg(sp, 0.45, 0.55)
      const aOut = seg(sp, 0.63, 0.68)
      aWords.forEach((w, i) => {
        const k = clamp(aIn * 2.2 - (i / aWords.length) * 1.2)
        w.style.opacity = String((0.15 + 0.85 * k) * (1 - aOut))
        w.style.filter = `blur(${(1 - k) * 6 + aOut * 10}px)`
      })
      hots.forEach((n, i) => {
        const k = seg(sp, 0.49 + i * 0.02, 0.53 + i * 0.02)
        n.style.transform = `translate3d(${sx * -30}px,${sy * -20}px,0) scale(${k * (1 - aOut)})`
      })
      show(layers[3], aIn > 0 && aOut < 1)

      /* 스테이션 */
      const sIn = seg(sp, 0.72, 0.82)
      cred.style.opacity = String(sIn)
      cred.style.transform = `translateY(${(1 - sIn) * 30}px)`
      cred.style.filter = `blur(${(1 - sIn) * 8}px)`
      const cIn = ease(seg(sp, 0.74, 0.86))
      card.style.opacity = String(cIn)
      card.style.transform = `perspective(900px) translate3d(${sx * -14}px,${(1 - cIn) * 60 + sy * -10}px,0) rotateY(${sx * 8}deg) rotateX(${-sy * 8}deg)`
      num.textContent = String(Math.round(p30.minutes * seg(sp, 0.76, 0.9)))
      spark.style.strokeDashoffset = String(sparkLen * (1 - seg(sp, 0.77, 0.92)))
      rows.forEach((r, i) => {
        const k = ease(seg(sp, 0.76 + i * 0.025, 0.82 + i * 0.025))
        r.style.opacity = String(k)
        r.style.transform = `translateX(${(1 - k) * 40}px)`
      })
      show(layers[4], sIn > 0)

      prog.style.transform = `scaleX(${sp})`

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', layoutHero)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  const tilt = (e: PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`
  }
  const untilt = (e: PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = ''
  }

  // 스파크라인: 30분 프로그램의 단계별 시간 배분 (준비운동 → 본운동 → 마무리운동)
  const xs = [26, 110, 192]
  const pts = stageMin.map((mnt, i) => [xs[i], 60 - (mnt / peak) * 50] as const)
  const poly = [[0, 58], ...pts, [214, 56]].map((p) => p.join(',')).join(' ')
  const peakIdx = stageMin.indexOf(peak)

  let acctIndex = 0

  return (
    <div className="msl" ref={root}>
      {/* 3. Navigation */}
      <header className="nav">
        <Link to="/" className="logo" aria-label="MediMove 홈">
          <LogoMark size={26} />
          <Wordmark />
        </Link>
        <nav className="menu">
          <a href="#sol">프로그램</a>
          <Link to="/screens">화면</Link>
          <Link to="/tv">스마트 TV</Link>
          <Link to="/tablet">태블릿</Link>
        </nav>
        <Link to="/login" className="talk">
          기관 로그인 <i>›</i>
        </Link>
      </header>

      {/* 4. Scroll story */}
      <section className="story">
        <div className="stage">
          <div className="cam">
            <img className="plate pb" src={IMG_B} alt="" />
            <img className="plate pa" src={IMG_A} alt="밝은 다목적실에서 두 팔을 들어 올리며 운동하는 어르신들" />
            <div className="mist" />
          </div>
          <div className="veil" />

          <div className="fog">
            <i className="f0" />
            <i className="f1" />
            <i className="f2" />
          </div>

          {/* L0: 히어로 헤드라인 */}
          <div className="layer l0">
            <div className="hero-copy">
              <span className="chip">요양기관 운동 관제</span>
              <h1>
                <span className="line">
                  <span>어르신의 하루에 운동을</span>
                </span>
              </h1>
            </div>
          </div>

          {/* 떠다니는 제품 조각 */}
          <div className="rock rk1" data-x="-0.3" data-y="-0.6" data-d="1.3">
            <div className="bob">
              <div className="frag-cue">천천히, 숨을 먼저 고르세요</div>
            </div>
          </div>
          <div className="rock rk3" data-x="1" data-y="0.55" data-d="1.8">
            <div className="bob">
              <div className="frag-time">
                <span className="mono">남은 시간</span>
                <b>07:42</b>
              </div>
            </div>
          </div>

          {/* L1: HUD, 캡션, 스크롤 힌트 */}
          <div className="layer l1">
            <div className="hud">
              <span className="cross" />
              <span className="chip">실시간 세션</span>
              <div className="data">
                <pre>{'장소  1층 다목적실\n단계  2 / 3 · 본운동\n시간  통합 프로그램 30분'}</pre>
                <span className="frame" />
              </div>
            </div>
            <p className="cap">
              스마트 TV로 송출하고
              <br />
              태블릿 한 대로 제어하는
              <br />
              요양기관 운동 프로그램
            </p>
            <p className="hint">
              스크롤해서 둘러보기 <i />
            </p>
          </div>

          {/* L2: 비전 */}
          <div className="layer l2" style={{ visibility: 'hidden' }}>
            <div className="vision">
              <span className="chip">우리의 방향</span>
              <h2>
                {VISION.map((ln, i) => (
                  <span key={i} style={{ display: 'block' }}>
                    {ln.map((w) => (
                      <span key={w} style={{ marginRight: '0.24em' }}>
                        {w}
                      </span>
                    ))}
                  </span>
                ))}
              </h2>
              <p>
                재생과 단계 이동, 긴급 정지까지
                <br />
                태블릿 한 대로 이어집니다
              </p>
            </div>
          </div>

          {/* L3: 문단 + 핫스팟 */}
          <div className="layer l3" style={{ visibility: 'hidden' }}>
            <p className="acct">
              {ACCT.split(' ').map((w) => (
                <span key={acctIndex++}>{w} </span>
              ))}
            </p>
            {HOTS.map((hs, i) => (
              <button key={hs.label} type="button" className={`hot${hot === i ? ' on' : ''}`} style={{ left: hs.left, top: hs.top }} onClick={() => setHot(hot === i ? null : i)}>
                <span className="dot" />
                <span className="lab">
                  {hs.label}
                  <em>{hs.value}</em>
                </span>
              </button>
            ))}
          </div>

          {/* L4: 스테이션 */}
          <div className="layer l4" style={{ visibility: 'hidden' }}>
            <h2 className="cred">
              <span className="tag">✕ {p30.name}</span>
              요양보호사 한 명이 안전하게 진행하는 3단계 운동
            </h2>

            <div className="ccard">
              <h4>
                한 세션의
                <br />
                운동 시간
              </h4>
              <p className="note">{p30.stages.length}단계 · 동작 {p30.stages.reduce((a, s) => a + s.moves.length, 0)}개</p>
              <p className="big">
                <b>0</b>
                <small>분</small>
              </p>
              <span className="plus">
                {p30.stages[peakIdx].title.replace(/ /g, '')} {peak}분
              </span>
              <svg viewBox="0 0 220 70" aria-hidden>
                <polyline points={poly} fill="none" stroke="#c6f35c" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
                {pts.map((p, i) => (i === peakIdx ? <circle key={i} cx={p[0]} cy={p[1]} r="3.4" fill="#c6f35c" /> : <circle key={i} cx={p[0]} cy={p[1]} r="2.4" fill="#fff" />))}
              </svg>
              <p className="foot">준비운동 · 본운동 · 마무리운동</p>
            </div>

            <ul className="feats">
              {FEATS.map((f, i) => (
                <li key={f.label}>
                  <Link to={f.to}>
                    <b>0{i + 1}</b>
                    <span>{f.label}</span>
                    <i>→</i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="prog">
            <i />
          </div>
        </div>
      </section>

      {/* 13. Solutions */}
      <section className="sol" id="sol">
        <div className="head">
          <div>
            <span className="chip">프로그램</span>
            <h2>질환을 고려한 통합 운동 프로그램</h2>
          </div>
          <p>동작마다 3세트와 쉬는 시간, 어려우신 분을 위한 쉬운 동작까지. 치매·파킨슨·뇌졸중 재활 어르신이 한 공간에서 함께 참여할 수 있도록 설계했습니다.</p>
        </div>

        <div className="cards">
          {CARDS.map((c) => (
            <Link key={c.label} to={c.to} className="scard" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="bg" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos, backgroundSize: c.size }} />
              <div className="ov" />
              <div className="top">
                <span className="mono">{c.label}</span>
                <i>→</i>
              </div>
              <div className="bot">
                <h3>
                  {c.title[0]}
                  <br />
                  {c.title[1]}
                </h3>
                <p>
                  <span>{c.body}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="credit">© 2026 MediMove · 이미지는 AI로 생성했습니다</p>
      </section>
    </div>
  )
}
