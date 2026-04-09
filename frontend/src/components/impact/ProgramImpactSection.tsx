import { Heart, GraduationCap, Truck, Settings } from 'lucide-react'
import type { ElementType } from 'react'
import { FadeIn } from '@/components/FadeIn'
import { Skeleton } from '@/components/ui/skeleton'
import { ProgramAreaImpactCard } from './ProgramAreaImpactCard'
import type { ProgramImpactSummaryDto } from '@/api/ImpactAPI'

interface ProgramImpactSectionProps {
  programs: ProgramImpactSummaryDto[]
  loading?: boolean
}

const areaIcons: Record<string, ElementType> = {
  Wellbeing: Heart,
  Education: GraduationCap,
  Transport: Truck,
  Operations: Settings,
}

export function ProgramImpactSection({ programs, loading = false }: ProgramImpactSectionProps) {
  if (!loading && programs.length === 0) return null

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn className="text-center mb-10">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Where Your Support Makes a Difference
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how donations are making a measurable difference across our core programs.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-56" />)
            : programs.map((p, i) => (
                <FadeIn key={`${p.programArea}-${p.outcomeMetric}`} className={i > 0 ? `delay-${i * 100}` : ''}>
                  <ProgramAreaImpactCard
                    programArea={p.programArea}
                    outcomeMetric={p.outcomeMetric}
                    estimatedPctChange={p.estimatedPctChange}
                    timeWindowMonths={p.timeWindowMonths}
                    icon={areaIcons[p.programArea] ?? Heart}
                    sampleStatement={p.sampleStatementText}
                  />
                </FadeIn>
              ))}
        </div>
      </div>
    </section>
  )
}
