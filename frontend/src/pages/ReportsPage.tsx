import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SummaryStatRow } from '@/components/analytics/SummaryStatRow'
import { AARSummaryCard } from '@/components/reports/AARSummaryCard'
import { ResidentRiskWidget } from '@/components/reports/ResidentRiskWidget'
import { ReintegrationFunnel } from '@/components/reports/ReintegrationFunnel'
import { EducationProgressSection } from '@/components/reports/EducationProgressSection'
import { HealthOutcomesSection } from '@/components/reports/HealthOutcomesSection'
import { DonationTrendChart } from '@/components/reports/DonationTrendChart'
import { DonorChurnWidget } from '@/components/reports/DonorChurnWidget'
import { SafehouseComparisonTable } from '@/components/reports/SafehouseComparisonTable'

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Internal decision-support aligned with DSWD Annual Accomplishment Report format
            </p>
          </div>
          <div className="flex items-center gap-3">
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
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="residents">Resident Outcomes</TabsTrigger>
            <TabsTrigger value="donations">Donations & Donors</TabsTrigger>
            <TabsTrigger value="safehouses">Safehouse Performance</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            {aarData ? (
              <AARSummaryCard
                year={aarData.year}
                caring={aarData.caringCount}
                healing={aarData.healingCount}
                teaching={aarData.teachingCount}
                totalBeneficiaries={aarData.totalBeneficiaries}
                reintegrated={aarData.reintegratedCount}
                loading={loading}
              />
            ) : (
              <AARSummaryCard
                year={selectedYear}
                caring={0}
                healing={0}
                teaching={0}
                totalBeneficiaries={0}
                reintegrated={0}
                loading={loading}
              />
            )}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Key Metrics
              </p>
              <SummaryStatRow
                loading={loading}
                metrics={[
                  { label: 'Active Residents', value: activeResidents },
                  { label: 'Total Safehouses', value: totalSafehouses },
                  { label: 'Active Donors', value: totalDonors },
                  { label: 'Total Raised (PHP)', value: Math.round(totalRaised).toLocaleString() },
                ]}
              />
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

          {/* ── SAFEHOUSE PERFORMANCE ── */}
          <TabsContent value="safehouses">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Safehouse Comparison — {selectedYear}
              </h2>
              <SafehouseComparisonTable rows={safehouses} loading={loading} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
