import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RiskTierPills } from '@/components/analytics/RiskTierPills'
import type { ResidentRiskSummaryDto } from '@/api/ReportsAPI'

interface ResidentRiskWidgetProps {
  data: ResidentRiskSummaryDto | null
  loading?: boolean
}

export function ResidentRiskWidget({ data, loading = false }: ResidentRiskWidgetProps) {
  const isEmpty = !loading && data &&
    data.highRisk === 0 && data.mediumRisk === 0 && data.lowRisk === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base font-semibold">Resident Risk Scores</CardTitle>
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
      <CardContent className="space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Regression Risk
                </p>
                <RiskTierPills
                  high={data.highRisk}
                  medium={data.mediumRisk}
                  low={data.lowRisk}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Reintegration Readiness
                </p>
                <RiskTierPills
                  high={data.readyForReintegration}
                  medium={data.reintegrationInProgress}
                  low={data.notReadyForReintegration}
                  tierLabels={{ high: 'Ready', medium: 'In Progress', low: 'Not Ready' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
              {data.topConcernFactors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Common Concern Signals
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.topConcernFactors.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.topStrengthFactors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Common Strength Signals
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.topStrengthFactors.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-800">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
