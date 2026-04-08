import { MetricNumber } from './MetricNumber'

interface Metric {
  label: string
  value: string | number
  delta?: number
}

interface SummaryStatRowProps {
  metrics: Metric[]
  loading?: boolean
}

export function SummaryStatRow({ metrics, loading = false }: SummaryStatRowProps) {
  return (
    <div className="flex flex-wrap gap-6 divide-x divide-border">
      {metrics.map((m, i) => (
        <div key={m.label} className={i > 0 ? 'pl-6' : ''}>
          <MetricNumber
            label={m.label}
            value={m.value}
            delta={m.delta}
            loading={loading}
          />
        </div>
      ))}
    </div>
  )
}
