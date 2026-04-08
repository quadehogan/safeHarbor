import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Hash } from 'lucide-react'
import type { SocialMediaRecommendationDto } from '@/api/SocialMediaAPI'

interface SocialMediaRecommendationCardProps {
  recommendation: SocialMediaRecommendationDto
}

function conversionBadge(signal?: string) {
  if (signal === 'converts')
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Converts</Badge>
  if (signal === 'noise')
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Noise</Badge>
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Balanced</Badge>
}

function confidenceBadge(tier?: string) {
  if (tier === 'high')
    return <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">High confidence</Badge>
  if (tier === 'low')
    return <Badge variant="outline" className="text-xs border-red-300 text-red-700">Low confidence</Badge>
  return <Badge variant="outline" className="text-xs">Med confidence</Badge>
}

function formatHour(hour?: number) {
  if (hour == null) return '—'
  const h = hour % 12 || 12
  return `${h} ${hour < 12 ? 'AM' : 'PM'}`
}

export function SocialMediaRecommendationCard({ recommendation: r }: SocialMediaRecommendationCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{r.platform}</span>
            <Badge variant="outline" className="text-xs">
              {r.isBoosted ? 'Boosted' : 'Organic'}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            {conversionBadge(r.conversionSignal)}
            {confidenceBadge(r.confidenceTier)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        {/* Best time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            Post on <span className="font-medium text-foreground">{r.bestDayOfWeek ?? '—'}</span> at{' '}
            <span className="font-medium text-foreground">{formatHour(r.bestHour)}</span>
          </span>
        </div>

        {/* Content guidance */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {r.postType && (
            <>
              <span className="text-muted-foreground">Post type</span>
              <span className="font-medium text-foreground">{r.postType}</span>
            </>
          )}
          {r.mediaType && (
            <>
              <span className="text-muted-foreground">Media</span>
              <span className="font-medium text-foreground">{r.mediaType}</span>
            </>
          )}
          {r.contentTopic && (
            <>
              <span className="text-muted-foreground">Topic</span>
              <span className="font-medium text-foreground">{r.contentTopic}</span>
            </>
          )}
          {r.sentimentTone && (
            <>
              <span className="text-muted-foreground">Tone</span>
              <span className="font-medium text-foreground">{r.sentimentTone}</span>
            </>
          )}
        </div>

        {/* CTA + story */}
        <div className="flex flex-wrap gap-1.5">
          {r.hasCallToAction && (
            <Badge variant="outline" className="text-xs">
              CTA: {r.callToActionType ?? 'Yes'}
            </Badge>
          )}
          {r.featuresResidentStory && (
            <Badge variant="outline" className="text-xs">Feature resident story</Badge>
          )}
          {r.recommendedHashtagCount != null && (
            <Badge variant="outline" className="text-xs">
              <Hash className="h-2.5 w-2.5 mr-0.5" />{r.recommendedHashtagCount} hashtags
            </Badge>
          )}
        </div>

        {/* Predictions */}
        <div className="border-t pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Est. donation referrals</p>
            <p className="font-semibold text-foreground">
              {r.predictedDonationReferrals != null ? r.predictedDonationReferrals.toFixed(1) : '—'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. donation value</p>
            <p className="font-semibold text-foreground">
              {r.predictedDonationValuePhp != null ? `PHP ${r.predictedDonationValuePhp.toFixed(0)}` : '—'}
            </p>
          </div>
        </div>

        {r.sampleCount != null && (
          <p className="text-xs text-muted-foreground/70">Based on {r.sampleCount} historical posts</p>
        )}
      </CardContent>
    </Card>
  )
}
