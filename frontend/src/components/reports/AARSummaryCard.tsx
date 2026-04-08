import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SummaryStatRow } from '@/components/analytics/SummaryStatRow'
import { MetricNumber } from '@/components/analytics/MetricNumber'

interface AARSummaryCardProps {
  year: number
  caring: number
  healing: number
  teaching: number
  totalBeneficiaries: number
  reintegrated: number
  loading?: boolean
}

export function AARSummaryCard({
  year,
  caring,
  healing,
  teaching,
  totalBeneficiaries,
  reintegrated,
  loading = false,
}: AARSummaryCardProps) {
  const reintegrationRate =
    totalBeneficiaries > 0
      ? Math.round((reintegrated / totalBeneficiaries) * 100)
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Annual Accomplishment Report — {year}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Aligned with Philippine DSWD AAR service pillars
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <SummaryStatRow
          loading={loading}
          metrics={[
            { label: 'Caring', value: caring },
            { label: 'Healing', value: healing },
            { label: 'Teaching', value: teaching },
            { label: 'Total Beneficiaries', value: totalBeneficiaries },
          ]}
        />
        <div className="flex flex-wrap gap-6 border-t pt-4">
          <MetricNumber label="Reintegrated This Year" value={reintegrated} loading={loading} />
          <MetricNumber label="Reintegration Rate" value={`${reintegrationRate}%`} loading={loading} />
        </div>
      </CardContent>
    </Card>
  )
}
