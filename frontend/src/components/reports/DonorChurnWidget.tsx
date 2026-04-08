import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RiskTierPills } from '@/components/analytics/RiskTierPills'
import type { DonorChurnSummaryDto } from '@/api/ReportsAPI'

interface DonorChurnWidgetProps {
  data: DonorChurnSummaryDto | null
  loading?: boolean
}

export function DonorChurnWidget({ data, loading = false }: DonorChurnWidgetProps) {
  const isEmpty = !loading && data && data.totalScored === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base font-semibold">Donor Retention Risk</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Powered by ML</Badge>
            {data?.lastScoredAt && (
              <span className="text-xs text-muted-foreground">
                Last run {new Date(data.lastScoredAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : isEmpty ? (
          <p className="text-sm text-muted-foreground">
            Scores not yet available. Run the ML scoring pipeline to populate this section.
          </p>
        ) : data ? (
          <>
            <RiskTierPills
              high={data.highChurn}
              medium={data.mediumChurn}
              low={data.lowChurn}
              tierLabels={{ high: 'High Risk', medium: 'Medium Risk', low: 'Low Risk' }}
            />

            {data.highChurn > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                {data.highChurn} donor{data.highChurn !== 1 ? 's are' : ' is'} at high risk of
                lapsing. Consider a re-engagement campaign.
              </div>
            )}

            {data.topChurnFactors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Why donors may be leaving
                </p>
                <ul className="space-y-1">
                  {data.topChurnFactors.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
