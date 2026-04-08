import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import type { HomeVisitation } from '@/types/HomeVisitation'
import type { InterventionPlan } from '@/types/InterventionPlan'
import type { Resident } from '@/types/Resident'
import {
  fetchHomeVisitations,
  createHomeVisitation,
  updateHomeVisitation,
  deleteHomeVisitation,
} from '@/api/HomeVisitationsAPI'
import { fetchInterventionPlans } from '@/api/InterventionPlansAPI'
import { fetchResidents } from '@/api/ResidentsAPI'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShieldAlert,
  CalendarClock,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10

const VISIT_TYPES = [
  'Initial Assessment',
  'Routine Follow-Up',
  'Reintegration Assessment',
  'Post-Placement Monitoring',
  'Emergency',
]
const COOPERATION_LEVELS = ['High', 'Moderate', 'Low', 'Uncooperative']
const OUTCOMES = ['Successful', 'Needs Work', 'Unsafe', 'Inconclusive']

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function residentLabel(v: HomeVisitation) {
  return v.resident?.internalCode ?? v.resident?.caseControlNo ?? (v.residentId ? `#${v.residentId}` : '—')
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function cooperationBadge(level: string | null | undefined) {
  switch (level?.toLowerCase()) {
    case 'high':          return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    case 'moderate':      return 'bg-amber-500/10 text-amber-600 border-amber-200'
    case 'low':           return 'bg-orange-500/10 text-orange-600 border-orange-200'
    case 'uncooperative': return 'bg-red-500/10 text-red-600 border-red-200'
    default:              return 'bg-muted text-muted-foreground border-border'
  }
}

function outcomeBadge(outcome: string | null | undefined) {
  switch (outcome?.toLowerCase()) {
    case 'successful':   return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    case 'needs work':   return 'bg-amber-500/10 text-amber-600 border-amber-200'
    case 'unsafe':       return 'bg-red-500/10 text-red-600 border-red-200'
    case 'inconclusive': return 'bg-slate-500/10 text-slate-500 border-slate-200'
    default:             return 'bg-muted text-muted-foreground border-border'
  }
}

function planStatusBadge(status: string | null | undefined) {
  switch (status?.toLowerCase()) {
    case 'active':    return 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    case 'completed': return 'bg-violet-500/10 text-violet-600 border-violet-200'
    case 'on hold':   return 'bg-amber-500/10 text-amber-600 border-amber-200'
    default:          return 'bg-muted text-muted-foreground border-border'
  }
}

function SkeletonRows({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Visit Form                                                        */
/* ------------------------------------------------------------------ */
function VisitForm({
  visit,
  residents,
  onChange,
}: {
  visit: Partial<HomeVisitation>
  residents: Resident[]
  onChange: (v: Partial<HomeVisitation>) => void
}) {
  const set = (k: string, v: unknown) => onChange({ ...visit, [k]: v })

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Resident</Label>
          <Select
            value={visit.residentId?.toString() ?? ''}
            onValueChange={(v: string) => set('residentId', Number(v))}
          >
            <SelectTrigger><SelectValue placeholder="Select resident" /></SelectTrigger>
            <SelectContent>
              {residents.map(r => (
                <SelectItem key={r.residentId} value={r.residentId.toString()}>
                  {r.internalCode ?? r.caseControlNo ?? `#${r.residentId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Visit Date</Label>
          <Input
            type="date"
            value={visit.visitDate ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('visitDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Visit Type</Label>
          <Select value={visit.visitType ?? ''} onValueChange={(v: string) => set('visitType', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Social Worker</Label>
          <Input
            value={visit.socialWorker ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('socialWorker', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Location Visited</Label>
        <Input
          value={visit.locationVisited ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('locationVisited', e.target.value)}
        />
      </div>

      <div>
        <Label>Family Members Present</Label>
        <Input
          value={visit.familyMembersPresent ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('familyMembersPresent', e.target.value)}
        />
      </div>

      <div>
        <Label>Purpose</Label>
        <Input
          value={visit.purpose ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('purpose', e.target.value)}
        />
      </div>

      <div>
        <Label>Observations</Label>
        <Textarea
          rows={3}
          value={visit.observations ?? ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('observations', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Family Cooperation Level</Label>
          <Select value={visit.familyCooperationLevel ?? ''} onValueChange={(v: string) => set('familyCooperationLevel', v)}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {COOPERATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Visit Outcome</Label>
          <Select value={visit.visitOutcome ?? ''} onValueChange={(v: string) => set('visitOutcome', v)}>
            <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
            <SelectContent>
              {OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="safety"
            checked={visit.safetyConcernsNoted ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('safetyConcernsNoted', e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary"
          />
          <Label htmlFor="safety" className="mb-0">Safety Concerns Noted</Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="followup"
            checked={visit.followUpNeeded ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('followUpNeeded', e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary"
          />
          <Label htmlFor="followup" className="mb-0">Follow-Up Needed</Label>
        </div>
      </div>

      {visit.followUpNeeded && (
        <div>
          <Label>Follow-Up Notes</Label>
          <Textarea
            rows={2}
            value={visit.followUpNotes ?? ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('followUpNotes', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export function HomeVisitationPage() {
  const { token } = useAuth()

  const [visits, setVisits] = useState<HomeVisitation[]>([])
  const [plans, setPlans] = useState<InterventionPlan[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSafety, setFilterSafety] = useState('')

  // Pagination
  const [visitPage, setVisitPage] = useState(1)

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HomeVisitation | null>(null)
  const [form, setForm] = useState<Partial<HomeVisitation>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [v, p, r] = await Promise.all([
        fetchHomeVisitations(token),
        fetchInterventionPlans(token),
        fetchResidents(token),
      ])
      setVisits(v)
      setPlans(p)
      setResidents(r)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  /* ── Filtered visits ── */
  const filtered = visits.filter(v => {
    if (search) {
      const q = search.toLowerCase()
      const match =
        (v.socialWorker?.toLowerCase().includes(q)) ||
        (v.purpose?.toLowerCase().includes(q)) ||
        (v.locationVisited?.toLowerCase().includes(q)) ||
        (residentLabel(v).toLowerCase().includes(q))
      if (!match) return false
    }
    if (filterType && v.visitType !== filterType) return false
    if (filterSafety === 'yes' && !v.safetyConcernsNoted) return false
    if (filterSafety === 'no' && v.safetyConcernsNoted) return false
    return true
  }).sort((a, b) => new Date(b.visitDate ?? 0).getTime() - new Date(a.visitDate ?? 0).getTime())

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((visitPage - 1) * PAGE_SIZE, visitPage * PAGE_SIZE)

  /* ── Case conferences ── */
  const conferences = plans
    .filter(p => p.caseConferenceDate)
    .sort((a, b) => new Date(b.caseConferenceDate!).getTime() - new Date(a.caseConferenceDate!).getTime())

  const today = new Date().toISOString().split('T')[0]
  const upcoming = conferences.filter(c => c.caseConferenceDate! >= today)
  const past = conferences.filter(c => c.caseConferenceDate! < today)

  /* ── CRUD handlers ── */
  function openCreate() {
    setEditing(null)
    setForm({})
    setDialogOpen(true)
  }

  function openEdit(v: HomeVisitation) {
    setEditing(v)
    setForm({ ...v })
    setDialogOpen(true)
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateHomeVisitation(token, editing.homeVisitationId, {
          ...editing,
          ...form,
          homeVisitationId: editing.homeVisitationId,
        } as HomeVisitation)
        toast.success('Visit updated')
      } else {
        await createHomeVisitation(token, form)
        toast.success('Visit created')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Failed to save visit')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteHomeVisitation(token, id)
      toast.success('Visit deleted')
      load()
    } catch {
      toast.error('Failed to delete visit')
    }
  }

  /* ── Stats ── */
  const safetyConcerns = visits.filter(v => v.safetyConcernsNoted).length
  const followUpsPending = visits.filter(v => v.followUpNeeded).length

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Home Visitation & Case Conferences</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {safetyConcerns > 0 && (
                  <span className="text-red-500 font-medium">{safetyConcerns} safety concern{safetyConcerns !== 1 ? 's' : ''}</span>
                )}
                {safetyConcerns > 0 && followUpsPending > 0 && ' · '}
                {followUpsPending > 0 && (
                  <span className="text-amber-500 font-medium">{followUpsPending} follow-up{followUpsPending !== 1 ? 's' : ''} pending</span>
                )}
                {safetyConcerns === 0 && followUpsPending === 0 && !loading && `${visits.length} visits recorded`}
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Log Visit
            </Button>
          </div>

          <Tabs defaultValue="visits">
            <TabsList className="mb-4">
              <TabsTrigger value="visits">Home Visits</TabsTrigger>
              <TabsTrigger value="conferences">Case Conferences</TabsTrigger>
            </TabsList>

            {/* ============== HOME VISITS TAB ============== */}
            <TabsContent value="visits" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search worker, location, resident..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setVisitPage(1) }}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={(v: string) => { setFilterType(v === 'all' ? '' : v); setVisitPage(1) }}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Visit Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterSafety} onValueChange={(v: string) => { setFilterSafety(v === 'all' ? '' : v); setVisitPage(1) }}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Safety" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="yes">Safety Concerns</SelectItem>
                      <SelectItem value="no">No Concerns</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="px-4 py-3 text-xs">Date</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Resident</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Social Worker</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Type</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Cooperation</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Safety</TableHead>
                      <TableHead className="px-4 py-3 text-xs">Outcome</TableHead>
                      <TableHead className="px-4 py-3 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <SkeletonRows rows={5} cols={8} />
                    ) : paged.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <EmptyState icon={ClipboardList} message="No home visits found." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      paged.map(v => (
                        <TableRow key={v.homeVisitationId} className="hover:bg-muted/30">
                          <TableCell className="px-4 py-3 text-sm whitespace-nowrap">{fmtDate(v.visitDate)}</TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium">{residentLabel(v)}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-muted-foreground">{v.socialWorker ?? '—'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-muted-foreground">{v.visitType ?? '—'}</TableCell>
                          <TableCell className="px-4 py-3">
                            {v.familyCooperationLevel ? (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cooperationBadge(v.familyCooperationLevel)}`}>
                                {v.familyCooperationLevel}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {v.safetyConcernsNoted ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-red-500/10 text-red-600 border-red-200 flex items-center gap-1 w-fit">
                                <ShieldAlert className="h-3 w-3" /> Yes
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">No</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {v.visitOutcome ? (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${outcomeBadge(v.visitOutcome)}`}>
                                {v.visitOutcome}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Visit</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this home visit record? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(v.homeVisitationId)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {!loading && filtered.length > PAGE_SIZE && (
                  <div className="border-t border-border px-4 py-3">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setVisitPage(p => Math.max(1, p - 1))}
                            className={visitPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm text-muted-foreground px-3">
                            Page {visitPage} of {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setVisitPage(p => Math.min(totalPages, p + 1))}
                            className={visitPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* ============== CASE CONFERENCES TAB ============== */}
            <TabsContent value="conferences" className="space-y-6">
              {/* Upcoming */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" /> Upcoming Conferences
                </h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="px-4 py-3 text-xs">Date</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Resident</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Plan Category</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Status</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Services</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows rows={3} cols={5} />
                      ) : upcoming.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No upcoming conferences scheduled.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        upcoming.map(p => (
                          <TableRow key={p.interventionPlanId} className="hover:bg-muted/30">
                            <TableCell className="px-4 py-3 text-sm whitespace-nowrap">{fmtDate(p.caseConferenceDate)}</TableCell>
                            <TableCell className="px-4 py-3 text-sm font-medium">
                              {p.resident?.internalCode ?? p.resident?.caseControlNo ?? (p.residentId ? `#${p.residentId}` : '—')}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-muted-foreground">{p.planCategory ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3">
                              {p.status ? (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${planStatusBadge(p.status)}`}>
                                  {p.status}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                              {p.servicesProvided ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Past */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Past Conferences</h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="px-4 py-3 text-xs">Date</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Resident</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Plan Category</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Status</TableHead>
                        <TableHead className="px-4 py-3 text-xs">Services</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows rows={3} cols={5} />
                      ) : past.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No past conferences recorded.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        past.map(p => (
                          <TableRow key={p.interventionPlanId} className="hover:bg-muted/30">
                            <TableCell className="px-4 py-3 text-sm whitespace-nowrap">{fmtDate(p.caseConferenceDate)}</TableCell>
                            <TableCell className="px-4 py-3 text-sm font-medium">
                              {p.resident?.internalCode ?? p.resident?.caseControlNo ?? (p.residentId ? `#${p.residentId}` : '—')}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-muted-foreground">{p.planCategory ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3">
                              {p.status ? (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${planStatusBadge(p.status)}`}>
                                  {p.status}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                              {p.servicesProvided ?? '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ============== CREATE / EDIT DIALOG ============== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Visit' : 'Log Home Visit'}</DialogTitle>
          </DialogHeader>
          <VisitForm visit={form} residents={residents} onChange={setForm} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
