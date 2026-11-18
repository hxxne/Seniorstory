import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import SiteFooter from '../components/SiteFooter'
import { operator, operatorReady, POLICY_DATE } from '../data/operator'

/*
 * 개인정보 처리방침과 이용약관. 실제로 동작하는 것만 적습니다.
 * 저장하는 정보나 외부 서비스가 바뀌면 이 글도 함께 고칩니다 (src/lib/auth.ts, store.ts, sync.ts, index.html).
 */

type Kind = 'privacy' | 'terms'

const who = operator.name || 'MediMove 운영자'

function Contact() {
  if (!operatorReady) return <p>문의처는 준비 중입니다. 정식 운영 전에 이 자리에 운영자 이름과 연락처를 올립니다.</p>
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
      <dt className="text-ink-3">운영자</dt>
      <dd>{operator.name}</dd>
      {operator.privacyOfficer ? (
        <>
          <dt className="text-ink-3">개인정보 보호책임자</dt>
          <dd>{operator.privacyOfficer}</dd>
        </>
      ) : null}
      <dt className="text-ink-3">이메일</dt>
      <dd>
        <a className="underline underline-offset-4" href={`mailto:${operator.email}`}>
          {operator.email}
        </a>
      </dd>
      {operator.phone ? (
        <>
          <dt className="text-ink-3">전화</dt>
          <dd>{operator.phone}</dd>
        </>
      ) : null}
    </dl>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-[20px] font-semibold leading-snug tracking-[-0.01em]">{title}</h2>
      <div className="mt-4 space-y-3 text-[16px] leading-[1.75] text-ink-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">{children}</div>
    </section>
  )
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[15px] leading-relaxed">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-ink/20 py-2 pr-4 font-semibold text-ink">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (
                <td key={i} className="border-b border-ink/10 py-2.5 pr-4 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Privacy() {
  return (
    <>
      <Section title="1. 한눈에 보기">
        <ul>
          <li>기관 등록 때 입력한 정보는 <strong>등록한 기기의 브라우저에만</strong> 저장됩니다. 운영자의 서버로 보내지 않습니다.</li>
          <li>화면에 나오는 어르신 명단과 기록은 <strong>예시 자료</strong>입니다. 실제 어르신의 이름이나 건강 정보를 입력받지 않습니다.</li>
          <li>광고나 방문 분석 도구를 쓰지 않습니다. 광고 메일도 보내지 않습니다.</li>
          <li>TV와 태블릿을 연결 코드로 묶을 때만, 운동 진행 상태가 외부 서버(Google Firebase)를 거칩니다. 이름과 연락처는 들어가지 않습니다.</li>
        </ul>
      </Section>

      <Section title="2. 처리하는 정보와 목적">
        <Table
          head={['언제', '정보', '쓰는 목적', '저장되는 곳']}
          rows={[
            ['기관 등록', '기관명, 기관 유형, 관리자 성함, 이메일, 비밀번호(알아볼 수 없게 바꾼 값), 등록 어르신 수(선택), 기본 프로그램과 운동 시간대', '로그인, 화면에 기관과 관리자 이름 표시', '등록한 기기의 브라우저'],
            ['서비스 이용', '출석 표시, 운동 진행 상태, 오늘 마친 운동 횟수, 시작 안내 진행 여부', '운동 진행과 기록 화면 표시', '쓰는 기기의 브라우저'],
            ['TV와 태블릿 연결', '여섯 자리 연결 코드, 운동 진행 상태, 예시 어르신 번호별 출석·상태 표시, 기기 종류(TV·태블릿)와 접속 시각', '서로 다른 기기의 화면을 맞추기', 'Google Firebase 서버(싱가포르)'],
          ]}
        />
        <p>비밀번호는 그대로 저장하지 않습니다. 계정마다 다른 값을 섞어 여러 번 변환한 결과만 저장하며, 이 값으로 원래 비밀번호를 알아낼 수 없습니다.</p>
      </Section>

      <Section title="3. 보관 기간과 지우는 방법">
        <ul>
          <li>브라우저에 저장된 정보는 지울 때까지 그 기기에 남습니다.</li>
          <li>대시보드의 <strong>계정</strong> 화면에서 「계정 삭제」를 누르면 그 기기에 저장된 계정과 기록이 바로 지워집니다. 되돌릴 수 없습니다.</li>
          <li>브라우저 설정에서 이 사이트의 저장 데이터를 지워도 같은 결과입니다.</li>
          <li>연결 코드로 Firebase 서버에 올라간 운동 진행 상태는 자동으로 지워지지 않습니다. 이름이나 연락처는 들어 있지 않으며, 지우기를 원하면 연결 코드를 적어 아래 문의처로 알려 주세요.</li>
        </ul>
      </Section>

      <Section title="4. 외부 서비스">
        <p>사이트가 동작하려면 아래 서비스에 접속합니다. 이때 접속한 기기의 인터넷 주소(IP) 같은 접속 정보가 각 회사에 전달될 수 있습니다.</p>
        <Table
          head={['서비스', '회사', '하는 일']}
          rows={[
            ['GitHub Pages', 'GitHub, Inc. (미국)', '사이트 파일을 보내 줍니다'],
            ['Firebase Realtime Database', 'Google LLC (서버 위치: 싱가포르)', 'TV와 태블릿을 연결했을 때 운동 진행 상태를 전달합니다'],
            ['jsDelivr', 'jsDelivr (Prospect One)', '글꼴(Pretendard) 파일을 보내 줍니다'],
            ['Google Fonts', 'Google LLC (미국)', '글꼴(Hahmlet) 파일을 보내 줍니다'],
          ]}
        />
        <p>이 밖에 개인정보를 다른 곳에 제공하거나 판매하지 않습니다.</p>
      </Section>

      <Section title="5. 쿠키와 브라우저 저장소">
        <p>로그인과 화면 동작에 꼭 필요한 것만 씁니다. 광고나 분석용 쿠키가 없으므로 따로 동의를 묻는 창을 띄우지 않습니다.</p>
        <Table
          head={['이름', '종류', '내용', '없어지는 때']}
          rows={[
            ['seniorstory:accounts:v1', '브라우저 저장소', '이 기기에서 등록한 기관 계정', '계정 삭제 또는 브라우저 데이터 삭제'],
            ['seniorstory:v1', '브라우저 저장소', '로그인 상태, 출석, 운동 진행 상태, 연결 코드', '계정 삭제 또는 브라우저 데이터 삭제'],
            ['seniorstory:session-only', '브라우저 저장소', '「이 기기 기억하기」를 끄고 로그인했다는 표시', '다음 로그인 또는 브라우저를 다시 열 때'],
            ['mm_alive', '쿠키', '브라우저를 닫으면 로그아웃되게 하는 표시', '브라우저를 닫을 때'],
          ]}
        />
      </Section>

      <Section title="6. 이용자의 권리">
        <ul>
          <li>저장된 내 정보는 내 기기에 있으므로, 대시보드의 계정 화면에서 직접 확인하고 지울 수 있습니다.</li>
          <li>Firebase 서버에 올라간 연결 기록의 열람이나 삭제는 아래 문의처로 요청할 수 있습니다.</li>
          <li>만 14세 미만 아동을 대상으로 하지 않으며, 아동의 정보를 받지 않습니다.</li>
        </ul>
      </Section>

      <Section title="7. 안전하게 지키는 방법">
        <ul>
          <li>사이트는 암호화된 연결(https)로만 열립니다.</li>
          <li>비밀번호는 변환한 값만 저장합니다.</li>
          <li>여러 사람이 쓰는 기기에서는 「이 기기 기억하기」를 끄고, 다 쓴 뒤 로그아웃해 주세요. 계정이 기기에 저장되므로 그 기기를 쓰는 다른 사람이 브라우저 데이터를 볼 수 있습니다.</li>
          <li>연결 코드를 아는 사람은 그 TV의 운동 화면을 조작할 수 있습니다. 코드는 기관 안에서만 쓰세요.</li>
        </ul>
      </Section>

      <Section title="8. 문의">
        <Contact />
      </Section>

      <Section title="9. 바뀌는 경우">
        <p>저장하는 정보나 외부 서비스가 바뀌면 이 글을 고치고 아래 날짜를 바꿉니다. 계정을 서버에 저장하는 방식으로 바뀔 때는 미리 알리고 다시 동의를 받습니다.</p>
      </Section>
    </>
  )
}

function Terms() {
  return (
    <>
      <Section title="1. 서비스">
        <p>MediMove는 요양기관에서 TV로 운동 영상을 틀고 태블릿으로 진행을 조작하며, 출석과 진행 기록을 남기는 웹 서비스입니다. {who}가 운영합니다.</p>
        <p>지금은 <strong>시범 운영 단계</strong>입니다. 어르신 명단과 주간 기록은 예시 자료로 채워져 있습니다.</p>
      </Section>

      <Section title="2. 계정">
        <ul>
          <li>기관 등록을 하면 계정이 만들어집니다. 계정은 등록한 기기의 브라우저에만 저장되므로 다른 기기에서는 다시 등록해야 합니다.</li>
          <li>비밀번호를 잊으면 찾을 방법이 없습니다. 계정을 지우고 다시 등록해야 합니다.</li>
          <li>계정과 비밀번호는 등록한 기관이 관리합니다.</li>
          <li>계정은 대시보드의 계정 화면에서 언제든 지울 수 있습니다.</li>
        </ul>
      </Section>

      <Section title="3. 요금">
        <p>지금은 결제 기능이 없고, 요금을 받지 않습니다. 유료 기능이 생기면 가격과 환불 기준을 먼저 알리고 이 약관을 고칩니다.</p>
      </Section>

      <Section title="4. 운동을 진행할 때">
        <ul>
          <li>MediMove는 운동을 안내하는 도구이며 <strong>의료 행위나 진단, 치료를 대신하지 않습니다.</strong></li>
          <li>운동 전에 어르신의 상태를 확인하고, 참여 여부와 강도를 정하는 일은 기관과 요양보호사가 합니다. 질환이 있는 어르신은 담당 의료진의 의견을 따릅니다.</li>
          <li>통증이나 어지러움을 호소하면 바로 멈추고 쉬게 합니다.</li>
        </ul>
      </Section>

      <Section title="5. 하면 안 되는 일">
        <ul>
          <li>다른 기관의 연결 코드를 알아내 그 기관의 화면을 조작하는 일</li>
          <li>서비스나 서버에 부담을 주거나 정상 동작을 방해하는 일</li>
          <li>운동 영상과 화면을 허락 없이 복제해 배포하거나 판매하는 일</li>
        </ul>
      </Section>

      <Section title="6. 서비스의 변경과 중단">
        <p>시범 운영 중에는 기능이 바뀌거나 서비스가 멈출 수 있습니다. 기록은 기기의 브라우저에 저장되므로, 브라우저 데이터를 지우거나 기기를 바꾸면 사라집니다. 중요한 기록은 기관에서 따로 보관해 주세요.</p>
      </Section>

      <Section title="7. 책임">
        <p>운영자는 서비스를 안정적으로 제공하려고 노력합니다. 다만 무료 시범 서비스의 중단이나 기기에 저장된 기록의 유실, 운동 중 생긴 사고에 대해서는 운영자의 고의나 큰 잘못이 없는 한 책임지지 않습니다. 법에서 정한 이용자의 권리는 이 조항으로 줄어들지 않습니다.</p>
      </Section>

      <Section title="8. 저작권">
        <p>운동 영상, 프로그램 구성, 화면 디자인의 권리는 운영자에게 있습니다. 소개 화면의 사진은 AI로 만든 이미지입니다. 글꼴은 Pretendard와 Hahmlet(모두 SIL Open Font License), 아이콘은 Lucide(ISC License)를 씁니다.</p>
      </Section>

      <Section title="9. 문의">
        <Contact />
      </Section>
    </>
  )
}

export default function Policy({ kind }: { kind: Kind }) {
  const privacy = kind === 'privacy'
  return (
    <div className="min-h-screen bg-sand-50 text-ink">
      <header className="mx-auto flex max-w-[760px] items-center justify-between px-6 pt-8">
        <Link to="/" aria-label="MediMove 홈">
          <Logo />
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] text-ink-2 hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          처음으로
        </Link>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-20 pt-14">
        <h1 className="font-serif text-[34px] font-medium leading-tight tracking-[-0.02em]">{privacy ? '개인정보 처리방침' : '이용약관'}</h1>
        <p className="mt-3 text-[15px] text-ink-3">
          마지막으로 고친 날 {POLICY_DATE} ·{' '}
          <Link to={privacy ? '/terms' : '/privacy'} className="underline underline-offset-4 hover:text-ink">
            {privacy ? '이용약관 보기' : '개인정보 처리방침 보기'}
          </Link>
        </p>
        {privacy ? <Privacy /> : <Terms />}
      </main>

      <SiteFooter />
    </div>
  )
}
