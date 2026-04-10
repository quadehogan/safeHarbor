import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RiskTierPills } from '@/components/analytics/RiskTierPills'
import type { DonorChurnSummaryDto, AtRiskDonorDto } from '@/api/ReportsAPI'

interface DonorChurnWidgetProps {
  data: DonorChurnSummaryDto | null
  atRiskDonors: AtRiskDonorDto[]
  loading?: boolean
}

export function DonorChurnWidget({ data, atRiskDonors, loading = false }: DonorChurnWidgetProps) {
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

            {/* At-risk donors table */}
            {atRiskDonors.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Most at-risk donors
                </p>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Donor</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Risk</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Churn Prob.</th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Top Factors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRiskDonors.map((donor) => (
                        <tr key={donor.supporterId} className="border-b last:border-b-0 hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{donor.displayName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{donor.supporterType}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                donor.riskTier === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {donor.riskTier === 'high' ? 'High' : 'Medium'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {Math.round(donor.churnProbability * 100)}%
                          </td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">
                            {donor.topRiskFactors.slice(0, 2).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
