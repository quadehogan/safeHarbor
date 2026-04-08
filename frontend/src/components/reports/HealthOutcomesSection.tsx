import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricNumber } from '@/components/analytics/MetricNumber'
import { TrendChart } from '@/components/analytics/TrendChart'
import { Badge } from '@/components/ui/badge'

interface HealthOutcomesSectionProps {
  avgHealthScore: number
  avgPriorHealthScore: number
  mentalHealthFlags: number
  trendData: Array<{ month: string; avgScore: number }>
  loading?: boolean
}

export function HealthOutcomesSection({
  avgHealthScore,
  avgPriorHealthScore,
  mentalHealthFlags,
  trendData,
  loading = false,
}: HealthOutcomesSectionProps) {
  const delta = parseFloat((avgHealthScore - avgPriorHealthScore).toFixed(1))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Health Outcomes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-8 items-start">
          <MetricNumber
            label="Avg Wellbeing Score (1–5)"
            value={`${avgHealthScore.toFixed(1)} / 5.0`}
            delta={delta}
            invert={false}
            loading={loading}
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-foreground">{mentalHealthFlags}</span>
              {mentalHealthFlags > 0 && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Needs Attention
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Active Mental Health Flags</p>
          </div>
        </div>
        <TrendChart
          data={trendData as Record<string, unknown>[]}
          xKey="month"
          yKey="avgScore"
          label="Avg Health Score"
          chartType="bar"
          height={200}
        />
      </CardContent>
    </Card>
  )
}
