import { TrendingUp, TrendingDown } from 'lucide-react'

interface TrendBadgeProps {
  delta: number
  invert?: boolean
  label?: string
}

export function TrendBadge({ delta, invert = false, label }: TrendBadgeProps) {
  const isPositive = delta >= 0
  const isGood = invert ? !isPositive : isPositive

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isGood
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {delta > 0 ? '+' : ''}{delta}
      {label && <span className="ml-0.5 font-normal">{label}</span>}
    </span>
  )
}
