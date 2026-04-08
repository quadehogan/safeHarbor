import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { SocialMediaRecommendationsPanel } from '@/components/social/SocialMediaRecommendationsPanel'
import { fetchSocialMedia, fetchSocialMediaRecommendations } from '@/api/SocialMediaAPI'
import type { SocialMediaPost, SocialMediaRecommendationDto } from '@/api/SocialMediaAPI'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ThumbsUp, MessageCircle, Share2, TrendingUp } from 'lucide-react'

const PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'LinkedIn']

function platformBadge(platform?: string) {
  const colors: Record<string, string> = {
    Facebook: 'bg-blue-100 text-blue-800',
    Instagram: 'bg-pink-100 text-pink-800',
    TikTok: 'bg-slate-900 text-slate-100',
    WhatsApp: 'bg-emerald-100 text-emerald-800',
    LinkedIn: 'bg-sky-100 text-sky-800',
  }
  const cls = platform ? (colors[platform] ?? 'bg-muted text-muted-foreground') : 'bg-muted text-muted-foreground'
  return <Badge className={`${cls} hover:${cls}`}>{platform ?? '—'}</Badge>
}

function fmtNum(n?: number | null, decimals = 0) {
  if (n == null) return '—'
  return n.toLocaleString('en-PH', { maximumFractionDigits: decimals })
}

export function SocialMediaPage() {
  const { token } = useAuth()

  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [recs, setRecs] = useState<SocialMediaRecommendationDto[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [recsLoading, setRecsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [boostedFilter, setBoostedFilter] = useState('all')

  useEffect(() => {
    setPostsLoading(true)
    fetchSocialMedia(token)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setPostsLoading(false))

    setRecsLoading(true)
    fetchSocialMediaRecommendations(token)
      .then(setRecs)
      .catch(() => {})
      .finally(() => setRecsLoading(false))
  }, [token])

  const stats = useMemo(() => {
    if (posts.length === 0) return null
    const total = posts.length
    const avgEngagement = posts.reduce((s, p) => s + (p.engagementRate ?? 0), 0) / total
    const totalReferrals = posts.reduce((s, p) => s + (p.donationReferrals ?? 0), 0)
    const totalDonationValue = posts.reduce((s, p) => s + (p.estimatedDonationValuePhp ?? 0), 0)
    const topPlatform = PLATFORMS.reduce((best, p) => {
      const count = posts.filter((post) => post.platform === p).length
      return count > (posts.filter((post) => post.platform === best).length) ? p : best
    }, PLATFORMS[0])
    return { total, avgEngagement, totalReferrals, totalDonationValue, topPlatform }
  }, [posts])

  const filtered = useMemo(() => {
    let list = [...posts]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        (p.platform ?? '').toLowerCase().includes(q) ||
        (p.contentTopic ?? '').toLowerCase().includes(q) ||
        (p.postType ?? '').toLowerCase().includes(q) ||
        (p.caption ?? '').toLowerCase().includes(q),
      )
    }
    if (platformFilter !== 'all') list = list.filter((p) => p.platform === platformFilter)
    if (boostedFilter === 'boosted') list = list.filter((p) => p.isBoosted === true)
    if (boostedFilter === 'organic') list = list.filter((p) => p.isBoosted !== true)
    return list.sort((a, b) => (b.donationReferrals ?? 0) - (a.donationReferrals ?? 0))
  }, [posts, search, platformFilter, boostedFilter])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 px-4 sm:px-6 pt-6 max-w-7xl w-full space-y-6 overflow-x-auto">

          <h1 className="text-2xl font-semibold tracking-tight">Social Media</h1>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3"><TrendingUp className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                {postsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stats?.total ?? 0}</p>}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-pink-100 dark:bg-pink-900/30 p-3"><ThumbsUp className="h-5 w-5 text-pink-600 dark:text-pink-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Engagement</p>
                {postsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{stats ? `${(stats.avgEngagement * 100).toFixed(1)}%` : '—'}</p>}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3"><Share2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Donation Referrals</p>
                {postsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{fmtNum(stats?.totalReferrals)}</p>}
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6 flex items-center gap-4">
              <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-3"><MessageCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Donation Value</p>
                {postsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold">{stats ? `PHP ${fmtNum(stats.totalDonationValue)}` : '—'}</p>}
              </div>
            </CardContent></Card>
          </div>

          {/* ML Recommendations */}
          <SocialMediaRecommendationsPanel recommendations={recs} loading={recsLoading} />

          {/* Posts Analytics Table */}
          <div>
            <h2 className="text-base font-semibold mb-3">Post History</h2>

            {/* Filters */}
            <Card className="mb-4"><CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search topic, type, caption..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger><SelectValue placeholder="Platform" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={boostedFilter} onValueChange={setBoostedFilter}>
                <SelectTrigger><SelectValue placeholder="Post type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="boosted">Boosted</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                </SelectContent>
              </Select>
            </CardContent></Card>

            <Card className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    {[
                      'Platform', 'Date', 'Type', 'Media', 'Topic', 'Tone',
                      'Likes', 'Comments', 'Shares', 'Engagement', 'Referrals', 'Value (PHP)',
                    ].map((h) => (
                      <TableHead key={h} className="text-muted-foreground text-xs uppercase tracking-wide">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                        No posts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.socialMediaPostId}>
                        <TableCell className="px-4 py-3">{platformBadge(p.platform)}</TableCell>
                        <TableCell className="px-4 py-3 text-xs">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{p.postType ?? '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{p.mediaType ?? '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{p.contentTopic ?? '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{p.sentimentTone ?? '—'}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{fmtNum(p.likes)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{fmtNum(p.comments)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">{fmtNum(p.shares)}</TableCell>
                        <TableCell className="px-4 py-3 text-sm">
                          {p.engagementRate != null ? `${(p.engagementRate * 100).toFixed(1)}%` : '—'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium">
                          {fmtNum(p.donationReferrals)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm font-medium">
                          {p.estimatedDonationValuePhp != null ? fmtNum(p.estimatedDonationValuePhp) : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="h-8" />
        </div>
      </main>
    </div>
  )
}
