'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Droplets, Sparkles, Truck, Leaf, ShieldCheck, Package } from 'lucide-react'

/* ---------- Scroll Reveal Hook ---------- */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, visible]
}

/* ---------- Reveal Wrapper ---------- */
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.9s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#292722] overflow-x-hidden">

      {/* ================= 1. HERO ================= */}
      <section className="relative px-5 pt-10 pb-20 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[.18em] text-[#b49a62] hover:text-[#292722] transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Back to ZUNLLY
        </Link>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 items-center">
          <Reveal className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62]">
              Our Story
            </p>
            <h1 className="mt-4 font-serif text-6xl md:text-7xl leading-[1.05]">
              The Art of <br />
              <span className="italic bg-gradient-to-r from-[#827b70] to-[#b49a62] bg-clip-text text-transparent">
                Invisible Luxury.
              </span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-[#827b70]">
              ZUNLLY believes quality fragrance should feel personal and attainable.
              Our considered compositions are designed in Pakistan and made to
              become part of your everyday ritual.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px w-12 bg-[#b49a62]" />
              <p className="text-xs uppercase tracking-[.2em] text-[#827b70]">
                Est. in Pakistan
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#efece6] group">
              <Image
                src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop"
                alt="Zunlly Fragrance Crafting"
                fill
                className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
              {/* Gold accent border */}
              <div className="pointer-events-none absolute inset-3 border border-white/30" />
              {/* Floating badge */}
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm px-4 py-2 text-[10px] uppercase tracking-[.18em] text-[#292722]">
                Crafted with Intention
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 2. MARQUEE STRIP ================= */}
      <div className="border-y border-[#e6e1d9] bg-[#f8f7f4] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee text-xs uppercase tracking-[.3em] text-[#b49a62]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0">
              {['Premium Ingredients', 'Attainable Luxury', 'Designed in Pakistan', 'Long-Lasting Sillage', 'Cruelty Free'].map((t) => (
                <span key={t} className="mx-8 flex items-center gap-8">
                  {t} <span className="text-[#d6cdb9]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 28s linear infinite;
            width: max-content;
          }
        `}</style>
      </div>

      {/* ================= 3. BRAND PILLARS ================= */}
      <section className="bg-[#1d1c1a] text-white py-24 px-5 md:px-8 lg:px-12 relative overflow-hidden">
        {/* soft glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#b49a62]/10 blur-3xl" />

        <div className="max-w-6xl mx-auto relative">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62] mb-4">
              The Difference
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">Why ZUNLLY?</h2>
            <p className="mt-4 text-[#9b9387]">
              We don't just sell perfumes. We craft memories, elevate moods, and
              define your unique presence.
            </p>
          </Reveal>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: <Sparkles size={24} />,
                title: 'Premium Ingredients',
                desc: 'Sourced globally, blended perfectly. Our fragrances are crafted with the finest essential oils for long-lasting sillage.',
              },
              {
                icon: <Droplets size={24} />,
                title: 'Attainable Luxury',
                desc: "You shouldn't have to break the bank for a signature scent. We bridge the gap between high-end quality and fair pricing.",
              },
              {
                icon: <Truck size={24} />,
                title: 'Premium Delivery',
                desc: 'Packaged with care, delivered across Pakistan. Every order is a gift waiting to be unwrapped.',
              },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.15}>
                <div className="group flex flex-col items-center text-center rounded-2xl border border-[#3f3b36] bg-[#23221f] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#b49a62]/50 hover:shadow-[0_20px_60px_-20px_rgba(180,154,98,0.35)]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#292722] border border-[#3f3b36] mb-6 text-[#b49a62] transition-all duration-500 group-hover:border-[#b49a62] group-hover:scale-110">
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-xl mb-3">{v.title}</h3>
                  <p className="text-sm text-[#9b9387] leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. THE CRAFT ================= */}
      <section className="py-24 px-5 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-square w-full overflow-hidden bg-[#efece6] group">
              <Image
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop"
                alt="Perfume Notes"
                fill
                className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-3 border border-white/30" />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="order-1 lg:order-2 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62]">
              The Craft
            </p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-snug">
              Crafted for the <br /> Modern Individual.
            </h2>
            <div className="mt-6 h-px w-20 bg-[#b49a62]" />
            <p className="mt-6 text-lg leading-relaxed text-[#827b70]">
              Our process starts with a vision: to create scents that resonate with
              the modern Pakistani lifestyle. We blend traditional oriental notes
              with contemporary fresh accords.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[#827b70]">
              Whether you're stepping into a boardroom or enjoying a quiet evening,
              ZUNLLY is your invisible armor, leaving a trail of elegance wherever
              you go.
            </p>

            {/* mini stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#e6e1d9] pt-8">
              {[
                { n: '100%', l: 'Cruelty Free' },
                { n: '8-12h', l: 'Longevity' },
                { n: 'PK', l: 'Designed' },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-serif text-3xl text-[#292722]">{s.n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[#827b70]">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= 5. SCENT NOTES / PHILOSOPHY ================= */}
      <section className="bg-[#efece6] py-24 px-5 md:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62] mb-4">
              The Philosophy
            </p>
            <h2 className="font-serif text-4xl md:text-5xl">Built on Three Layers.</h2>
            <p className="mt-4 text-[#827b70]">
              Every ZUNLLY fragrance unfolds in three carefully balanced stages —
              a journey from first impression to lasting memory.
            </p>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Leaf size={22} />,
                step: '01',
                title: 'Top Notes',
                desc: 'The first impression — bright, fresh, and inviting. Citrus, bergamot, and light florals greet the senses.',
              },
              {
                icon: <Sparkles size={22} />,
                step: '02',
                title: 'Heart Notes',
                desc: 'The soul of the fragrance. Rich florals, spices, and resins bloom to define the character of the scent.',
              },
              {
                icon: <ShieldCheck size={22} />,
                step: '03',
                title: 'Base Notes',
                desc: 'The lasting memory. Warm woods, amber, and musk linger on the skin, creating a signature trail.',
              },
            ].map((n, i) => (
              <Reveal key={n.title} delay={i * 0.15}>
                <div className="group relative h-full rounded-2xl bg-white p-8 border border-[#e6e1d9] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-25px_rgba(41,39,34,0.25)]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f7f4] text-[#b49a62] transition-colors group-hover:bg-[#1d1c1a] group-hover:text-[#b49a62]">
                      {n.icon}
                    </div>
                    <span className="font-serif text-4xl text-[#e6e1d9] transition-colors group-hover:text-[#b49a62]/40">
                      {n.step}
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl mb-3">{n.title}</h3>
                  <p className="text-sm leading-relaxed text-[#827b70]">{n.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. PROMISE STRIP ================= */}
      <section className="py-16 px-5 md:px-8 lg:px-12 max-w-6xl mx-auto">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Truck size={20} />, l: 'Nationwide Delivery' },
              { icon: <Package size={20} />, l: 'Secure Packaging' },
              { icon: <ShieldCheck size={20} />, l: 'Authentic Scents' },
              { icon: <Leaf size={20} />, l: 'Cruelty Free' },
            ].map((p) => (
              <div key={p.l} className="flex flex-col items-center gap-3 group">
                <div className="text-[#b49a62] transition-transform group-hover:-translate-y-1">
                  {p.icon}
                </div>
                <p className="text-[10px] uppercase tracking-[.18em] text-[#827b70]">
                  {p.l}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= 7. CTA ================= */}
      <section className="relative bg-[#1d1c1a] py-24 px-5 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-[#b49a62] blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-[#b49a62] blur-3xl" />
        </div>

        <Reveal className="relative">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#b49a62] mb-4">
            Discover
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-white">
            Find Your Signature Scent.
          </h2>
          <p className="mt-4 text-[#9b9387] max-w-xl mx-auto">
            Explore our exclusive collection and experience the ZUNLLY difference.
          </p>
          <Link
            href="/#shop"
            className="group mt-10 inline-flex items-center gap-3 bg-[#b49a62] px-10 py-4 text-xs font-semibold uppercase tracking-[.18em] text-[#1d1c1a] transition-all hover:bg-white"
          >
            Explore Collection
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </section>

      {/* ================= 8. FOOTER STRIP ================= */}
      <footer className="bg-[#141311] py-8 px-5 text-center">
        <p className="text-[10px] uppercase tracking-[.25em] text-[#6f6a61]">
          © {new Date().getFullYear()} ZUNLLY — Invisible Luxury, Made Visible.
        </p>
      </footer>
    </main>
  )
}