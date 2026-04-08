import { Skeleton } from '@/components/ui/skeleton'
import { TrendBadge } from './TrendBadge'

interface MetricNumberProps {
  label: string
  value: string | number
  delta?: number
  deltaLabel?: string
  loading?: boolean
}

export function MetricNumber({ label, value, delta, deltaLabel, loading = false }: MetricNumberProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {delta !== undefined && <TrendBadge delta={delta} label={deltaLabel} />}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
