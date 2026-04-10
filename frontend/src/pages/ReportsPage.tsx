import { useEffect, useState } from 'react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { Sidebar } from '@/components/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Heart,
  HeartPulse,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  Home,
  HandHeart,
  DollarSign,
  Download,
} from 'lucide-react'
import { ResidentRiskWidget } from '@/components/reports/ResidentRiskWidget'
import { ReintegrationFunnel } from '@/components/reports/ReintegrationFunnel'
import { EducationProgressSection } from '@/components/reports/EducationProgressSection'
import { HealthOutcomesSection } from '@/components/reports/HealthOutcomesSection'
import { DonationTrendChart } from '@/components/reports/DonationTrendChart'
import { DonorChurnWidget } from '@/components/reports/DonorChurnWidget'

import { useAuth } from '@/context/AuthContext'
import {
  fetchAARSummary,
  fetchSafehouseMetrics,
  fetchResidentRiskSummary,
  fetchDonorChurnSummary,
  type AARSummaryDto,
  type SafehouseMetricRowDto,
  type ResidentRiskSummaryDto,
  type DonorChurnSummaryDto,
} from '@/api/ReportsAPI'
import { fetchDonations } from '@/api/DonationsAPI'
import { fetchResidents } from '@/api/ResidentsAPI'
import type { Donation } from '@/types/Donation'
import type { Resident } from '@/types/Resident'

/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 */
function downloadCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          const str = val == null ? '' : String(val)
          // Escape quotes and wrap in quotes if it contains commas/quotes/newlines
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(','),
    ),
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]

export function ReportsPage() {
  const { token, isAdmin } = useAuth()
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)

  const [aarData, setAarData] = useState<AARSummaryDto | null>(null)
  const [safehouses, setSafehouses] = useState<SafehouseMetricRowDto[]>([])
  const [riskSummary, setRiskSummary] = useState<ResidentRiskSummaryDto | null>(null)
  const [churnSummary, setChurnSummary] = useState<DonorChurnSummaryDto | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const baseRequests = [
      fetchAARSummary(token, selectedYear),
      fetchSafehouseMetrics(token, selectedYear),
      fetchResidentRiskSummary(token),
      fetchDonations(token),
      fetchResidents(token),
    ] as const

    const allRequests = isAdmin
      ? [...baseRequests, fetchDonorChurnSummary(token)]
      : [...baseRequests, Promise.resolve(null)]

    Promise.allSettled(allRequests).then((results) => {
      const [aar, sf, risk, dons, res, churn] = results
      if (aar.status === 'fulfilled') setAarData(aar.value as AARSummaryDto)
      if (sf.status === 'fulfilled') setSafehouses(sf.value as SafehouseMetricRowDto[])
      if (risk.status === 'fulfilled') setRiskSummary(risk.value as ResidentRiskSummaryDto)
      if (dons.status === 'fulfilled') setDonations(dons.value as Donation[])
      if (res.status === 'fulfilled') setResidents(res.value as Resident[])
      if (churn.status === 'fulfilled' && churn.value)
        setChurnSummary(churn.value as DonorChurnSummaryDto)
      setLoading(false)
    })
  }, [token, isAdmin, selectedYear])

  // Derive overview stats from residents + safehouses
  const activeResidents = residents.filter((r) => r.caseStatus === 'Active').length
  const totalSafehouses = safehouses.length
  const totalDonors = new Set(donations.map((d) => d.supporterId)).size
  const totalRaised = donations.reduce(
    (sum, d) => sum + Number(d.amount ?? d.estimatedValue ?? 0),
    0,
  )

  // Derive reintegration funnel from residents
  const inCare = residents.filter((r) => r.caseStatus === 'Active').length
  const inFamilyReunification = residents.filter(
    (r) => r.caseStatus === 'Active' && r.reintegrationType === 'Family Reunification',
  ).length
  const inIndependentLiving = residents.filter(
    (r) => r.caseStatus === 'Active' && r.reintegrationType === 'Independent Living',
  ).length
  const reintegrated = residents.filter((r) => r.reintegrationStatus === 'Completed').length

  // Derive education metrics from safehouses monthly data
  const avgEduProgress =
    safehouses.length > 0
      ? Math.round(
          safehouses
            .filter((s) => s.avgEducationProgress != null)
            .reduce((sum, s) => sum + (s.avgEducationProgress ?? 0), 0) /
            Math.max(safehouses.filter((s) => s.avgEducationProgress != null).length, 1),
        )
      : 0

  const avgHealthScore =
    safehouses.length > 0
      ? parseFloat(
          (
            safehouses
              .filter((s) => s.avgHealthScore != null)
              .reduce((sum, s) => sum + (s.avgHealthScore ?? 0), 0) /
            Math.max(safehouses.filter((s) => s.avgHealthScore != null).length, 1)
          ).toFixed(1),
        )
      : 0

  // Export report data as CSV
  function handleExportCsv() {
    // Build a comprehensive report combining all available data
    const reportRows: Record<string, unknown>[] = []

    // AAR summary
    if (aarData) {
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Caring Count',
        value: aarData.caringCount,
        year: aarData.year,
      })
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Healing Count',
        value: aarData.healingCount,
        year: aarData.year,
      })
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Teaching Count',
        value: aarData.teachingCount,
        year: aarData.year,
      })
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Total Beneficiaries',
        value: aarData.totalBeneficiaries,
        year: aarData.year,
      })
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Reintegrated Count',
        value: aarData.reintegratedCount,
        year: aarData.year,
      })
      reportRows.push({
        section: 'AAR Summary',
        metric: 'Reintegration Rate (%)',
        value: aarData.totalBeneficiaries > 0
          ? Math.round((aarData.reintegratedCount / aarData.totalBeneficiaries) * 100)
          : 0,
        year: aarData.year,
      })
    }

    // Key metrics
    reportRows.push({ section: 'Key Metrics', metric: 'Active Residents', value: activeResidents, year: selectedYear })
    reportRows.push({ section: 'Key Metrics', metric: 'Total Safehouses', value: totalSafehouses, year: selectedYear })
    reportRows.push({ section: 'Key Metrics', metric: 'Active Donors', value: totalDonors, year: selectedYear })
    reportRows.push({ section: 'Key Metrics', metric: 'Total Raised (USD)', value: Math.round(totalRaised), year: selectedYear })
    reportRows.push({ section: 'Key Metrics', metric: 'Avg Education Progress (%)', value: avgEduProgress, year: selectedYear })
    reportRows.push({ section: 'Key Metrics', metric: 'Avg Health Score', value: avgHealthScore, year: selectedYear })

    // Safehouse metrics
    safehouses.forEach((s) => {
      reportRows.push({
        section: 'Safehouse Metrics',
        metric: s.name,
        value: s.currentOccupancy,
        year: selectedYear,
        avgEducation: s.avgEducationProgress,
        avgHealth: s.avgHealthScore,
      })
    })

    // Donation summary
    donations.forEach((d) => {
      reportRows.push({
        section: 'Donations',
        metric: d.donationType,
        value: d.amount ?? d.estimatedValue ?? 0,
        year: new Date(d.donationDate).getFullYear(),
        campaign: d.campaignName ?? '',
        channel: d.channelSource ?? '',
        recurring: d.isRecurring ? 'Yes' : 'No',
      })
    })

    downloadCsv(reportRows, `safeharbor-report-${selectedYear}.csv`)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 overflow-auto px-6 pb-6 pt-14 lg:p-8">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Internal decision-support aligned with DSWD Annual Accomplishment Report format
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportCsv} disabled={loading}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 h-auto flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="residents">Resident Outcomes</TabsTrigger>
            <TabsTrigger value="donations">Donations & Donors</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            {/* AAR Service Pillars Section */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Annual Accomplishment Report — {aarData?.year ?? selectedYear}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Aligned with Philippine DSWD AAR service pillars
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <PillarCard
                  icon={Heart}
                  label="Caring"
                  value={aarData?.caringCount ?? 0}
                  description="Residents under care"
                  accent="rose"
                  loading={loading}
                />
                <PillarCard
                  icon={HeartPulse}
                  label="Healing"
                  value={aarData?.healingCount ?? 0}
                  description="Receiving treatment"
                  accent="blue"
                  loading={loading}
                />
                <PillarCard
                  icon={BookOpen}
                  label="Teaching"
                  value={aarData?.teachingCount ?? 0}
                  description="In education programs"
                  accent="violet"
                  loading={loading}
                />
                <PillarCard
                  icon={Users}
                  label="Total Beneficiaries"
                  value={aarData?.totalBeneficiaries ?? 0}
                  description="Served this year"
                  accent="emerald"
                  loading={loading}
                />
              </div>

              {/* Reintegration highlight row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-transparent dark:border-emerald-900/40">
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reintegrated This Year
                      </p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-xl sm:text-3xl font-bold text-foreground tabular-nums">
                          <AnimatedNumber value={aarData?.reintegratedCount ?? 0} />
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-transparent dark:border-violet-900/40">
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reintegration Rate
                      </p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-xl sm:text-3xl font-bold text-foreground tabular-nums">
                          <AnimatedNumber
                            value={(aarData?.totalBeneficiaries ?? 0) > 0
                              ? Math.round(((aarData?.reintegratedCount ?? 0) / (aarData?.totalBeneficiaries ?? 1)) * 100)
                              : 0}
                          />
                          <span className="text-xl text-muted-foreground">%</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Key Metrics Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Users}
                  label="Active Residents"
                  value={String(activeResidents)}
                  accent="text-blue-500"
                  bgAccent="bg-blue-500/10"
                  loading={loading}
                />
                <MetricCard
                  icon={Home}
                  label="Total Safehouses"
                  value={String(totalSafehouses)}
                  accent="text-violet-500"
                  bgAccent="bg-violet-500/10"
                  loading={loading}
                />
                <MetricCard
                  icon={HandHeart}
                  label="Active Donors"
                  value={String(totalDonors)}
                  accent="text-rose-500"
                  bgAccent="bg-rose-500/10"
                  loading={loading}
                />
                <MetricCard
                  icon={DollarSign}
                  label="Total Raised (USD)"
                  value={`$${Math.round(totalRaised).toLocaleString()}`}
                  accent="text-emerald-500"
                  bgAccent="bg-emerald-500/10"
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── RESIDENT OUTCOMES ── */}
          <TabsContent value="residents" className="space-y-6">
            <ResidentRiskWidget data={riskSummary} loading={loading} />
            <ReintegrationFunnel
              active={inCare}
              inFamilyReunification={inFamilyReunification}
              inIndependentLiving={inIndependentLiving}
              reintegrated={reintegrated}
              loading={loading}
            />
            <EducationProgressSection
              enrollmentRate={avgEduProgress}
              attendanceRate={avgEduProgress}
              completionRate={0}
              vocationalGraduates={0}
              trendData={safehouses
                .filter((s) => s.avgEducationProgress != null)
                .map((s) => ({ month: s.name, avgProgress: s.avgEducationProgress ?? 0 }))}
              loading={loading}
            />
            <HealthOutcomesSection
              avgHealthScore={avgHealthScore}
              avgPriorHealthScore={0}
              mentalHealthFlags={0}
              trendData={safehouses
                .filter((s) => s.avgHealthScore != null)
                .map((s) => ({ month: s.name, avgScore: s.avgHealthScore ?? 0 }))}
              loading={loading}
            />
          </TabsContent>

          {/* ── DONATIONS & DONORS ── */}
          <TabsContent value="donations" className="space-y-6">
            <DonationTrendChart donations={donations} loading={loading} />
            {isAdmin && <DonorChurnWidget data={churnSummary} loading={loading} />}
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

type AccentColor = 'rose' | 'blue' | 'violet' | 'emerald'

const ACCENT_STYLES: Record<
  AccentColor,
  { iconBg: string; iconColor: string; border: string; gradient: string }
> = {
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-900/40',
    gradient: 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-transparent',
  },
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/40',
    gradient: 'bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-transparent',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-900/40',
    gradient: 'bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-900/40',
    gradient: 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-transparent',
  },
}

function PillarCard({
  icon: Icon,
  label,
  value,
  description,
  accent,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  description: string
  accent: AccentColor
  loading: boolean
}) {
  const styles = ACCENT_STYLES[accent]
  return (
    <Card className={`${styles.border} ${styles.gradient} transition-shadow hover:shadow-md`}>
      <CardContent className="py-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-10 w-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-9 w-20 mt-1" />
        ) : (
          <p className="text-xl sm:text-3xl font-bold text-foreground tabular-nums mt-1"><AnimatedNumber value={value} /></p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  bgAccent,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent: string
  bgAccent: string
  loading: boolean
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="py-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-9 w-9 rounded-lg ${bgAccent} flex items-center justify-center`}>
            <Icon className={`h-4.5 w-4.5 ${accent}`} />
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
