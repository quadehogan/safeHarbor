import type { ElementType } from 'react'
import { FadeIn } from '@/components/FadeIn'

interface HeroStat {
  icon: ElementType
  value: string
  label: string
}

interface ImpactHeroSectionProps {
  headline: string
  subheadline: string
  stats: HeroStat[]
  backgroundImage: string
}

export function ImpactHeroSection({ headline, subheadline, stats, backgroundImage }: ImpactHeroSectionProps) {
  return (
    <section className="relative min-h-[480px] sm:min-h-[540px] flex items-center">
      <img
        src={backgroundImage}
        alt="Safe Harbor shelter in the Philippines"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 w-full">
        <FadeIn>
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
              {headline}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
              {subheadline}
            </p>
          </div>
        </FadeIn>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} className={i > 0 ? `delay-${i * 100}` : ''}>
              <div className="rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 p-5 text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs sm:text-sm text-white/70">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
