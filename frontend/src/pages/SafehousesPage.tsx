import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { fetchSafehouses, fetchSafehouseDetail } from '@/api/SafehousesAPI'
import { fetchSafehouseMetrics, type SafehouseMetricRowDto } from '@/api/ReportsAPI'
import type { Safehouse, SafehouseDetailDto } from '@/types/Safehouse'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Home,
  Users,
  UserCheck,
  ShieldAlert,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  BookOpen,
  HeartPulse,
  FileText,
  MapPin,
  Calendar,
  Minus,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10

/** Strip "Lighthouse" prefix from safehouse names */
const cleanName = (name: string | null | undefined) =>
  (name ?? '').replace(/^Lighthouse\s*/i, '') || '—'

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export function SafehousesPage() {
  const { token } = useAuth()

  /* ── data state ─────────────────────────────────────────────────── */
  const [safehouses, setSafehouses] = useState<Safehouse[]>([])
  const [metrics, setMetrics] = useState<SafehouseMetricRowDto[]>([])
  const [loading, setLoading] = useState(true)

  /* ── filters ────────────────────────────────────────────────────── */
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: string; asc: boolean }>({
    key: 'name',
    asc: true,
  })

  /* ── detail sheet ───────────────────────────────────────────────── */
  const [selectedDetail, setSelectedDetail] = useState<SafehouseDetailDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  /* ── load data ──────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const year = new Date().getFullYear()
      const [sh, met] = await Promise.all([
        fetchSafehouses(token),
        fetchSafehouseMetrics(token, year).catch(() => [] as SafehouseMetricRowDto[]),
      ])
      setSafehouses(sh)
      setMetrics(met)
    } catch {
      toast.error('Failed to load safehouses.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  /* ── open detail ────────────────────────────────────────────────── */
  async function openDetail(id: number) {
    setDetailLoading(true)
    setSelectedDetail(null)
    try {
      const detail = await fetchSafehouseDetail(token, id)
      setSelectedDetail(detail)
    } catch {
      toast.error('Failed to load safehouse details.')
    } finally {
      setDetailLoading(false)
    }
  }

  /* ── derived: merge safehouses + metrics ────────────────────────── */
  const metricMap = useMemo(() => {
    const map = new Map<number, SafehouseMetricRowDto>()
    metrics.forEach((m) => map.set(m.safehouseId, m))
    return map
  }, [metrics])

  type MergedRow = Safehouse & {
    totalIncidents: number
    avgEducationProgress: number | null
    reintegrationsYtd: number
  }

  const merged: MergedRow[] = useMemo(
    () =>
      safehouses.map((sh) => {
        const m = metricMap.get(sh.safehouseId)
        return {
          ...sh,
          totalIncidents: m?.totalIncidents ?? 0,
          avgEducationProgress: m?.avgEducationProgress ?? null,
          reintegrationsYtd: m?.reintegrationsYtd ?? 0,
        }
      }),
    [safehouses, metricMap],
  )

  /* ── derived: unique regions ────────────────────────────────────── */
  const regions = useMemo(
    () => [...new Set(safehouses.map((s) => s.region).filter(Boolean))] as string[],
    [safehouses],
  )

  /* ── filter + sort + paginate ───────────────────────────────────── */
  const filtered = useMemo(() => {
    let rows = [...merged]

    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.safehouseCode?.toLowerCase().includes(q) ||
          r.city?.toLowerCase().includes(q) ||
          r.region?.toLowerCase().includes(q),
      )
    }
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter)
    if (regionFilter !== 'all') rows = rows.filter((r) => r.region === regionFilter)

    rows.sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sort.key]
      const vb = (b as unknown as Record<string, unknown>)[sort.key]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number')
        return sort.asc ? va - vb : vb - va
      return sort.asc
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })

    return rows
  }, [merged, search, statusFilter, regionFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: string) {
    setSort((prev) => (prev.key === key ? { key, asc: !prev.asc } : { key, asc: true }))
    setPage(1)
  }

  /* ── stat card helpers ──────────────────────────────────────────── */
  const totalCapacity = safehouses.reduce((s, h) => s + (h.capacityGirls ?? 0), 0)
  const totalOccupancy = safehouses.reduce((s, h) => s + (h.currentOccupancy ?? 0), 0)
  const totalIncidents = metrics.reduce((s, m) => s + (m.totalIncidents ?? 0), 0)
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0

  const stats = [
    { label: 'Total Safehouses', value: safehouses.length, icon: Home, color: 'text-primary' },
    { label: 'Total Capacity', value: totalCapacity, sub: 'girls', icon: Users, color: 'text-blue-500' },
    { label: 'Current Occupancy', value: totalOccupancy, sub: `${occupancyPct}% filled`, icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Incidents YTD', value: totalIncidents, icon: ShieldAlert, color: 'text-amber-500' },
  ]

  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-background p-6 lg:p-10 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Safehouses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of all safe homes, capacity, and activity
            </p>
          </div>

          {/* ── Stat cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) =>
              loading ? (
                <Skeleton key={s.label} className="h-24 rounded-xl" />
              ) : (
                <Card key={s.label}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2.5">
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.label}
                          {s.sub && <span className="ml-1 text-muted-foreground/70">· {s.sub}</span>}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>

          {/* ── Filters ─────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-5 pb-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, city, or region…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Under Renovation">Under Renovation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1) }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* ── Table ───────────────────────────────────────────── */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Home className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No safehouses match your filters.</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        {([
                          ['safehouseCode', 'Code'],
                          ['name', 'Name'],
                          ['city', 'Location'],
                          ['status', 'Status'],
                          ['capacityGirls', 'Capacity'],
                          ['currentOccupancy', 'Occupancy'],
                          ['totalIncidents', 'Incidents YTD'],
                          ['avgEducationProgress', 'Avg Education'],
                        ] as [string, string][]).map(([key, label]) => (
                          <TableHead
                            key={key}
                            className="text-muted-foreground text-xs uppercase tracking-wide cursor-pointer select-none"
                            onClick={() => toggleSort(key)}
                          >
                            <span className="inline-flex items-center gap-1">
                              {label}
                              {sort.key === key &&
                                (sort.asc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageRows.map((r) => (
                        <TableRow
                          key={r.safehouseId}
                          className="cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => openDetail(r.safehouseId)}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {r.safehouseCode ?? `#${r.safehouseId}`}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {cleanName(r.name)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {[r.city, r.region].filter(Boolean).join(', ') || '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={r.status} />
                          </TableCell>
                          <TableCell className="text-center">{r.capacityGirls ?? '—'}</TableCell>
                          <TableCell>
                            <OccupancyBar current={r.currentOccupancy ?? 0} capacity={r.capacityGirls ?? 0} />
                          </TableCell>
                          <TableCell className="text-center">{r.totalIncidents}</TableCell>
                          <TableCell className="text-center">
                            {r.avgEducationProgress != null
                              ? `${Math.round(r.avgEducationProgress)}%`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
                      {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground px-2">
                        {page} / {totalPages}
                      </span>
                      <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── Detail Sheet ────────────────────────────────────────── */}
      <Sheet open={!!selectedDetail || detailLoading} onOpenChange={() => setSelectedDetail(null)}>
        <SheetContent className="w-[92vw] sm:w-[38vw] sm:min-w-[520px] overflow-y-auto px-8">
          {detailLoading ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-3 gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : selectedDetail ? (
            <SafehouseDetailReport detail={selectedDetail} />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ================================================================== */
/*  Safehouse Detail Report                                            */
/* ================================================================== */
function SafehouseDetailReport({ detail: d }: { detail: SafehouseDetailDto }) {
  const m = d.monthlyMetrics
  const latest = m[0]
  const prev = m[1]

  /* ── Derived KPIs ───────────────────────────────────────────────── */
  const occupancyPct = (d.capacityGirls ?? 0) > 0
    ? Math.round(((d.currentOccupancy ?? 0) / d.capacityGirls!) * 100)
    : 0

  const activeResidents = d.residents.filter(r => r.caseStatus === 'Active').length
  const highRisk = d.residents.filter(r => r.currentRiskLevel === 'High' || r.currentRiskLevel === 'Critical').length
  const resolvedIncidents = d.recentIncidents.filter(i => i.resolved).length
  const unresolvedIncidents = d.recentIncidents.filter(i => !i.resolved).length

  const avgEdu = latest?.avgEducationProgress != null ? Number(latest.avgEducationProgress) : null
  const prevEdu = prev?.avgEducationProgress != null ? Number(prev.avgEducationProgress) : null
  const eduDelta = avgEdu != null && prevEdu != null ? avgEdu - prevEdu : null

  const avgHealth = latest?.avgHealthScore != null ? Number(latest.avgHealthScore) : null
  const prevHealth = prev?.avgHealthScore != null ? Number(prev.avgHealthScore) : null
  const healthDelta = avgHealth != null && prevHealth != null ? avgHealth - prevHealth : null

  const totalVisits = m.reduce((s, x) => s + (x.homeVisitationCount ?? 0), 0)
  const totalRecordings = m.reduce((s, x) => s + (x.processRecordingCount ?? 0), 0)
  const totalIncidentsAll = m.reduce((s, x) => s + (x.incidentCount ?? 0), 0)

  /* ── Risk distribution ──────────────────────────────────────────── */
  const riskCounts = { Low: 0, Medium: 0, High: 0, Critical: 0, Unknown: 0 }
  d.residents.forEach(r => {
    const lev = r.currentRiskLevel as keyof typeof riskCounts
    if (lev && lev in riskCounts) riskCounts[lev]++
    else riskCounts.Unknown++
  })

  /* ── Social worker caseload ─────────────────────────────────────── */
  const workerMap = new Map<string, number>()
  d.residents.forEach(r => {
    const w = r.assignedSocialWorker ?? 'Unassigned'
    workerMap.set(w, (workerMap.get(w) ?? 0) + 1)
  })
  const workerLoad = [...workerMap.entries()].sort((a, b) => b[1] - a[1])

  /* ── Incident type breakdown ────────────────────────────────────── */
  const incTypeMap = new Map<string, number>()
  d.recentIncidents.forEach(i => {
    const t = i.incidentType ?? 'Other'
    incTypeMap.set(t, (incTypeMap.get(t) ?? 0) + 1)
  })
  const incTypes = [...incTypeMap.entries()].sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-5">
      <SheetHeader className="pb-4 border-b">
        <SheetTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </div>
          {cleanName(d.name)}
          <StatusBadge status={d.status} />
        </SheetTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{[d.city, d.province, d.region].filter(Boolean).join(', ') || '—'}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{d.openDate ? `Since ${new Date(d.openDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : '—'}</span>
        </div>
      </SheetHeader>

      <Tabs defaultValue="performance" className="mt-2">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="residents">Residents ({d.residents.length})</TabsTrigger>
          <TabsTrigger value="incidents">Incidents ({d.recentIncidents.length})</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* ══════════ PERFORMANCE TAB ══════════ */}
        <TabsContent value="performance" className="space-y-5 pt-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <MiniKPI icon={Users} color="text-primary" label="Occupancy" value={`${d.currentOccupancy ?? 0}/${d.capacityGirls ?? 0}`} sub={`${occupancyPct}% filled`} />
            <MiniKPI icon={UserCheck} color="text-blue-500" label="Staff Capacity" value={String(d.capacityStaff ?? '—')} sub="positions" />
            <MiniKPI icon={ShieldAlert} color={unresolvedIncidents > 0 ? 'text-red-500' : 'text-emerald-500'} label="Open Incidents" value={String(unresolvedIncidents)} sub={`${resolvedIncidents} resolved`} />
          </div>

          {/* Occupancy Bar */}
          <Card>
            <CardContent className="pt-4 pb-3 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Girl Occupancy</span>
                <span className={occupancyPct >= 90 ? 'text-red-500 font-medium' : ''}>
                  {occupancyPct}%
                </span>
              </div>
              <OccupancyBar current={d.currentOccupancy ?? 0} capacity={d.capacityGirls ?? 0} tall />
            </CardContent>
          </Card>

          {/* Education & Health Scores */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Education</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {avgEdu != null ? `${Math.round(avgEdu)}%` : '—'}
                  </span>
                  <TrendIndicator delta={eduDelta} />
                </div>
                <ProgressBar pct={avgEdu ?? 0} color="bg-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Health</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {avgHealth != null ? `${Math.round(avgHealth)} / 5` : '—'}
                  </span>
                  <TrendIndicator delta={healthDelta} />
                </div>
                <ProgressBar pct={avgHealth != null ? (avgHealth / 5) * 100 : 0} color="bg-rose-500" />
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" /> Activity Summary (All Time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">{totalVisits}</p>
                  <p className="text-xs text-muted-foreground">Home Visits</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{totalRecordings}</p>
                  <p className="text-xs text-muted-foreground">Process Recordings</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{totalIncidentsAll}</p>
                  <p className="text-xs text-muted-foreground">Total Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Worker Caseload */}
          {workerLoad.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Staff Caseload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workerLoad.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (count / (d.capacityStaff || 10)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                        {count} {count === 1 ? 'case' : 'cases'}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Location & Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <DetailRow label="Code" value={d.safehouseCode} />
              <DetailRow label="Region" value={d.region} />
              <DetailRow label="City" value={d.city} />
              <DetailRow label="Province" value={d.province} />
              <DetailRow label="Country" value={d.country} />
              <DetailRow label="Opened" value={d.openDate ? new Date(d.openDate).toLocaleDateString() : null} />
              {d.notes && <DetailRow label="Notes" value={d.notes} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════ RESIDENTS TAB ══════════ */}
        <TabsContent value="residents" className="space-y-4 pt-4">
          {/* Risk Distribution */}
          {d.residents.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map(lev => (
                    <div key={lev}>
                      <p className={`text-lg font-bold ${lev === 'Critical' ? 'text-red-600' : lev === 'High' ? 'text-red-500' : lev === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {riskCounts[lev]}
                      </p>
                      <p className="text-xs text-muted-foreground">{lev}</p>
                    </div>
                  ))}
                </div>
                {/* Visual bar */}
                <div className="flex rounded-full overflow-hidden h-2.5 mt-3">
                  {d.residents.length > 0 && (
                    <>
                      <div className="bg-emerald-500 transition-all" style={{ width: `${(riskCounts.Low / d.residents.length) * 100}%` }} />
                      <div className="bg-amber-500 transition-all" style={{ width: `${(riskCounts.Medium / d.residents.length) * 100}%` }} />
                      <div className="bg-red-400 transition-all" style={{ width: `${(riskCounts.High / d.residents.length) * 100}%` }} />
                      <div className="bg-red-600 transition-all" style={{ width: `${(riskCounts.Critical / d.residents.length) * 100}%` }} />
                      <div className="bg-slate-300 transition-all" style={{ width: `${(riskCounts.Unknown / d.residents.length) * 100}%` }} />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary row */}
          <div className="flex items-center justify-between text-sm px-1">
            <span className="text-muted-foreground">{d.residents.length} residents · {activeResidents} active · {highRisk} high/critical risk</span>
          </div>

          {d.residents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No residents currently assigned</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Code</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Age</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Risk</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Social Worker</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.residents.map((r) => (
                  <TableRow key={r.residentId}>
                    <TableCell className="font-mono text-xs">{r.internalCode ?? `#${r.residentId}`}</TableCell>
                    <TableCell>{r.presentAge ?? '—'}</TableCell>
                    <TableCell><CaseStatusBadge status={r.caseStatus} /></TableCell>
                    <TableCell><RiskBadge level={r.currentRiskLevel} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{r.assignedSocialWorker ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* ══════════ INCIDENTS TAB ══════════ */}
        <TabsContent value="incidents" className="space-y-4 pt-4">
          {/* Incident Summary */}
          {d.recentIncidents.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <MiniKPI icon={FileText} color="text-muted-foreground" label="Total" value={String(d.recentIncidents.length)} sub="recent" />
                <MiniKPI icon={CheckCircle2} color="text-emerald-500" label="Resolved" value={String(resolvedIncidents)} sub={d.recentIncidents.length > 0 ? `${Math.round((resolvedIncidents / d.recentIncidents.length) * 100)}%` : '—'} />
                <MiniKPI icon={AlertTriangle} color="text-red-500" label="Unresolved" value={String(unresolvedIncidents)} sub={d.recentIncidents.filter(i => i.followUpRequired).length > 0 ? `${d.recentIncidents.filter(i => i.followUpRequired).length} need follow-up` : 'none pending'} />
              </div>

              {/* Type Breakdown */}
              {incTypes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">By Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {incTypes.map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-amber-500 transition-all"
                              style={{ width: `${(count / d.recentIncidents.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-6 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Incident List */}
          {d.recentIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShieldAlert className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No incidents reported</p>
            </div>
          ) : (
            <div className="space-y-2">
              {d.recentIncidents.map((inc) => (
                <Card key={inc.incidentReportId}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={inc.severity} />
                          <span className="text-xs font-medium text-foreground">{inc.incidentType ?? 'Incident'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {inc.description ?? 'No description provided'}
                        </p>
                        {inc.responseTaken && (
                          <p className="text-xs text-muted-foreground mt-1.5 border-l-2 border-primary/30 pl-2">
                            <span className="font-medium">Response:</span> {inc.responseTaken}
                          </p>
                        )}
                        {inc.reportedBy && (
                          <p className="text-xs text-muted-foreground/70 mt-1">Reported by: {inc.reportedBy}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {inc.incidentDate ? new Date(inc.incidentDate).toLocaleDateString() : '—'}
                        </p>
                        {inc.resolved ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </span>
                        ) : inc.followUpRequired ? (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                            <Clock className="h-3 w-3" /> Follow-up
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
                            <AlertTriangle className="h-3 w-3" /> Open
                          </span>
                        )}
                        {inc.resolutionDate && (
                          <p className="text-[10px] text-muted-foreground/60">
                            Closed {new Date(inc.resolutionDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══════════ TRENDS TAB ══════════ */}
        <TabsContent value="trends" className="space-y-4 pt-4">
          {m.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No monthly data available yet</p>
            </div>
          ) : (
            <>
              {/* Sparkline-style visual bars for each month */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Residents Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-24">
                    {[...m].reverse().slice(-12).map((month, i) => {
                      const val = month.activeResidents ?? 0
                      const max = Math.max(...m.map(x => x.activeResidents ?? 0), 1)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-primary/70 hover:bg-primary transition-colors"
                            style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? 4 : 0 }}
                            title={`${month.monthStart ? new Date(month.monthStart).toLocaleDateString('en-US', { month: 'short' }) : ''}: ${val}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[...m].reverse().slice(-12).map((month, i) => (
                      <span key={i} className="flex-1 text-[9px] text-muted-foreground/60 text-center truncate">
                        {month.monthStart ? new Date(month.monthStart).toLocaleDateString('en-US', { month: 'narrow' }) : ''}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Incidents Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-20">
                    {[...m].reverse().slice(-12).map((month, i) => {
                      const val = month.incidentCount ?? 0
                      const max = Math.max(...m.map(x => x.incidentCount ?? 0), 1)
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-amber-500/70 hover:bg-amber-500 transition-colors"
                            style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? 4 : 0 }}
                            title={`${month.monthStart ? new Date(month.monthStart).toLocaleDateString('en-US', { month: 'short' }) : ''}: ${val}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {[...m].reverse().slice(-12).map((month, i) => (
                      <span key={i} className="flex-1 text-[9px] text-muted-foreground/60 text-center truncate">
                        {month.monthStart ? new Date(month.monthStart).toLocaleDateString('en-US', { month: 'narrow' }) : ''}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Full Monthly Data Table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Month</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Residents</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Incidents</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Visits</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Education</TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Health</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {m.slice(0, 12).map((row) => (
                        <TableRow key={row.safehouseMonthlyMetricId}>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.monthStart ? new Date(row.monthStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell className="text-center text-xs">{row.activeResidents ?? '—'}</TableCell>
                          <TableCell className="text-center text-xs">{row.incidentCount ?? 0}</TableCell>
                          <TableCell className="text-center text-xs">{row.homeVisitationCount ?? 0}</TableCell>
                          <TableCell className="text-center text-xs">
                            {row.avgEducationProgress != null ? `${Math.round(Number(row.avgEducationProgress))}%` : '—'}
                          </TableCell>
                          <TableCell className="text-center text-xs">
                            {row.avgHealthScore != null ? `${Math.round(Number(row.avgHealthScore))} / 5` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ================================================================== */
/*  Shared sub-components                                              */
/* ================================================================== */

function MiniKPI({ icon: Icon, color, label, value, sub }: {
  icon: React.ElementType; color: string; label: string; value: string; sub?: string
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-2.5 px-3">
        <Icon className={`h-4 w-4 ${color} mb-1.5`} />
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function TrendIndicator({ delta }: { delta: number | null }) {
  if (delta == null) return null
  if (Math.abs(delta) < 0.5) return <span className="inline-flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3" /></span>
  return delta > 0 ? (
    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600">
      <TrendingUp className="h-3 w-3" /> +{delta.toFixed(1)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
      <TrendingDown className="h-3 w-3" /> {delta.toFixed(1)}
    </span>
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-muted mt-2">
      <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${Math.min(100, Math.round(pct))}%` }} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || '—'}</span>
    </div>
  )
}

function OccupancyBar({ current, capacity, tall }: { current: number; capacity: number; tall?: boolean }) {
  const pct = capacity > 0 ? Math.min(100, Math.round((current / capacity) * 100)) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 rounded-full bg-muted ${tall ? 'h-3' : 'h-2'}`}>
        <div className={`${color} rounded-full ${tall ? 'h-3' : 'h-2'} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right">{current}/{capacity}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const cls = status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
    : status === 'Inactive' ? 'bg-red-500/10 text-red-600 border-red-500/30'
    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{status ?? '—'}</span>
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const cls = severity === 'Low' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
    : severity === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
    : 'bg-red-500/10 text-red-600 border-red-500/30'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{severity ?? '—'}</span>
}

function CaseStatusBadge({ status }: { status: string | null }) {
  const cls = status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
    : status === 'Closed' ? 'bg-slate-500/10 text-slate-500 border-slate-500/30'
    : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{status ?? '—'}</span>
}

function RiskBadge({ level }: { level: string | null }) {
  const cls = level === 'High' || level === 'Critical' ? 'bg-red-500/10 text-red-600 border-red-500/30'
    : level === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>{level ?? '—'}</span>
}
