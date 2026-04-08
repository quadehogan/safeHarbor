import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SocialMediaRecommendationCard } from './SocialMediaRecommendationCard'
import type { SocialMediaRecommendationDto } from '@/api/SocialMediaAPI'

interface SocialMediaRecommendationsPanelProps {
  recommendations: SocialMediaRecommendationDto[]
  loading?: boolean
}

const PLATFORM_ORDER = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'LinkedIn']

export function SocialMediaRecommendationsPanel({
  recommendations,
  loading = false,
}: SocialMediaRecommendationsPanelProps) {
  const lastRun = recommendations[0]?.generatedAt

  const byPlatform = PLATFORM_ORDER.reduce<Record<string, SocialMediaRecommendationDto[]>>(
    (acc, p) => {
      acc[p] = recommendations.filter((r) => r.platform === p)
      return acc
    },
    {},
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base font-semibold">Posting Recommendations</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Optimized for donation conversion, not engagement alone. Powered by ML.
            </p>
          </div>
          {lastRun && (
            <span className="text-xs text-muted-foreground">
              Last run {new Date(lastRun).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations available yet. Run the social media scoring pipeline to populate this section.
          </p>
        ) : (
          PLATFORM_ORDER.filter((p) => byPlatform[p]?.length > 0).map((platform) => (
            <div key={platform}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{platform}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {byPlatform[platform].map((rec) => (
                  <SocialMediaRecommendationCard key={rec.recommendationId} recommendation={rec} />
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
