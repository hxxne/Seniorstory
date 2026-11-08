import Navbar from './components/Navbar'
import AboutSection from './components/AboutSection'
import FeaturesSection from './components/FeaturesSection'

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260711_090308_1dd0cea7-f9ba-4db4-8147-c7d746061c9e.mp4'

export default function App() {
  return (
    <>
      <section className="relative mb-[-25px] h-screen overflow-hidden">
        <video src={heroVideo} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <Navbar />

        <div className="relative flex h-full flex-col items-center justify-end gap-8 px-6 pb-12 text-center md:pb-16">
          <h1 className="text-5xl font-normal leading-[1.1] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[96px]">
            Own your time
            <br />
            without{' '}
            <em className="not-italic" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
              the stress
            </em>
          </h1>
          <p className="max-w-[420px] text-sm font-medium text-white/80 md:text-base">
            Drift is a calm, ADHD-friendly planner that turns scattered ideas into a clear path
          </p>
          <div className="flex items-center gap-4 rounded-xl bg-black/25 py-1 pl-6 pr-1 backdrop-blur-md">
            <span className="hidden text-sm font-medium text-white sm:block">
              No noise. No complicated systems. Just your day, gently sorted.
            </span>
            <span className="text-sm font-medium text-white sm:hidden">No noise. Just your day, gently sorted.</span>
            <a
              href="#"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Start for free
            </a>
          </div>
        </div>
      </section>

      <AboutSection />
      <FeaturesSection />
    </>
  )
}
