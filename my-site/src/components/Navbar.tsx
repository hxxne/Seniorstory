import { useState } from 'react'

const links = ['Features', 'Drift AI', 'FAQ']
const ease = 'cubic-bezier(0.77,0,0.175,1)'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="flex items-center gap-4 rounded-full bg-white px-5 py-2.5 shadow-lg">
        <span className="text-lg font-bold tracking-tight text-black">Drift.</span>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="relative h-5 w-5"
        >
          <span
            style={{ transitionTimingFunction: ease }}
            className={`absolute left-0 top-1/2 h-[2px] w-5 bg-black transition-transform duration-300 ${
              open ? 'rotate-45' : '-translate-y-[3px]'
            }`}
          />
          <span
            style={{ transitionTimingFunction: ease }}
            className={`absolute left-0 top-1/2 h-[2px] w-5 bg-black transition-transform duration-300 ${
              open ? '-rotate-45' : 'translate-y-[3px]'
            }`}
          />
        </button>
      </div>

      <div
        className={`mt-2 flex min-w-[180px] flex-col rounded-2xl bg-white p-2 shadow-lg transition-all duration-200 ease-out ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        }`}
      >
        {links.map((l) => (
          <a key={l} href="#" className="rounded-xl px-4 py-2 text-sm font-medium text-black hover:bg-black/5">
            {l}
          </a>
        ))}
      </div>
    </nav>
  )
}
