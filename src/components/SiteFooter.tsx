import { Link } from 'react-router-dom'
import { operator } from '../data/operator'

/** 화면 아래쪽: 운영자 정보와 정책 링크. 운영자 정보는 채워진 값만 나옵니다 */
export default function SiteFooter({ inverse = false, className = '' }: { inverse?: boolean; className?: string }) {
  const facts = [
    operator.name,
    operator.representative ? `대표 ${operator.representative}` : '',
    operator.businessNumber ? `사업자등록번호 ${operator.businessNumber}` : '',
    operator.address,
    operator.phone,
  ].filter(Boolean)
  const tone = inverse ? 'text-white/70' : 'text-ink-3'
  const link = `underline-offset-4 hover:underline ${inverse ? 'text-white' : 'text-ink-2'}`

  return (
    <footer className={`px-6 py-8 text-center text-[13px] leading-relaxed ${tone} ${className}`}>
      <nav aria-label="정책" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
        <Link to="/privacy" className={`font-semibold ${link}`}>
          개인정보 처리방침
        </Link>
        <Link to="/terms" className={link}>
          이용약관
        </Link>
        {operator.email ? (
          <a href={`mailto:${operator.email}`} className={link}>
            {operator.email}
          </a>
        ) : null}
      </nav>
      {facts.length ? <p className="mt-2">{facts.join(' · ')}</p> : null}
      <p className="mt-2">© 2026 MediMove · 소개 화면의 사진은 AI로 만든 이미지입니다</p>
    </footer>
  )
}
