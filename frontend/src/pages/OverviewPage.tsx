import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAnimatedCounter } from '@/lib/useAnimatedCounter'
import { staggerDelay } from '@/lib/useStaggeredFadeIn'
import {
  Users,
  Heart,
  DollarSign,
  Home,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Handshake,
  FileText,
  ClipboardList,
} from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { useAuth } from '@/context/AuthContext'
import { fetchResidents } from '@/api/ResidentsAPI'
import { fetchDonations } from '@/api/DonationsAPI'
import { fetchSupporters } from '@/api/SupportersAPI'
import type { Resident } from '@/types/Resident'
import type { Donation } from '@/types/Donation'
import type { Supporter } from '@/types/Supporter'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function riskColor(level: string | null | undefined) {
  switch (level?.toLowerCase()) {
    case 'critical': return 'bg-red-500/10 text-red-600 border-red-200'
    case 'high':     return 'bg-orange-500/10 text-orange-600 border-orange-200'
    case 'medium':   return 'bg-amber-500/10 text-amber-600 border-amber-200'
    case 'low':      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    default:         return 'bg-muted text-muted-foreground border-border'
  }
}

function statusColor(status: string | null | undefined) {
  switch (status?.toLowerCase()) {
    case 'active':       return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    case 'closed':       return 'bg-slate-500/10 text-slate-500 border-slate-200'
    case 'reintegrated': return 'bg-violet-500/10 text-violet-600 border-violet-200'
    default:             return 'bg-muted text-muted-foreground border-border'
  }
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                         */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  loading?: boolean
  iconClass?: string
}

function StatCard({ icon: Icon, label, value, sub, loading, iconClass = 'text-primary' }: StatCardProps) {
  // Extract numeric part for animation
  const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0
  const prefix = typeof value === 'string' ? (value.match(/^[^0-9]*/)?.[0] ?? '') : ''
  const animated = useAnimatedCounter(loading ? 0 : numericValue)

  return (
    <Card className="hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {loading
              ? <Skeleton className="h-8 w-20 mt-1" />
              : <p className="text-xl sm:text-3xl font-bold text-foreground mt-1">{prefix}{animated.toLocaleString()}</p>
            }
            {sub && !loading && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className={`h-5 w-5 ${iconClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export function OverviewPage() {
  const { token, email, isAdmin, isSocialWorker } = useAuth()

  const [residents, setResidents] = useState<Resident[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [r, d, s] = await Promise.all([
        fetchResidents(token),
        fetchDonations(token),
        fetchSupporters(token),
      ])
      setResidents(r)
      setDonations(d)
      setSupporters(s)
      setLastRefresh(new Date())
    } catch (e) {
      setError('Unable to load dashboard data. The backend may not be running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [token])

  /* ── Derived stats ── */
  const activeResidents = residents.filter(r => r.caseStatus?.toLowerCase() === 'active')
  const criticalResidents = residents.filter(r => r.currentRiskLevel?.toLowerCase() === 'critical')
  const highRiskResidents = residents.filter(r => r.currentRiskLevel?.toLowerCase() === 'high')

  const thisMonth = new Date()
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
    .slice(0, 6)

  const monthlyDonations = donations.filter(d => {
    if (!d.donationDate) return false
    const dt = new Date(d.donationDate)
    return dt.getMonth() === thisMonth.getMonth() && dt.getFullYear() === thisMonth.getFullYear()
  })

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount ?? d.estimatedValue ?? 0), 0)
  const monthlyRaised = monthlyDonations.reduce((sum, d) => sum + (d.amount ?? d.estimatedValue ?? 0), 0)

  const uniqueSafehouseIds = new Set(residents.map(r => r.safehouseId).filter(Boolean))

  // Resident status breakdown
  const statusCounts: Record<string, number> = {}
  residents.forEach(r => {
    const key = r.caseStatus ?? 'Unknown'
    statusCounts[key] = (statusCounts[key] ?? 0) + 1
  })

  // Risk level breakdown
  const riskCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  residents.forEach(r => {
    const k = r.currentRiskLevel
    if (k && k in riskCounts) riskCounts[k]++
  })

  const roleLabel = isAdmin ? 'Admin' : isSocialWorker ? 'Social Worker' : 'Staff'

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden pt-14 lg:pt-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              Welcome back, <span className="font-medium text-foreground">{email ?? 'Staff'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <span className="rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
              {roleLabel}
            </span>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Error banner */}
          {error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={loading ? '' : 'animate-card-in'} style={staggerDelay(0)}>
              <StatCard
                icon={Users}
                label="Active Residents"
                value={loading ? '—' : activeResidents.length}
                sub={loading ? undefined : `${residents.length} total served · ${uniqueSafehouseIds.size} homes`}
                loading={loading}
              />
            </div>
            <div className={loading ? '' : 'animate-card-in'} style={staggerDelay(1)}>
              <StatCard
                icon={AlertTriangle}
                label="High / Critical Risk"
                value={loading ? '—' : criticalResidents.length + highRiskResidents.length}
                sub={loading ? undefined : `${criticalResidents.length} critical · ${highRiskResidents.length} high`}
                loading={loading}
                iconClass="text-orange-500"
              />
            </div>
            <div className={loading ? '' : 'animate-card-in'} style={staggerDelay(2)}>
              <StatCard
                icon={DollarSign}
                label="Raised This Month"
                value={loading ? '—' : fmtCurrency(monthlyRaised)}
                sub={loading ? undefined : `${monthlyDonations.length} donations`}
                loading={loading}
              />
            </div>
            <div className={loading ? '' : 'animate-card-in'} style={staggerDelay(3)}>
              <StatCard
                icon={Heart}
                label="Total Supporters"
                value={loading ? '—' : supporters.length}
                sub={loading ? undefined : `${fmtCurrency(totalRaised)} raised overall`}
                loading={loading}
              />
            </div>
          </div>

          {/* ── Middle row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Recent Donations */}
            <Card className="lg:col-span-2 animate-card-in" style={staggerDelay(4)}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Recent Donations</CardTitle>
                <Link
                  to="/donors"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {loading ? (
                  <div className="px-6 pb-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : recentDonations.length === 0 ? (
                  <div className="px-6 pb-6 text-center text-sm text-muted-foreground py-8">
                    No donations recorded yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Date</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Supporter</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Type</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDonations.map((d, i) => (
                        <TableRow key={d.donationId} className="animate-row-in" style={staggerDelay(i, 50)}>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {fmtDate(d.donationDate)}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {d.supporter
                              ? (d.supporter.displayName ?? (`${d.supporter.firstName ?? ''} ${d.supporter.lastName ?? ''}`.trim() || '—'))
                              : `Supporter #${d.supporterId}`}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {d.donationType ?? '—'}
                            {d.isRecurring && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-primary">
                                <RefreshCw className="h-2.5 w-2.5" /> recurring
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {d.amount != null ? fmtCurrency(d.amount) : d.estimatedValue != null ? fmtCurrency(d.estimatedValue) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Resident Status Breakdown */}
            <div className="space-y-4 animate-card-in" style={staggerDelay(5)}>
              <Card className="hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Resident Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                    : Object.entries(statusCounts).length === 0
                      ? <p className="text-sm text-muted-foreground">No residents found.</p>
                      : Object.entries(statusCounts).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between py-1">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColor(status)}`}>
                              {status}
                            </span>
                            <span className="text-sm font-semibold text-foreground">{count}</span>
                          </div>
                        ))
                  }
                  {!loading && residents.length > 0 && (
                    <Link
                      to="/residents"
                      className="flex items-center gap-1 text-xs text-primary hover:underline mt-2 pt-2 border-t border-border"
                    >
                      View all residents <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Risk Level Breakdown */}
              <Card className="hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Current Risk Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                    : Object.entries(riskCounts).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between py-1">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${riskColor(level)}`}>
                            {level}
                          </span>
                          <span className="text-sm font-semibold text-foreground">{count}</span>
                        </div>
                      ))
                  }
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Bottom row: At-risk residents + Quick Actions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* High / Critical residents */}
            <Card className="lg:col-span-2 animate-card-in" style={staggerDelay(6)}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">
                  Residents Needing Attention
                </CardTitle>
                <span className="text-xs text-muted-foreground">High &amp; Critical risk only</span>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {loading ? (
                  <div className="px-6 pb-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : [...criticalResidents, ...highRiskResidents].length === 0 ? (
                  <div className="px-6 pb-6 text-center text-sm text-muted-foreground py-8">
                    No high or critical risk residents.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Case #</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Status</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Risk</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Social Worker</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Admitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...criticalResidents, ...highRiskResidents].slice(0, 8).map((r, i) => (
                        <TableRow key={r.residentId} className="animate-row-in" style={staggerDelay(i, 50)}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {r.caseControlNo ?? r.internalCode ?? `#${r.residentId}`}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor(r.caseStatus)}`}>
                              {r.caseStatus ?? '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskColor(r.currentRiskLevel)}`}>
                              {r.currentRiskLevel ?? '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.assignedSocialWorker ?? '—'}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {fmtDate(r.dateOfAdmission)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-card-in" style={staggerDelay(7)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: Users, label: 'View All Residents', to: '/residents', color: 'text-violet-500' },
                  { icon: ClipboardList, label: 'Home Visitation', to: '/home-visitation', color: 'text-teal-500' },
                  { icon: Home, label: 'Manage Safehouses', to: '/safehouses', color: 'text-blue-500' },
                  { icon: Heart, label: 'Donors & Giving', to: '/donors', color: 'text-pink-500' },
                  { icon: Handshake, label: 'Partner Organizations', to: '/partners', color: 'text-amber-500' },
                  { icon: FileText, label: 'Social Media', to: '/social-media', color: 'text-emerald-500' },
                  { icon: TrendingUp, label: 'Public Impact Page', to: '/impact', color: 'text-primary' },
                ].map(({ icon: Icon, label, to, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      {label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  )
}
