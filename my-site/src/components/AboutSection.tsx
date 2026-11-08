import { Mail, Plus } from 'lucide-react'
import Logo from './Logo'

export default function AboutSection() {
  return (
    <section className="relative z-10 rounded-t-[25px] bg-[#F6E4CF] px-6 py-20 md:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <p className="max-w-lg text-center text-base leading-relaxed text-[#321C04] md:text-lg">
          We craft tools that move with your rhythm, not over it. Designed for ease, presence, and flow.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#"
            className="flex items-center gap-3 rounded-full bg-[#321C04] py-1.5 pl-1.5 pr-6 text-xs font-medium uppercase tracking-wide text-[#FFF9F2] transition-colors hover:bg-[#1F1003]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#321C04]">
              <Mail size={16} />
            </span>
            Say hello
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-full bg-[#D9C4AA] py-1.5 pl-1.5 pr-6 text-xs font-medium uppercase tracking-wide text-[#321C04] transition-colors hover:bg-[#CEBA9E]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#321C04]">
              <Plus size={16} />
            </span>
            Stay informed
          </a>
        </div>
      </div>

      <div className="my-16 flex w-full items-center gap-[2px] md:my-24">
        <span className="h-2 w-2 rounded-full bg-[#D9C4AA]" />
        <span className="h-[2px] flex-1 bg-[#D9C4AA]" />
        <span className="h-2 w-2 rounded-full bg-[#D9C4AA]" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:gap-16">
        <div className="flex shrink-0 items-center gap-4 self-start text-[#321C04]">
          <Logo />
          <span className="text-xs font-semibold uppercase leading-tight tracking-widest">
            Calm
            <br />
            Amplified
          </span>
        </div>
        <p className="text-2xl font-normal leading-[1.3] text-[#321C04] sm:text-3xl md:text-4xl lg:text-[42px]">
          We make AI tools and assistants. But, most importantly, we help you remember what gentle productivity looks
          like when software moves with you, not over you. We create systems that carry the cognitive weight, so you
          can attend to what truly counts.
        </p>
      </div>
    </section>
  )
}
