const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/SocialMedia`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface SocialMediaPost {
  socialMediaPostId: number
  platform?: string
  postUrl?: string
  createdAt?: string
  dayOfWeek?: string
  postHour?: number
  postType?: string
  mediaType?: string
  caption?: string
  hashtags?: string
  numHashtags?: number
  isBoosted?: boolean
  likes?: number
  comments?: number
  shares?: number
  engagementRate?: number
  donationReferrals?: number
  estimatedDonationValuePhp?: number
  contentTopic?: string
  sentimentTone?: string
  hasCallToAction?: boolean
  callToActionType?: string
}

export interface SocialMediaRecommendationDto {
  recommendationId: string
  platform: string
  isBoosted: boolean
  postType?: string
  mediaType?: string
  contentTopic?: string
  sentimentTone?: string
  hasCallToAction?: boolean
  callToActionType?: string
  featuresResidentStory?: boolean
  bestDayOfWeek?: string
  bestHour?: number
  recommendedHashtagCount?: number
  predictedEngagementRate?: number
  predictedDonationReferrals?: number
  predictedDonationValuePhp?: number
  conversionSignal?: string
  sampleCount?: number
  confidenceTier?: string
  generatedAt?: string
  modelVersion?: string
}

export async function fetchSocialMedia(token: string | null): Promise<SocialMediaPost[]> {
  const res = await fetch(API_BASE_URL, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchSocialMediaRecommendations(token: string | null): Promise<SocialMediaRecommendationDto[]> {
  const res = await fetch(`${API_BASE_URL}/recommendations`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
