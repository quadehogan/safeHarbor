import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, TrendingUp, Heart, GraduationCap } from 'lucide-react'

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Residents`

interface InterventionRecommendationDto {
  profileCluster?: string
  recommendedServices: string[]
  recommendedSessionType?: string
  recommendedSessionsPerMonth?: number
  recommendedSocialWorker?: string
  swOutcomeScore?: number
  predictedHealthImprovement?: number
  predictedEducationImprovement?: number
  similarResidentCount?: number
  confidenceTier?: string
  topOutcomeFactors: string[]
  scoredAt?: string
}

interface InterventionRecommendationCardProps {
  residentId: number
  token: string | null
}

function confidenceBadge(tier?: string) {
  if (tier === 'high')
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">High confidence</Badge>
  if (tier === 'low')
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Low confidence</Badge>
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Med confidence</Badge>
}

export function InterventionRecommendationCard({ residentId, token }: InterventionRecommendationCardProps) {
  const [data, setData] = useState<InterventionRecommendationDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!residentId) return
    fetch(`${API_BASE}/${residentId}/recommendation`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null }
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((d) => { if (d) setData(d) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [residentId, token])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-sm font-semibold">Suggested Intervention</CardTitle>
          <div className="flex items-center gap-1.5">
            {!loading && !notFound && data && confidenceBadge(data.confidenceTier)}
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">Powered by ML</Badge>
          </div>
        </div>
        {!loading && data?.scoredAt && (
          <p className="text-xs text-muted-foreground">
            Last scored {new Date(data.scoredAt).toLocaleDateString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : notFound || !data ? (
          <p className="text-xs text-muted-foreground">
            No recommendation available yet. Run the intervention scoring pipeline to populate this section.
          </p>
        ) : (
          <>
            {/* Profile cluster */}
            {data.profileCluster && (
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Profile:</span>
                <span className="font-medium text-foreground">{data.profileCluster}</span>
              </div>
            )}

            {/* Recommended services */}
            {data.recommendedServices.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Suggested services</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.recommendedServices.map((s, i) => (
                    <Badge
                      key={s}
                      className={`text-xs ${i === 0 ? 'bg-primary/15 text-primary hover:bg-primary/15' : 'bg-muted text-muted-foreground hover:bg-muted'}`}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Session guidance */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.recommendedSessionType && (
                <div>
                  <p className="text-muted-foreground">Session type</p>
                  <p className="font-medium text-foreground">{data.recommendedSessionType}</p>
                </div>
              )}
              {data.recommendedSessionsPerMonth != null && (
                <div>
                  <p className="text-muted-foreground">Sessions/month</p>
                  <p className="font-medium text-foreground">{data.recommendedSessionsPerMonth}</p>
                </div>
              )}
            </div>

            {/* Recommended social worker */}
            {data.recommendedSocialWorker && (
              <div className="text-xs">
                <p className="text-muted-foreground mb-0.5">Suggested social worker</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{data.recommendedSocialWorker}</span>
                  {data.swOutcomeScore != null && (
                    <span className="text-emerald-700 font-medium">
                      +{data.swOutcomeScore.toFixed(1)} avg outcome
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Predicted improvements */}
            {(data.predictedHealthImprovement != null || data.predictedEducationImprovement != null) && (
              <div className="grid grid-cols-2 gap-2 border-t pt-3 text-xs">
                {data.predictedHealthImprovement != null && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Health</p>
                      <p className="font-medium text-foreground">
                        {data.predictedHealthImprovement > 0 ? '+' : ''}{data.predictedHealthImprovement.toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}
                {data.predictedEducationImprovement != null && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Education</p>
                      <p className="font-medium text-foreground">
                        {data.predictedEducationImprovement > 0 ? '+' : ''}{data.predictedEducationImprovement.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top outcome factors */}
            {data.topOutcomeFactors.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-1.5">Why this recommendation</p>
                <ul className="space-y-1">
                  {data.topOutcomeFactors.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                      <TrendingUp className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.similarResidentCount != null && (
              <p className="text-xs text-muted-foreground/70">
                Based on {data.similarResidentCount} similar resident profiles
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
