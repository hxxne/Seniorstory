/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Hahmlet', '"Noto Serif KR"', 'Georgia', 'serif'],
      },
      colors: {
        /* 랜딩과 같은 디자인 언어: 잉크 그린, 미스트 그레이, 라임 강조 */
        ink: {
          DEFAULT: '#10291A',
          2: '#2C4434',
          3: '#5D7064',
          4: '#9FADA4',
        },
        moss: {
          50: '#EDF4EE',
          100: '#D8E8DC',
          200: '#B4D1BC',
          300: '#86B596',
          400: '#4F9468',
          500: '#2F7A4C',
          600: '#1F5C38',
          700: '#17482C',
          800: '#123823',
          900: '#10291A',
        },
        /* 표면용 중립색 (이름은 유지, 값은 미스트 톤) */
        sand: {
          50: '#F6F7F4',
          100: '#EEF1EE',
          200: '#E7EBE8',
          300: '#D5DBD6',
          400: '#B9C2BB',
        },
        /* 대시보드·태블릿 토큰 (Linear·Notion 계열): 흰 바탕, 가는 선, 차분한 파랑 하나 */
        d: {
          side: '#F9F9FA',
          hover: '#F3F3F5',
          active: '#EBEBEF',
          line: '#E9E9EC',
          line2: '#DADADF',
          1: '#1C1C1F',
          2: '#5E5E66',
          3: '#8B8B93',
          a: '#2F5FE3',
          a2: '#2650C7',
          asoft: '#EEF3FE',
          ok: '#2F9E63',
          oksoft: '#E8F5ED',
          warn: '#C4860A',
          warnsoft: '#FBF2DC',
          bad: '#D94B4B',
          badsoft: '#FBEAEA',
        },
        lime: {
          DEFAULT: '#C6F35C',
          2: '#A9DD3A',
          deep: '#4F8A12',
        },
        amber: {
          DEFAULT: '#E8A33D',
          soft: '#FBEBD0',
          deep: '#B87516',
        },
        coral: {
          DEFAULT: '#D9573B',
          soft: '#FBE1DA',
          deep: '#A83A23',
        },
        tv: {
          bg: '#0B0D11',
          panel: '#14171D',
          line: '#262A33',
          cue: '#FFD166',
        },
      },
      boxShadow: {
        bezel: '0 1px 2px rgba(20,37,31,0.05)',
        card: '0 1px 2px rgba(20,37,31,0.05)',
        lift: '0 8px 24px rgba(20,37,31,0.06)',
      },
      borderRadius: {
        bezel: '28px',
        'bezel-in': '22px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.23, 1, 0.32, 1) infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
