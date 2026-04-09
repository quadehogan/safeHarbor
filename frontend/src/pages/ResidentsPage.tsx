import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import type { Resident } from '@/types/Resident'
import { useFormValidation, requiredSelect, notFutureDate } from '@/lib/useFormValidation'
import { FieldError } from '@/components/FieldError'
import {
  fetchResidents,
  createResident,
  updateResident,
  deleteResident,
} from '@/api/ResidentsAPI'
import { toast } from 'sonner'

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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  UserCheck,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { InterventionRecommendationCard } from '@/components/residents/InterventionRecommendationCard'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 10

const STATUS_OPTIONS = ['Active', 'Closed', 'Transferred']
const RISK_OPTIONS = ['Low', 'Medium', 'High', 'Critical']
const REINTEGRATION_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'On Hold']
const CATEGORY_OPTIONS = ['Abandoned', 'Foundling', 'Surrendered', 'Neglected']
const REFERRAL_OPTIONS = ['Government Agency', 'NGO', 'Police', 'Self-Referral', 'Community', 'Court Order']
const REINTEGRATION_TYPE_OPTIONS = [
  'Family Reunification', 'Foster Care', 'Adoption (Domestic)',
  'Adoption (Inter-Country)', 'Independent Living', 'None',
]

/* ------------------------------------------------------------------ */
/*  Badge helpers                                                      */
/* ------------------------------------------------------------------ */
function statusBadgeClass(status: string | null | undefined) {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'Transferred': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

function riskBadgeClass(level: string | null | undefined) {
  switch (level) {
    case 'Low': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'Critical': return 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

function reintegrationBadgeClass(status: string | null | undefined) {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'In Progress': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
    case 'On Hold': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    case 'Not Started': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

/* ------------------------------------------------------------------ */
/*  Resident Form (Dialog)                                             */
/* ------------------------------------------------------------------ */
function ResidentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Resident>
  onSave: (data: Partial<Resident>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Resident>>(initial)
  const set = (key: keyof Resident, val: unknown) => setForm((p) => ({ ...p, [key]: val }))

  const { validate, fieldError, clearError } = useFormValidation<Partial<Resident>>({
    caseStatus: requiredSelect('case status'),
    caseCategory: requiredSelect('case category'),
    dateOfBirth: notFutureDate('Date of birth'),
    dateOfAdmission: notFutureDate('Date of admission'),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!validate(form)) return
        onSave(form)
      }}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Internal Code</Label>
          <Input value={form.internalCode ?? ''} onChange={(e) => set('internalCode', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Case Status *</Label>
          <Select value={form.caseStatus ?? ''} onValueChange={(v) => { set('caseStatus', v); clearError('caseStatus') }}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError message={fieldError('caseStatus')} />
        </div>
        <div className="space-y-1">
          <Label>Case Category *</Label>
          <Select value={form.caseCategory ?? ''} onValueChange={(v) => { set('caseCategory', v); clearError('caseCategory') }}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError message={fieldError('caseCategory')} />
        </div>
        <div className="space-y-1">
          <Label>Safehouse ID</Label>
          <Input type="number" value={form.safehouseId ?? ''} onChange={(e) => set('safehouseId', e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="space-y-1">
          <Label>Date of Birth</Label>
          <Input type="date" value={form.dateOfBirth ?? ''} onChange={(e) => { set('dateOfBirth', e.target.value || null); clearError('dateOfBirth') }} />
          <FieldError message={fieldError('dateOfBirth')} />
        </div>
        <div className="space-y-1">
          <Label>Date of Admission</Label>
          <Input type="date" value={form.dateOfAdmission ?? ''} onChange={(e) => { set('dateOfAdmission', e.target.value || null); clearError('dateOfAdmission') }} />
          <FieldError message={fieldError('dateOfAdmission')} />
        </div>
        <div className="space-y-1">
          <Label>Current Risk Level</Label>
          <Select value={form.currentRiskLevel ?? ''} onValueChange={(v) => set('currentRiskLevel', v)}>
            <SelectTrigger><SelectValue placeholder="Select risk" /></SelectTrigger>
            <SelectContent>
              {RISK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Initial Risk Level</Label>
          <Select value={form.initialRiskLevel ?? ''} onValueChange={(v) => set('initialRiskLevel', v)}>
            <SelectTrigger><SelectValue placeholder="Select risk" /></SelectTrigger>
            <SelectContent>
              {RISK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Assigned Social Worker</Label>
          <Input value={form.assignedSocialWorker ?? ''} onChange={(e) => set('assignedSocialWorker', e.target.value || null)} />
        </div>
        <div className="space-y-1">
          <Label>Referral Source</Label>
          <Select value={form.referralSource ?? ''} onValueChange={(v) => set('referralSource', v)}>
            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              {REFERRAL_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Reintegration Type</Label>
          <Select value={form.reintegrationType ?? ''} onValueChange={(v) => set('reintegrationType', v)}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {REINTEGRATION_TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Reintegration Status</Label>
          <Select value={form.reintegrationStatus ?? ''} onValueChange={(v) => set('reintegrationStatus', v)}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              {REINTEGRATION_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Initial Case Assessment</Label>
        <Textarea value={form.initialCaseAssessment ?? ''} onChange={(e) => set('initialCaseAssessment', e.target.value || null)} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export function ResidentsPage() {
  const { token, roles } = useAuth()
  const isAdmin = roles.includes('Admin')

  // Data
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [reintFilter, setReintFilter] = useState('all')

  // Pagination & sort
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: keyof Resident; asc: boolean }>({ key: 'residentId', asc: true })

  // Dialog & sheet
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Resident | null>(null)
  const [sheetResident, setSheetResident] = useState<Resident | null>(null)

  /* ---------- Fetch ---------- */
  const loadResidents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchResidents(token)
      setResidents(data)
    } catch {
      toast.error('Failed to load residents.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadResidents() }, [loadResidents])

  /* ---------- Filter + sort + paginate ---------- */
  const filtered = useMemo(() => {
    let list = [...residents]

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          (r.internalCode ?? '').toLowerCase().includes(q) ||
          (r.assignedSocialWorker ?? '').toLowerCase().includes(q) ||
          (r.caseCategory ?? '').toLowerCase().includes(q) ||
          (r.referralSource ?? '').toLowerCase().includes(q),
      )
    }

    // Filters
    if (statusFilter !== 'all') list = list.filter((r) => r.caseStatus === statusFilter)
    if (riskFilter !== 'all') list = list.filter((r) => r.currentRiskLevel === riskFilter)
    if (reintFilter !== 'all') list = list.filter((r) => r.reintegrationStatus === reintFilter)

    // Sort
    list.sort((a, b) => {
      const av = (a[sort.key] as string | number | null) ?? ''
      const bv = (b[sort.key] as string | number | null) ?? ''
      if (av < bv) return sort.asc ? -1 : 1
      if (av > bv) return sort.asc ? 1 : -1
      return 0
    })

    return list
  }, [residents, search, statusFilter, riskFilter, reintFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page when filters change
  useEffect(() => setPage(1), [search, statusFilter, riskFilter, reintFilter])

  /* ---------- Stats ---------- */
  const stats = useMemo(() => {
    const active = residents.filter((r) => r.caseStatus === 'Active').length
    const highRisk = residents.filter((r) => r.currentRiskLevel === 'High' || r.currentRiskLevel === 'Critical').length
    return { total: residents.length, active, highRisk }
  }, [residents])

  /* ---------- CRUD ---------- */
  async function handleSave(data: Partial<Resident>) {
    try {
      if (editing) {
        await updateResident(token, editing.residentId, { ...editing, ...data } as Resident)
        toast.success('Resident updated.')
      } else {
        await createResident(token, data)
        toast.success('Resident created.')
      }
      setDialogOpen(false)
      setEditing(null)
      loadResidents()
    } catch {
      toast.error('Failed to save resident.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteResident(token, id)
      toast.success('Resident deleted.')
      loadResidents()
    } catch {
      toast.error('Failed to delete resident.')
    }
  }

  function toggleSort(key: keyof Resident) {
    setSort((prev) => ({ key, asc: prev.key === key ? !prev.asc : true }))
  }

  /* ---------- Render ---------- */
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        <div className="flex-1 px-4 sm:px-6 pt-6 max-w-7xl w-full overflow-x-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Caseload Inventory</h1>
            {isAdmin && (
              <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" /> Add Resident
              </Button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Residents</p>
                  {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-xl sm:text-3xl font-bold">{stats.total}</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3"><UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-xl sm:text-3xl font-bold">{stats.active}</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3"><ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">High / Critical Risk</p>
                  {loading ? <Skeleton className="h-8 w-16" /> : <p className="text-xl sm:text-3xl font-bold">{stats.highRisk}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    aria-label="Search residents"
                    placeholder="Search code, worker, category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger><SelectValue placeholder="Risk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  {RISK_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={reintFilter} onValueChange={setReintFilter}>
                <SelectTrigger><SelectValue placeholder="Reintegration" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reintegration</SelectItem>
                  {REINTEGRATION_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  {([
                    ['internalCode', 'Code'],
                    ['presentAge', 'Age'],
                    ['caseStatus', 'Status'],
                    ['caseCategory', 'Category'],
                    ['currentRiskLevel', 'Risk'],
                    ['reintegrationStatus', 'Reintegration'],
                    ['assignedSocialWorker', 'Social Worker'],
                    ['dateOfAdmission', 'Admitted'],
                  ] as [keyof Resident, string][]).map(([key, label]) => (
                    <TableHead
                      key={key}
                      role="button"
                      aria-label={`Sort by ${label}`}
                      className="text-muted-foreground text-xs uppercase tracking-wide cursor-pointer select-none"
                      onClick={() => toggleSort(key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No residents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((r) => (
                    <TableRow
                      key={r.residentId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSheetResident(r)}
                    >
                      <TableCell className="px-4 py-3 font-medium">{r.internalCode ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">{r.presentAge ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={statusBadgeClass(r.caseStatus)}>{r.caseStatus ?? '--'}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">{r.caseCategory ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={riskBadgeClass(r.currentRiskLevel)}>{r.currentRiskLevel ?? '--'}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={reintegrationBadgeClass(r.reintegrationStatus)}>{r.reintegrationStatus ?? '--'}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">{r.assignedSocialWorker ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">{r.dateOfAdmission ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit resident"
                                onClick={() => { setEditing(r); setDialogOpen(true) }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Delete resident">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete resident?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently remove the
                                      resident record from the database.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleDelete(r.residentId)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <PaginationItem key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-muted-foreground">...</span>}
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={p === page}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>

          {/* Footer spacing */}
          <div className="h-8" />
        </div>
      </main>

      {/* ===== Create / Edit Dialog ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Resident' : 'Add Resident'}</DialogTitle>
          </DialogHeader>
          <ResidentForm
            initial={editing ?? {}}
            onSave={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ===== Detail Sheet ===== */}
      <Sheet open={!!sheetResident} onOpenChange={() => setSheetResident(null)}>
        <SheetContent className="w-full sm:w-[420px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>
              {sheetResident?.internalCode
                ? `Resident ${sheetResident.internalCode}`
                : 'Resident Detail'}
            </SheetTitle>
          </SheetHeader>

          {sheetResident && (
            <div className="space-y-4 pb-8">

              {/* ML Recommendation — top */}
              <InterventionRecommendationCard residentId={sheetResident.residentId} token={token} />

              {/* Status & Risk — quick glance row */}
              <Card>
                <CardContent className="p-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={statusBadgeClass(sheetResident.caseStatus)}>
                      {sheetResident.caseStatus ?? '—'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Risk</p>
                    <Badge className={riskBadgeClass(sheetResident.currentRiskLevel)}>
                      {sheetResident.currentRiskLevel ?? '—'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reintegration</p>
                    <Badge className={reintegrationBadgeClass(sheetResident.reintegrationStatus)}>
                      {sheetResident.reintegrationStatus ?? '—'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardContent className="p-4 space-y-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Demographics</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <InfoCell label="Age" value={sheetResident.presentAge} />
                    <InfoCell label="Sex" value={sheetResident.sex} />
                    <InfoCell label="Date of Birth" value={sheetResident.dateOfBirth} />
                    <InfoCell label="Place of Birth" value={sheetResident.placeOfBirth} />
                    <InfoCell label="Religion" value={sheetResident.religion} />
                    <InfoCell label="Safehouse ID" value={sheetResident.safehouseId?.toString()} />
                  </div>
                </CardContent>
              </Card>

              {/* Case Info */}
              <Card>
                <CardContent className="p-4 space-y-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Case Information</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <InfoCell label="Category" value={sheetResident.caseCategory} />
                    <InfoCell label="Referral Source" value={sheetResident.referralSource} />
                    <InfoCell label="Referring Agency" value={sheetResident.referringAgencyPerson} />
                    <InfoCell label="Social Worker" value={sheetResident.assignedSocialWorker} />
                    <InfoCell label="Admitted" value={sheetResident.dateOfAdmission} />
                    <InfoCell label="Age at Admission" value={sheetResident.ageUponAdmission} />
                    <InfoCell label="Length of Stay" value={sheetResident.lengthOfStay} />
                    <InfoCell label="Date Enrolled" value={sheetResident.dateEnrolled} />
                    <InfoCell label="Initial Risk" value={sheetResident.initialRiskLevel} />
                    <InfoCell label="Date Closed" value={sheetResident.dateClosed} />
                  </div>
                </CardContent>
              </Card>

              {/* Reintegration */}
              <Card>
                <CardContent className="p-4 space-y-0">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Reintegration</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <InfoCell label="Type" value={sheetResident.reintegrationType} />
                    <InfoCell label="Status" value={sheetResident.reintegrationStatus} />
                  </div>
                </CardContent>
              </Card>

              {/* Sub-categories */}
              {[
                sheetResident.subCatOrphaned,
                sheetResident.subCatTrafficked,
                sheetResident.subCatChildLabor,
                sheetResident.subCatPhysicalAbuse,
                sheetResident.subCatSexualAbuse,
                sheetResident.subCatOsaec,
                sheetResident.subCatCicl,
                sheetResident.subCatAtRisk,
                sheetResident.subCatStreetChild,
                sheetResident.subCatChildWithHiv,
              ].some(Boolean) && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sub-Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {sheetResident.subCatOrphaned && <Badge variant="outline">Orphaned</Badge>}
                      {sheetResident.subCatTrafficked && <Badge variant="outline">Trafficked</Badge>}
                      {sheetResident.subCatChildLabor && <Badge variant="outline">Child Labor</Badge>}
                      {sheetResident.subCatPhysicalAbuse && <Badge variant="outline">Physical Abuse</Badge>}
                      {sheetResident.subCatSexualAbuse && <Badge variant="outline">Sexual Abuse</Badge>}
                      {sheetResident.subCatOsaec && <Badge variant="outline">OSAEC</Badge>}
                      {sheetResident.subCatCicl && <Badge variant="outline">CICL</Badge>}
                      {sheetResident.subCatAtRisk && <Badge variant="outline">At Risk</Badge>}
                      {sheetResident.subCatStreetChild && <Badge variant="outline">Street Child</Badge>}
                      {sheetResident.subCatChildWithHiv && <Badge variant="outline">Child with HIV</Badge>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Initial Assessment */}
              {sheetResident.initialCaseAssessment && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Initial Case Assessment</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {sheetResident.initialCaseAssessment}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Restricted notes — admin only */}
              {isAdmin && sheetResident.notesRestricted && (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">Restricted Notes</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {sheetResident.notesRestricted}
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Info cell helper                                                   */
/* ------------------------------------------------------------------ */
function InfoCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}
