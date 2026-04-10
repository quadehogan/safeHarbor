import { ArrowRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FadeIn } from '@/components/FadeIn'

interface ImpactCTASectionProps {
  headline: string
  body: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

export function ImpactCTASection({
  headline,
  body,
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
}: ImpactCTASectionProps) {
  return (
    <section className="bg-primary/10">
      <FadeIn className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{headline}</h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {body}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-md bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Donate Now
          </Link>
          <Link
            to={primaryTo}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </FadeIn>
    </section>
  )
}
