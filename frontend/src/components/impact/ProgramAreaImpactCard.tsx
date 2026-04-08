import type { ElementType } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ProgramAreaImpactCardProps {
  programArea: string
  outcomeMetric: string
  estimatedPctChange: number
  timeWindowMonths: number
  icon: ElementType
  sampleStatement?: string
}

export function ProgramAreaImpactCard({
  programArea,
  outcomeMetric,
  estimatedPctChange,
  timeWindowMonths,
  icon: Icon,
  sampleStatement,
}: ProgramAreaImpactCardProps) {
  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex flex-col flex-1 gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">{programArea}</span>
        </div>

        <div>
          <p className="text-4xl font-bold text-primary">
            +{estimatedPctChange.toFixed(1)}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            estimated improvement in {outcomeMetric.replace(/_/g, ' ')} over {timeWindowMonths} months
          </p>
        </div>

        {sampleStatement && (
          <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-3 mt-auto">
            "{sampleStatement}"
          </p>
        )}

        <p className="text-xs text-muted-foreground/70 mt-auto">
          Based on statistical analysis of donor allocations and resident outcomes.
          Results are estimated and reflect population-level trends.
        </p>
      </CardContent>
    </Card>
  )
}
