import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface RiskTierPillsProps {
  high: number
  medium: number
  low: number
  tierLabels?: { high: string; medium: string; low: string }
  loading?: boolean
}

const defaultLabels = { high: 'High', medium: 'Medium', low: 'Low' }

export function RiskTierPills({
  high,
  medium,
  low,
  tierLabels = defaultLabels,
  loading = false,
}: RiskTierPillsProps) {
  if (loading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        {tierLabels.high}: {high}
      </Badge>
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {tierLabels.medium}: {medium}
      </Badge>
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
        {tierLabels.low}: {low}
      </Badge>
    </div>
  )
}
