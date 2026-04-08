import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricNumber } from '@/components/analytics/MetricNumber'
import { TrendChart } from '@/components/analytics/TrendChart'
import { Skeleton } from '@/components/ui/skeleton'

interface Donation {
  donationDate: string
  amount?: number | null
  estimatedValue?: number | null
  donationType?: string
}

interface DonationTrendChartProps {
  donations: Donation[]
  loading?: boolean
}

function groupByMonth(donations: Donation[]) {
  const map: Record<string, number> = {}
  for (const d of donations) {
    const val = d.amount ?? d.estimatedValue ?? 0
    const month = d.donationDate?.slice(0, 7) ?? 'Unknown'
    map[month] = (map[month] ?? 0) + Number(val)
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total: Math.round(total) }))
}

export function DonationTrendChart({ donations, loading = false }: DonationTrendChartProps) {
  const monthlyData = groupByMonth(donations)
  const totalRaised = donations.reduce(
    (sum, d) => sum + Number(d.amount ?? d.estimatedValue ?? 0),
    0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Donation Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-8 w-36" />
        ) : (
          <MetricNumber
            label="Total Raised"
            value={`$${totalRaised.toLocaleString()}`}
            loading={loading}
          />
        )}
        <TrendChart
          data={monthlyData as Record<string, unknown>[]}
          xKey="month"
          yKey="total"
          label="Total Donated (USD)"
          chartType="bar"
          height={220}
        />
      </CardContent>
    </Card>
  )
}
