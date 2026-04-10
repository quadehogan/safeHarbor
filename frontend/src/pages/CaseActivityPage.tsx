import { useEffect, useState, useMemo, useCallback } from 'react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import type { ProcessRecording } from '@/types/ProcessRecording'
import { useFormValidation, required, requiredSelect, positiveNumber } from '@/lib/useFormValidation'
import { FieldError } from '@/components/FieldError'
import {
  fetchProcessRecordings,
  createProcessRecording,
  updateProcessRecording,
  deleteProcessRecording,
} from '@/api/ProcessRecordingsAPI'
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
  FileText,
  Clock,
  Flag,
  TrendingUp,
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
const SESSION_TYPES = ['Individual', 'Group']
const EMOTIONAL_STATES = ['Calm', 'Anxious', 'Sad', 'Angry', 'Hopeful', 'Withdrawn', 'Happy', 'Distressed']

/* ------------------------------------------------------------------ */
/*  Badge helpers                                                      */
/* ------------------------------------------------------------------ */
function boolBadge(val: boolean | null | undefined, trueLabel: string, falseLabel: string) {
  if (val === true)
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">{trueLabel}</Badge>
  return <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{falseLabel}</Badge>
}

/* ------------------------------------------------------------------ */
/*  Recording Form (Dialog)                                            */
/* ------------------------------------------------------------------ */
function RecordingForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<ProcessRecording>
  onSave: (data: Partial<ProcessRecording>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<ProcessRecording>>(initial)
  const set = (key: keyof ProcessRecording, val: unknown) => setForm((p) => ({ ...p, [key]: val }))

  const { validate, fieldError, clearError } = useFormValidation<Partial<ProcessRecording>>({
    residentId: (value) => {
      if (value === null || value === undefined || value === 0) return 'Resident ID is required'
      if (typeof value === 'number' && value < 0) return 'Resident ID must be a positive number'
      return ''
    },
    sessionDate: (value) => {
      if (!value || value === '') return 'Session date is required'
      if (typeof value === 'string' && new Date(value) > new Date()) return 'Session date cannot be in the future'
      return ''
    },
    socialWorker: required('Social worker'),
    sessionType: requiredSelect('session type'),
    sessionDurationMinutes: positiveNumber('Duration'),
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
          <Label>Resident ID *</Label>
          <Input type="number" value={form.residentId ?? ''} onChange={(e) => { set('residentId', e.target.value ? Number(e.target.value) : null); clearError('residentId') }} />
          <FieldError message={fieldError('residentId')} />
        </div>
        <div className="space-y-1">
          <Label>Session Date *</Label>
          <Input type="date" value={form.sessionDate ?? ''} onChange={(e) => { set('sessionDate', e.target.value || null); clearError('sessionDate') }} />
          <FieldError message={fieldError('sessionDate')} />
        </div>
        <div className="space-y-1">
          <Label>Social Worker *</Label>
          <Input value={form.socialWorker ?? ''} onChange={(e) => { set('socialWorker', e.target.value || null); clearError('socialWorker') }} />
          <FieldError message={fieldError('socialWorker')} />
        </div>
        <div className="space-y-1">
          <Label>Session Type *</Label>
          <Select value={form.sessionType ?? ''} onValueChange={(v) => { set('sessionType', v); clearError('sessionType') }}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError message={fieldError('sessionType')} />
        </div>
        <div className="space-y-1">
          <Label>Duration (minutes)</Label>
          <Input type="number" value={form.sessionDurationMinutes ?? ''} onChange={(e) => { set('sessionDurationMinutes', e.target.value ? Number(e.target.value) : null); clearError('sessionDurationMinutes') }} />
          <FieldError message={fieldError('sessionDurationMinutes')} />
        </div>
        <div className="space-y-1">
          <Label>Emotional State (Start)</Label>
          <Select value={form.emotionalStateObserved ?? ''} onValueChange={(v) => set('emotionalStateObserved', v)}>
            <SelectTrigger><SelectValue placeholder="Observed" /></SelectTrigger>
            <SelectContent>
              {EMOTIONAL_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Emotional State (End)</Label>
          <Select value={form.emotionalStateEnd ?? ''} onValueChange={(v) => set('emotionalStateEnd', v)}>
            <SelectTrigger><SelectValue placeholder="End of session" /></SelectTrigger>
            <SelectContent>
              {EMOTIONAL_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Session Narrative</Label>
        <Textarea value={form.sessionNarrative ?? ''} onChange={(e) => set('sessionNarrative', e.target.value || null)} rows={4} placeholder="Describe the session..." />
      </div>
      <div className="space-y-1">
        <Label>Interventions Applied</Label>
        <Textarea value={form.interventionsApplied ?? ''} onChange={(e) => set('interventionsApplied', e.target.value || null)} rows={2} />
      </div>
      <div className="space-y-1">
        <Label>Follow-Up Actions</Label>
        <Textarea value={form.followUpActions ?? ''} onChange={(e) => set('followUpActions', e.target.value || null)} rows={2} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.progressNoted ?? false} onChange={(e) => set('progressNoted', e.target.checked)} />
          Progress Noted
        </label>
        <label
          className="flex items-start gap-2 text-sm"
          title="Noted by the social worker for follow-up — not an incident report"
        >
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.concernsFlagged ?? false}
            onChange={(e) => set('concernsFlagged', e.target.checked)}
          />
          <span>Flag concerns for follow-up</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.referralMade ?? false} onChange={(e) => set('referralMade', e.target.checked)} />
          Referral Made
        </label>
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
export function CaseActivityPage() {
  const { token, roles } = useAuth()
  const isAdmin = roles.includes('Admin')

  const [recordings, setRecordings] = useState<ProcessRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [concernsFilter, setConcernsFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: keyof ProcessRecording; asc: boolean }>({ key: 'sessionDate', asc: false })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProcessRecording | null>(null)
  const [sheetRecord, setSheetRecord] = useState<ProcessRecording | null>(null)
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null)

  const loadRecordings = useCallback(async () => {
    setLoading(true)
    try {
      setRecordings(await fetchProcessRecordings(token))
    } catch {
      toast.error('Failed to load process recordings.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadRecordings() }, [loadRecordings])

  const filtered = useMemo(() => {
    let list = [...recordings]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((r) =>
        (r.socialWorker ?? '').toLowerCase().includes(q) ||
        String(r.residentId ?? '').includes(q))
    }
    if (typeFilter !== 'all') list = list.filter((r) => r.sessionType === typeFilter)
    if (concernsFilter === 'yes') list = list.filter((r) => r.concernsFlagged === true)
    if (concernsFilter === 'no') list = list.filter((r) => r.concernsFlagged !== true)

    list.sort((a, b) => {
      const av = (a[sort.key] as string | number | boolean | null) ?? ''
      const bv = (b[sort.key] as string | number | boolean | null) ?? ''
      if (av < bv) return sort.asc ? -1 : 1
      if (av > bv) return sort.asc ? 1 : -1
      return 0
    })
    return list
  }, [recordings, search, typeFilter, concernsFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => setPage(1), [search, typeFilter, concernsFilter])

  const stats = useMemo(() => {
    const total = recordings.length
    const avgDur = total > 0 ? Math.round(recordings.reduce((s, r) => s + (r.sessionDurationMinutes ?? 0), 0) / total) : 0
    const concerns = recordings.filter((r) => r.concernsFlagged === true).length
    const progress = recordings.filter((r) => r.progressNoted === true).length
    return { total, avgDur, concerns, progress }
  }, [recordings])

  async function handleSave(data: Partial<ProcessRecording>) {
    try {
      if (editing) {
        await updateProcessRecording(token, editing.processRecordingId, { ...editing, ...data } as ProcessRecording)
        toast.success('Recording updated.')
      } else {
        await createProcessRecording(token, data)
        toast.success('Recording created.')
      }
      setDialogOpen(false)
      setEditing(null)
      loadRecordings()
    } catch { toast.error('Failed to save recording.') }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProcessRecording(token, id)
      toast.success('Recording deleted.')
      loadRecordings()
    } catch { toast.error('Failed to delete recording.') }
  }

  function toggleSort(key: keyof ProcessRecording) {
    setSort((prev) => ({ key, asc: prev.key === key ? !prev.asc : true }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden pt-14 lg:pt-0">
        <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 w-full">
        <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 overflow-x-auto">

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Process Recording</h1>
            {isAdmin && (
              <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
                <Plus className="h-4 w-4 mr-2" /> New Session
              </Button>
            )}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="rounded-lg bg-primary/10 p-3 mb-3"><FileText className="h-5 w-5 text-primary" /></div>
                <p className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center leading-tight">Total Sessions</p>
                {loading ? <Skeleton className="h-9 w-20 mt-1" /> : <p className="text-xl sm:text-3xl font-bold mt-1"><AnimatedNumber value={stats.total} /></p>}
                <p className="text-xs text-muted-foreground mt-2 leading-snug">
                  All process recordings logged
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-3 mb-3"><Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" /></div>
                <p className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center leading-tight">Avg Session Length</p>
                {loading ? <Skeleton className="h-9 w-20 mt-1" /> : <p className="text-xl sm:text-3xl font-bold mt-1"><AnimatedNumber value={stats.avgDur} suffix="m" /></p>}
                <p className="text-xs text-muted-foreground mt-2 leading-snug">
                  Average minutes per session
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-3 mb-3"><Flag className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div>
                <p className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center leading-tight">Sessions with Flagged Concerns</p>
                {loading ? <Skeleton className="h-9 w-20 mt-1" /> : <p className="text-xl sm:text-3xl font-bold mt-1"><AnimatedNumber value={stats.concerns} /></p>}
                <p className="text-xs text-muted-foreground mt-2 leading-snug">
                  Noted by the social worker for follow-up
                </p>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-6 flex flex-col items-center text-center h-full">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 mb-3"><TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
                <p className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center leading-tight">Progress Noted</p>
                {loading ? <Skeleton className="h-9 w-20 mt-1" /> : <p className="text-xl sm:text-3xl font-bold mt-1"><AnimatedNumber value={stats.progress} /></p>}
                <p className="text-xs text-muted-foreground mt-2 leading-snug">
                  Positive outcomes recorded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6"><CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input aria-label="Search recordings" placeholder="Search worker or resident ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Session Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SESSION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={concernsFilter} onValueChange={setConcernsFilter}>
              <SelectTrigger><SelectValue placeholder="Flagged concerns" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sessions</SelectItem>
                <SelectItem value="yes">Sessions with Flagged Concerns</SelectItem>
                <SelectItem value="no">No flagged concerns</SelectItem>
              </SelectContent>
            </Select>
          </CardContent></Card>

          {/* Table */}
          <Card className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  {([
                    ['residentId', 'Resident'],
                    ['sessionDate', 'Date'],
                    ['socialWorker', 'Worker'],
                    ['sessionType', 'Type'],
                    ['sessionDurationMinutes', 'Duration'],
                    ['emotionalStateObserved', 'Start State'],
                    ['emotionalStateEnd', 'End State'],
                    ['progressNoted', 'Progress'],
                    ['concernsFlagged', 'Flagged concerns'],
                  ] as [keyof ProcessRecording, string][]).map(([key, label]) => (
                    <TableHead key={key} role="button" aria-label={`Sort by ${label}`} className="text-muted-foreground text-xs uppercase tracking-wide cursor-pointer select-none" onClick={() => toggleSort(key)}>
                      <span className="inline-flex items-center gap-1">{label}<ArrowUpDown className="h-3 w-3" /></span>
                    </TableHead>
                  ))}
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wide w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></TableCell>
                    ))}</TableRow>
                  ))
                ) : paged.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No process recordings found.</TableCell></TableRow>
                ) : (
                  paged.map((r) => (
                    <TableRow key={r.processRecordingId} className="cursor-pointer hover:bg-muted/50" onClick={() => { setSelectedResidentId(r.residentId ?? null) }}>
                      <TableCell className="px-4 py-3 font-medium">R-{r.residentId}</TableCell>
                      <TableCell className="px-4 py-3">{r.sessionDate ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">{r.socialWorker ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge className={r.sessionType === 'Individual' ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}>{r.sessionType ?? '--'}</Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">{r.sessionDurationMinutes ? `${r.sessionDurationMinutes}m` : '--'}</TableCell>
                      <TableCell className="px-4 py-3">{r.emotionalStateObserved ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">{r.emotionalStateEnd ?? '--'}</TableCell>
                      <TableCell className="px-4 py-3">{boolBadge(r.progressNoted, 'Yes', 'No')}</TableCell>
                      <TableCell className="px-4 py-3">{boolBadge(r.concernsFlagged, 'Yes', 'No')}</TableCell>
                      <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {isAdmin && (<>
                            <Button variant="ghost" size="icon" aria-label="Edit session" onClick={() => { setEditing(r); setDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Delete session"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete recording?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently remove the session recording.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(r.processRecordingId)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination><PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <PaginationItem key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 text-muted-foreground">...</span>}
                        <PaginationLink onClick={() => setPage(p)} isActive={p === page} className="cursor-pointer">{p}</PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                </PaginationContent></Pagination>
              </div>
            )}
          </Card>
          <div className="h-8" />
        </div>{/* flex-1 min-w-0 */}

        {/* Intervention recommendation sidebar */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-6">
          {selectedResidentId != null ? (
            <InterventionRecommendationCard residentId={selectedResidentId} token={token} />
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Click a session row to view the ML intervention recommendation for that resident.
            </div>
          )}
        </div>
        </div>{/* flex gap-6 */}
        </div>{/* px-4 */}
      </main>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Session' : 'New Session'}</DialogTitle></DialogHeader>
          <RecordingForm initial={editing ?? {}} onSave={handleSave} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Detail Sheet */}
      <Sheet open={!!sheetRecord} onOpenChange={() => setSheetRecord(null)}>
        <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader><SheetTitle>Session Detail</SheetTitle></SheetHeader>
          {sheetRecord && (
            <div className="mt-6 space-y-4 text-sm">
              <DetailRow label="Resident" value={`R-${sheetRecord.residentId}`} />
              <DetailRow label="Session Date" value={sheetRecord.sessionDate} />
              <DetailRow label="Social Worker" value={sheetRecord.socialWorker} />
              <DetailRow label="Session Type" value={sheetRecord.sessionType} />
              <DetailRow label="Duration" value={sheetRecord.sessionDurationMinutes ? `${sheetRecord.sessionDurationMinutes} minutes` : null} />
              <DetailRow label="State (Start)" value={sheetRecord.emotionalStateObserved} />
              <DetailRow label="State (End)" value={sheetRecord.emotionalStateEnd} />
              <DetailRow label="Progress Noted" value={sheetRecord.progressNoted ? 'Yes' : 'No'} />
              <div className="space-y-1">
                <DetailRow
                  label="Flagged for follow-up"
                  value={sheetRecord.concernsFlagged ? 'Yes' : 'No'}
                />
                <p className="text-xs text-muted-foreground">
                  Noted by the social worker for follow-up — not an incident report
                </p>
              </div>
              <DetailRow label="Referral Made" value={sheetRecord.referralMade ? 'Yes' : 'No'} />
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Session Narrative</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{sheetRecord.sessionNarrative || '--'}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Interventions Applied</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{sheetRecord.interventionsApplied || '--'}</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Follow-Up Actions</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{sheetRecord.followUpActions || '--'}</p>
              </div>
              {isAdmin && sheetRecord.notesRestricted && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Restricted Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{sheetRecord.notesRestricted}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value || '--'}</span>
    </div>
  )
}
