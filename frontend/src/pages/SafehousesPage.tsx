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
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10

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
                            {r.name ?? '—'}
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
        <SheetContent className="w-[480px] sm:w-[640px] overflow-y-auto">
          {detailLoading ? (
            <div className="space-y-4 pt-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : selectedDetail ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedDetail.name ?? 'Safehouse'}
                  <StatusBadge status={selectedDetail.status} />
                </SheetTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDetail.safehouseCode} · {[selectedDetail.city, selectedDetail.region].filter(Boolean).join(', ')}
                </p>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="residents" className="flex-1">
                    Residents ({selectedDetail.residents.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                </TabsList>

                {/* ── Overview Tab ──────────────────────────────── */}
                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div className="space-y-2 text-sm">
                    <DetailRow label="Name" value={selectedDetail.name} />
                    <DetailRow label="Code" value={selectedDetail.safehouseCode} />
                    <DetailRow label="Region" value={selectedDetail.region} />
                    <DetailRow label="City" value={selectedDetail.city} />
                    <DetailRow label="Province" value={selectedDetail.province} />
                    <DetailRow label="Country" value={selectedDetail.country} />
                    <DetailRow label="Status" value={selectedDetail.status} />
                    <DetailRow
                      label="Open Date"
                      value={selectedDetail.openDate ? new Date(selectedDetail.openDate).toLocaleDateString() : null}
                    />
                    {selectedDetail.notes && <DetailRow label="Notes" value={selectedDetail.notes} />}
                  </div>

                  {/* Occupancy */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Occupancy & Staffing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Girl Occupancy</span>
                          <span>
                            {selectedDetail.currentOccupancy ?? 0} / {selectedDetail.capacityGirls ?? 0}
                          </span>
                        </div>
                        <OccupancyBar
                          current={selectedDetail.currentOccupancy ?? 0}
                          capacity={selectedDetail.capacityGirls ?? 0}
                          tall
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Staff Capacity</span>
                        <span className="font-medium text-foreground">
                          {selectedDetail.capacityStaff ?? '—'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Residents Tab ─────────────────────────────── */}
                <TabsContent value="residents" className="pt-4">
                  {selectedDetail.residents.length === 0 ? (
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
                        {selectedDetail.residents.map((r) => (
                          <TableRow key={r.residentId}>
                            <TableCell className="font-mono text-xs">{r.internalCode ?? `#${r.residentId}`}</TableCell>
                            <TableCell>{r.presentAge ?? '—'}</TableCell>
                            <TableCell><CaseStatusBadge status={r.caseStatus} /></TableCell>
                            <TableCell><RiskBadge level={r.currentRiskLevel} /></TableCell>
                            <TableCell className="text-muted-foreground">{r.assignedSocialWorker ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* ── Activity Tab ──────────────────────────────── */}
                <TabsContent value="activity" className="space-y-6 pt-4">
                  {/* Recent Incidents */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Recent Incidents</h3>
                    {selectedDetail.recentIncidents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No incidents reported</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedDetail.recentIncidents.map((inc) => (
                          <Card key={inc.incidentReportId}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <SeverityBadge severity={inc.severity} />
                                    <span className="text-xs text-muted-foreground">
                                      {inc.incidentType ?? 'Incident'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground line-clamp-2">
                                    {inc.description ?? 'No description'}
                                  </p>
                                  {inc.responseTaken && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Response: {inc.responseTaken}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    {inc.incidentDate
                                      ? new Date(inc.incidentDate).toLocaleDateString()
                                      : '—'}
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
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Monthly Metrics */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Metrics</h3>
                    {selectedDetail.monthlyMetrics.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No monthly data available</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">Month</TableHead>
                            <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Residents</TableHead>
                            <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Incidents</TableHead>
                            <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Education</TableHead>
                            <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-center">Health</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedDetail.monthlyMetrics.slice(0, 12).map((m) => (
                            <TableRow key={m.safehouseMonthlyMetricId}>
                              <TableCell className="text-muted-foreground text-xs">
                                {m.monthStart
                                  ? new Date(m.monthStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                  : '—'}
                              </TableCell>
                              <TableCell className="text-center">{m.activeResidents ?? '—'}</TableCell>
                              <TableCell className="text-center">{m.incidentCount ?? 0}</TableCell>
                              <TableCell className="text-center">
                                {m.avgEducationProgress != null ? `${Math.round(Number(m.avgEducationProgress))}%` : '—'}
                              </TableCell>
                              <TableCell className="text-center">
                                {m.avgHealthScore != null ? `${Math.round(Number(m.avgHealthScore))}%` : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ================================================================== */
/*  Sub-components                                                     */
/* ================================================================== */

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2">
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
      <span className="text-xs text-muted-foreground w-16 text-right">
        {current}/{capacity}
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const cls =
    status === 'Active'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
      : status === 'Inactive'
        ? 'bg-red-500/10 text-red-600 border-red-500/30'
        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {status ?? '—'}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const cls =
    severity === 'Low'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
      : severity === 'Medium'
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
        : 'bg-red-500/10 text-red-600 border-red-500/30'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {severity ?? '—'}
    </span>
  )
}

function CaseStatusBadge({ status }: { status: string | null }) {
  const cls =
    status === 'Active'
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
      : status === 'Closed'
        ? 'bg-slate-500/10 text-slate-500 border-slate-500/30'
        : 'bg-blue-500/10 text-blue-600 border-blue-500/30'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {status ?? '—'}
    </span>
  )
}

function RiskBadge({ level }: { level: string | null }) {
  const cls =
    level === 'High' || level === 'Critical'
      ? 'bg-red-500/10 text-red-600 border-red-500/30'
      : level === 'Medium'
        ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {level ?? '—'}
    </span>
  )
}
