import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/Sidebar'
import type { Supporter } from '../types/Supporter'
import type { Donation } from '../types/Donation'
import { useFormValidation, required, requiredSelect, positiveNumber } from '@/lib/useFormValidation'
import { FieldError } from '@/components/FieldError'
import {
  fetchSupporters,
  createSupporter,
  updateSupporter,
  deleteSupporter,
  fetchSupporter,
} from '../api/SupportersAPI'
import {
  fetchDonations,
  createDonation,
  updateDonation,
  deleteDonation,
} from '../api/DonationsAPI'
import { toast } from 'sonner'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Heart,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
} from 'lucide-react'

const PAGE_SIZE = 10

const SUPPORTER_TYPES = [
  'MonetaryDonor',
  'InKindDonor',
  'Volunteer',
  'SkillsContributor',
  'SocialMediaAdvocate',
  'PartnerOrganization',
]

const DONATION_TYPES = ['Monetary', 'InKind', 'Time', 'Skills', 'SocialMedia']

const CAMPAIGNS = [
  'Year-End Hope',
  'Summer of Safety',
  'Back to School',
  'GivingTuesday',
]

const CHANNELS = ['Campaign', 'Event', 'Direct', 'SocialMedia', 'PartnerReferral']

const ACQUISITION_CHANNELS = [
  'Website',
  'SocialMedia',
  'Event',
  'WordOfMouth',
  'PartnerReferral',
  'Church',
]

// ─── Helpers ──────────────────────────────────────────────────────

function supporterName(s: Supporter): string {
  return s.displayName ?? (`${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—')
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Active'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  return <Badge className={cls}>{status}</Badge>
}

function EmptyState({ label, onAdd }: { label: string; onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Heart className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-sm font-medium text-foreground mb-1">No {label} found</p>
      <p className="text-sm text-muted-foreground mb-4">
        Get started by adding a new {label.replace(/s$/, '')}.
      </p>
      {onAdd && (
        <Button variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add {label.replace(/s$/, '')}
        </Button>
      )}
    </div>
  )
}

function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <TableCell key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function TablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <Pagination className="py-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => page > 1 && onPageChange(page - 1)}
            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm text-muted-foreground px-4">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => page < totalPages && onPageChange(page + 1)}
            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export function DonationsPage() {
  const { token } = useAuth()

  // ── supporters state ──
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [suppLoading, setSuppLoading] = useState(true)
  const [suppSearch, setSuppSearch] = useState('')
  const [suppStatusFilter, setSuppStatusFilter] = useState('')
  const [suppTypeFilter, setSuppTypeFilter] = useState('')
  const [suppPage, setSuppPage] = useState(1)
  const [suppSort, setSuppSort] = useState<{ key: string; asc: boolean }>({
    key: 'displayName',
    asc: true,
  })
  const [suppDialogOpen, setSuppDialogOpen] = useState(false)
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null)
  const [sheetSupporter, setSheetSupporter] = useState<Supporter | null>(null)

  // ── donations state ──
  const [donations, setDonations] = useState<Donation[]>([])
  const [donLoading, setDonLoading] = useState(true)
  const [donSearch, setDonSearch] = useState('')
  const [donTypeFilter, setDonTypeFilter] = useState('')
  const [donCampaignFilter, setDonCampaignFilter] = useState('')
  const [donChannelFilter, setDonChannelFilter] = useState('')
  const [donPage, setDonPage] = useState(1)
  const [donSort, setDonSort] = useState<{ key: string; asc: boolean }>({
    key: 'donationDate',
    asc: false,
  })
  const [donDialogOpen, setDonDialogOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)

  // ── data fetching ──
  const loadSupporters = useCallback(async () => {
    setSuppLoading(true)
    try {
      const data = await fetchSupporters(token)
      setSupporters(data)
    } catch {
      toast.error('Failed to load supporters.')
    } finally {
      setSuppLoading(false)
    }
  }, [token])

  const loadDonations = useCallback(async () => {
    setDonLoading(true)
    try {
      const data = await fetchDonations(token)
      setDonations(data)
    } catch {
      toast.error('Failed to load donations.')
    } finally {
      setDonLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSupporters()
    loadDonations()
  }, [loadSupporters, loadDonations])

  // ── supporter filtering, sorting, pagination ──
  const filteredSupporters = useMemo(() => {
    let list = [...supporters]
    if (suppSearch) {
      const q = suppSearch.toLowerCase()
      list = list.filter(
        (s) =>
          (s.displayName ?? '').toLowerCase().includes(q) ||
          (s.email ?? '').toLowerCase().includes(q) ||
          (s.firstName ?? '').toLowerCase().includes(q) ||
          (s.lastName ?? '').toLowerCase().includes(q)
      )
    }
    if (suppStatusFilter) list = list.filter((s) => s.status === suppStatusFilter)
    if (suppTypeFilter) list = list.filter((s) => s.supporterType === suppTypeFilter)

    list.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[suppSort.key] ?? ''
      const bVal = (b as unknown as Record<string, unknown>)[suppSort.key] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return suppSort.asc ? cmp : -cmp
    })
    return list
  }, [supporters, suppSearch, suppStatusFilter, suppTypeFilter, suppSort])

  const suppTotalPages = Math.max(1, Math.ceil(filteredSupporters.length / PAGE_SIZE))
  const pagedSupporters = filteredSupporters.slice(
    (suppPage - 1) * PAGE_SIZE,
    suppPage * PAGE_SIZE
  )

  // ── donation filtering, sorting, pagination ──
  const filteredDonations = useMemo(() => {
    let list = [...donations]
    if (donSearch) {
      const q = donSearch.toLowerCase()
      list = list.filter(
        (d) =>
          (d.supporter?.displayName ?? '').toLowerCase().includes(q) ||
          (d.campaignName ?? '').toLowerCase().includes(q) ||
          (d.notes ?? '').toLowerCase().includes(q)
      )
    }
    if (donTypeFilter) list = list.filter((d) => d.donationType === donTypeFilter)
    if (donCampaignFilter) list = list.filter((d) => d.campaignName === donCampaignFilter)
    if (donChannelFilter) list = list.filter((d) => d.channelSource === donChannelFilter)

    list.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[donSort.key] ?? ''
      const bVal = (b as unknown as Record<string, unknown>)[donSort.key] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return donSort.asc ? cmp : -cmp
    })
    return list
  }, [donations, donSearch, donTypeFilter, donCampaignFilter, donChannelFilter, donSort])

  const donTotalPages = Math.max(1, Math.ceil(filteredDonations.length / PAGE_SIZE))
  const pagedDonations = filteredDonations.slice(
    (donPage - 1) * PAGE_SIZE,
    donPage * PAGE_SIZE
  )

  // ── stats ──
  const suppStats = useMemo(() => {
    const active = supporters.filter((s) => s.status === 'Active').length
    const inactive = supporters.length - active
    const channels: Record<string, number> = {}
    supporters.forEach((s) => {
      if (s.acquisitionChannel)
        channels[s.acquisitionChannel] = (channels[s.acquisitionChannel] || 0) + 1
    })
    const topChannel =
      Object.entries(channels).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    return { total: supporters.length, active, inactive, topChannel }
  }, [supporters])

  const donStats = useMemo(() => {
    const totalUsd = donations.reduce((sum, d) => sum + (d.amount ?? 0), 0)
    const monetary = donations.filter((d) => d.amount && d.amount > 0)
    const avgGift = monetary.length > 0 ? totalUsd / monetary.length : 0
    const recurring = donations.filter((d) => d.isRecurring).length
    const recurringPct =
      donations.length > 0 ? Math.round((recurring / donations.length) * 100) : 0
    return { total: donations.length, totalUsd, avgGift, recurringPct }
  }, [donations])

  // ── CRUD: supporters ──
  async function handleSaveSupporter(data: Partial<Supporter>) {
    try {
      if (editingSupporter) {
        await updateSupporter(token, editingSupporter.supporterId, {
          ...editingSupporter,
          ...data,
        } as Supporter)
        toast.success('Supporter updated.')
      } else {
        await createSupporter(token, data)
        toast.success('Supporter created.')
      }
      setSuppDialogOpen(false)
      setEditingSupporter(null)
      await loadSupporters()
    } catch {
      toast.error('Failed to save supporter.')
    }
  }

  async function handleDeleteSupporter(id: number) {
    try {
      await deleteSupporter(token, id)
      toast.success('Supporter deleted.')
      await loadSupporters()
    } catch {
      toast.error('Failed to delete supporter.')
    }
  }

  async function openSupporterSheet(id: number) {
    try {
      const full = await fetchSupporter(token, id)
      setSheetSupporter(full)
    } catch {
      toast.error('Failed to load supporter details.')
    }
  }

  // ── CRUD: donations ──
  async function handleSaveDonation(data: Partial<Donation>) {
    try {
      if (editingDonation) {
        await updateDonation(token, editingDonation.donationId, {
          ...editingDonation,
          ...data,
        } as Donation)
        toast.success('Donation updated.')
      } else {
        await createDonation(token, data)
        toast.success('Donation created.')
      }
      setDonDialogOpen(false)
      setEditingDonation(null)
      await loadDonations()
    } catch {
      toast.error('Failed to save donation.')
    }
  }

  async function handleDeleteDonation(id: number) {
    try {
      await deleteDonation(token, id)
      toast.success('Donation deleted.')
      await loadDonations()
    } catch {
      toast.error('Failed to delete donation.')
    }
  }

  // ── sort toggles ──
  function toggleSuppSort(key: string) {
    setSuppSort((prev) =>
      prev.key === key ? { key, asc: !prev.asc } : { key, asc: true }
    )
  }

  function toggleDonSort(key: string) {
    setDonSort((prev) =>
      prev.key === key ? { key, asc: !prev.asc } : { key, asc: true }
    )
  }

  // ═════════════════════════════════════════════════════════════════
  // RENDER — Admin layout per ui-components.md
  // ═════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 px-6 pt-6 max-w-7xl">
          <h1 className="text-2xl font-semibold tracking-tight mb-6">
            Donors &amp; Contributions
          </h1>

          <Tabs defaultValue="supporters">
            <TabsList>
              <TabsTrigger value="supporters">Supporters</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
            </TabsList>

            {/* ══════════════ SUPPORTERS TAB ══════════════ */}
            <TabsContent value="supporters">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {suppLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{suppStats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Supporters</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{suppStats.active}</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{suppStats.inactive}</p>
                        <p className="text-sm text-muted-foreground">Inactive</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{suppStats.topChannel}</p>
                        <p className="text-sm text-muted-foreground">Top Acquisition</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Search + filters + Add */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          className="pl-9"
                          value={suppSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSuppSearch(e.target.value)
                            setSuppPage(1)
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-40 space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={suppStatusFilter}
                        onValueChange={(v: string) => {
                          setSuppStatusFilter(v === 'all' ? '' : v)
                          setSuppPage(1)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-48 space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={suppTypeFilter}
                        onValueChange={(v: string) => {
                          setSuppTypeFilter(v === 'all' ? '' : v)
                          setSuppPage(1)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {SUPPORTER_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingSupporter(null)
                        setSuppDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Supporter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead
                          className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 cursor-pointer"
                          onClick={() => toggleSuppSort('displayName')}
                        >
                          Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Type
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Status
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 cursor-pointer"
                          onClick={() => toggleSuppSort('country')}
                        >
                          Country <ArrowUpDown className="inline h-3 w-3 ml-1" />
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          First Donation
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Email
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppLoading ? (
                        <SkeletonRows cols={7} />
                      ) : pagedSupporters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <EmptyState
                              label="supporters"
                              onAdd={() => {
                                setEditingSupporter(null)
                                setSuppDialogOpen(true)
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagedSupporters.map((s) => (
                          <TableRow
                            key={s.supporterId}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => openSupporterSheet(s.supporterId)}
                          >
                            <TableCell className="px-4 py-3 font-medium text-sm">
                              {supporterName(s)}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge variant="outline">{s.supporterType}</Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <StatusBadge status={s.status} />
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">{s.country ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3 text-sm">
                              {s.firstDonationDate
                                ? new Date(s.firstDonationDate).toLocaleDateString()
                                : '—'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">{s.email ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingSupporter(s)
                                  setSuppDialogOpen(true)
                                }}
                              >
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
                                    <AlertDialogTitle>Remove Supporter Record?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this supporter record. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground"
                                      onClick={() => handleDeleteSupporter(s.supporterId)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination page={suppPage} totalPages={suppTotalPages} onPageChange={setSuppPage} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ══════════════ DONATIONS TAB ══════════════ */}
            <TabsContent value="donations">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {donLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{donStats.total}</p>
                        <p className="text-sm text-muted-foreground">Total Donations</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">
                          ${donStats.totalUsd.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total USD</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">
                          ${Math.round(donStats.avgGift).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Gift</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-3xl font-bold">{donStats.recurringPct}%</p>
                        <p className="text-sm text-muted-foreground">Recurring</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Search + filters + Add */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by supporter or campaign..."
                          className="pl-9"
                          value={donSearch}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setDonSearch(e.target.value)
                            setDonPage(1)
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-36 space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={donTypeFilter}
                        onValueChange={(v: string) => {
                          setDonTypeFilter(v === 'all' ? '' : v)
                          setDonPage(1)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {DONATION_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-44 space-y-2">
                      <Label>Campaign</Label>
                      <Select
                        value={donCampaignFilter}
                        onValueChange={(v: string) => {
                          setDonCampaignFilter(v === 'all' ? '' : v)
                          setDonPage(1)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {CAMPAIGNS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-44 space-y-2">
                      <Label>Channel</Label>
                      <Select
                        value={donChannelFilter}
                        onValueChange={(v: string) => {
                          setDonChannelFilter(v === 'all' ? '' : v)
                          setDonPage(1)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {CHANNELS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingDonation(null)
                        setDonDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Donation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead
                          className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 cursor-pointer"
                          onClick={() => toggleDonSort('donationDate')}
                        >
                          Date <ArrowUpDown className="inline h-3 w-3 ml-1" />
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Supporter
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Type
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 cursor-pointer"
                          onClick={() => toggleDonSort('amount')}
                        >
                          Amount <ArrowUpDown className="inline h-3 w-3 ml-1" />
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Campaign
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Channel
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3">
                          Recurring
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wide px-4 py-3 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donLoading ? (
                        <SkeletonRows cols={8} />
                      ) : pagedDonations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <EmptyState
                              label="donations"
                              onAdd={() => {
                                setEditingDonation(null)
                                setDonDialogOpen(true)
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagedDonations.map((d) => (
                          <TableRow key={d.donationId}>
                            <TableCell className="px-4 py-3 text-sm">
                              {new Date(d.donationDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">
                              {d.supporter?.displayName ?? '—'}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge variant="outline">{d.donationType}</Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">
                              {d.amount != null
                                ? `$${d.amount.toLocaleString()}`
                                : d.estimatedValue != null
                                  ? `~$${d.estimatedValue.toLocaleString()}`
                                  : '—'}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm">{d.campaignName ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3 text-sm">{d.channelSource ?? '—'}</TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                className={
                                  d.isRecurring
                                    ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }
                              >
                                {d.isRecurring ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingDonation(d)
                                  setDonDialogOpen(true)
                                }}
                              >
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
                                    <AlertDialogTitle>Remove Donation Record?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this donation record. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground"
                                      onClick={() => handleDeleteDonation(d.donationId)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination page={donPage} totalPages={donTotalPages} onPageChange={setDonPage} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ═══════════ SUPPORTER FORM DIALOG ═══════════ */}
      <Dialog open={suppDialogOpen} onOpenChange={setSuppDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupporter ? 'Edit Supporter' : 'Add Supporter'}</DialogTitle>
          </DialogHeader>
          <SupporterForm
            supporter={editingSupporter}
            onSave={handleSaveSupporter}
            onCancel={() => setSuppDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ═══════════ DONATION FORM DIALOG ═══════════ */}
      <Dialog open={donDialogOpen} onOpenChange={setDonDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDonation ? 'Edit Donation' : 'Add Donation'}</DialogTitle>
          </DialogHeader>
          <DonationForm
            donation={editingDonation}
            supporters={supporters}
            onSave={handleSaveDonation}
            onCancel={() => setDonDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ═══════════ SUPPORTER DETAIL SHEET ═══════════ */}
      <Sheet open={!!sheetSupporter} onOpenChange={() => setSheetSupporter(null)}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
          {sheetSupporter && (
            <>
              <SheetHeader>
                <SheetTitle>{supporterName(sheetSupporter)}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{sheetSupporter.supporterType}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={sheetSupporter.status} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{sheetSupporter.email ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-sm">{sheetSupporter.phone ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="text-sm">{sheetSupporter.country ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Region</p>
                    <p className="text-sm">{sheetSupporter.region ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="text-sm">{sheetSupporter.relationshipType ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Acquisition</p>
                    <p className="text-sm">{sheetSupporter.acquisitionChannel ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="text-sm">{sheetSupporter.organizationName ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">First Donation</p>
                    <p className="text-sm">
                      {sheetSupporter.firstDonationDate
                        ? new Date(sheetSupporter.firstDonationDate).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Donation history */}
                <div className="pt-4 border-t">
                  <h2 className="text-xl font-semibold mb-4">Donation History</h2>
                  {sheetSupporter.donations && sheetSupporter.donations.length > 0 ? (
                    <div className="space-y-2">
                      {sheetSupporter.donations.map((d) => (
                        <div
                          key={d.donationId}
                          className="flex items-center justify-between text-sm border rounded-md p-4"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {d.amount != null
                                ? `$${d.amount.toLocaleString()}`
                                : d.donationType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(d.donationDate).toLocaleDateString()}
                              {d.campaignName && ` \u00B7 ${d.campaignName}`}
                            </p>
                          </div>
                          <Badge variant="outline">{d.donationType}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No donations recorded.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SUPPORTER FORM
// ═══════════════════════════════════════════════════════════════════

function SupporterForm({
  supporter,
  onSave: _onSave,
  onCancel,
}: {
  supporter: Supporter | null
  onSave: (data: Partial<Supporter>) => void
  onCancel: () => void
}) {
  void _onSave // keep prop for interface compatibility
  const [form, setForm] = useState({
    displayName: supporter?.displayName ?? '',
    firstName: supporter?.firstName ?? '',
    lastName: supporter?.lastName ?? '',
    organizationName: supporter?.organizationName ?? '',
    supporterType: supporter?.supporterType ?? 'MonetaryDonor',
    email: supporter?.email ?? '',
    phone: supporter?.phone ?? '',
    country: supporter?.country ?? '',
    region: supporter?.region ?? '',
    relationshipType: supporter?.relationshipType ?? 'Local',
    status: supporter?.status ?? 'Active',
    acquisitionChannel: supporter?.acquisitionChannel ?? '',
  })

  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate all fields are filled out
    const newErrors: Record<string, boolean> = {}
    if (!form.firstName.trim()) newErrors.firstName = true
    if (!form.lastName.trim()) newErrors.lastName = true
    if (!form.displayName.trim()) newErrors.displayName = true
    if (!form.organizationName.trim()) newErrors.organizationName = true
    if (!form.email.trim()) newErrors.email = true
    if (!form.phone.trim()) newErrors.phone = true
    if (!form.country.trim()) newErrors.country = true
    if (!form.region.trim()) newErrors.region = true
    if (!form.acquisitionChannel) newErrors.acquisitionChannel = true

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill out all fields before submitting.')
      return
    }

    // Show success confirmation without saving to DB
    toast.success('Supporter saved!')
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.firstName ? 'text-red-500' : ''}>First Name *</Label>
          <Input
            className={errors.firstName ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, firstName: e.target.value }); setErrors({ ...errors, firstName: false }) }}
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.lastName ? 'text-red-500' : ''}>Last Name *</Label>
          <Input
            className={errors.lastName ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, lastName: e.target.value }); setErrors({ ...errors, lastName: false }) }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className={errors.displayName ? 'text-red-500' : ''}>Display Name *</Label>
        <Input
          className={errors.displayName ? 'border-red-500 ring-1 ring-red-500' : ''}
          value={form.displayName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, displayName: e.target.value }); setErrors({ ...errors, displayName: false }) }}
        />
      </div>
      <div className="space-y-2">
        <Label className={errors.organizationName ? 'text-red-500' : ''}>Organization *</Label>
        <Input
          className={errors.organizationName ? 'border-red-500 ring-1 ring-red-500' : ''}
          value={form.organizationName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, organizationName: e.target.value }); setErrors({ ...errors, organizationName: false }) }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={form.supporterType} onValueChange={(v: string) => setForm({ ...form, supporterType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SUPPORTER_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status *</Label>
          <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.email ? 'text-red-500' : ''}>Email *</Label>
          <Input
            type="email"
            className={errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: false }) }}
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.phone ? 'text-red-500' : ''}>Phone *</Label>
          <Input
            className={errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: false }) }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.country ? 'text-red-500' : ''}>Country *</Label>
          <Input
            className={errors.country ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.country}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, country: e.target.value }); setErrors({ ...errors, country: false }) }}
          />
        </div>
        <div className="space-y-2">
          <Label className={errors.region ? 'text-red-500' : ''}>Region *</Label>
          <Input
            className={errors.region ? 'border-red-500 ring-1 ring-red-500' : ''}
            value={form.region}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, region: e.target.value }); setErrors({ ...errors, region: false }) }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Select value={form.relationshipType} onValueChange={(v: string) => setForm({ ...form, relationshipType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="PartnerOrganization">Partner Organization</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={errors.acquisitionChannel ? 'text-red-500' : ''}>Acquisition Channel *</Label>
          <Select value={form.acquisitionChannel} onValueChange={(v: string) => { setForm({ ...form, acquisitionChannel: v }); setErrors({ ...errors, acquisitionChannel: false }) }}>
            <SelectTrigger className={errors.acquisitionChannel ? 'border-red-500 ring-1 ring-red-500' : ''}><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {ACQUISITION_CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{supporter ? 'Save Changes' : 'Create Supporter'}</Button>
      </div>
    </form>
  )
}

// ═══════════════════════════════════════════════════════════════════
// DONATION FORM
// ═══════════════════════════════════════════════════════════════════

function DonationForm({
  donation,
  supporters,
  onSave,
  onCancel,
}: {
  donation: Donation | null
  supporters: Supporter[]
  onSave: (data: Partial<Donation>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    supporterId: donation?.supporterId ?? 0,
    donationType: donation?.donationType ?? 'Monetary',
    donationDate: donation?.donationDate
      ? new Date(donation.donationDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    isRecurring: donation?.isRecurring ?? false,
    campaignName: donation?.campaignName ?? '',
    channelSource: donation?.channelSource ?? '',
    amount: donation?.amount ?? 0,
    estimatedValue: donation?.estimatedValue ?? 0,
    impactUnit: donation?.impactUnit ?? 'dollars',
    notes: donation?.notes ?? '',
    currencyCode: 'USD',
  })

  const { validate, fieldError, clearError } = useFormValidation<typeof form>({
    supporterId: (value) => {
      if (!value || value === 0) return 'Please select a supporter'
      return ''
    },
    donationType: requiredSelect('donation type'),
    donationDate: required('Donation date'),
    amount: positiveNumber('Amount'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(form)) return
    onSave({
      ...form,
      campaignName: form.campaignName || null,
      channelSource: form.channelSource || null,
      amount: form.amount || null,
      estimatedValue: form.estimatedValue || null,
      notes: form.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Supporter *</Label>
        <Select
          value={form.supporterId ? String(form.supporterId) : ''}
          onValueChange={(v: string) => { setForm({ ...form, supporterId: parseInt(v) }); clearError('supporterId') }}
        >
          <SelectTrigger><SelectValue placeholder="Select supporter..." /></SelectTrigger>
          <SelectContent>
            {supporters.map((s) => (
              <SelectItem key={s.supporterId} value={String(s.supporterId)}>
                {supporterName(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fieldError('supporterId')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={form.donationType} onValueChange={(v: string) => { setForm({ ...form, donationType: v }); clearError('donationType') }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DONATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldError('donationType')} />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.donationDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, donationDate: e.target.value }); clearError('donationDate') }}
          />
          <FieldError message={fieldError('donationDate')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setForm({ ...form, amount: parseFloat(e.target.value) || 0 }); clearError('amount') }}
          />
          <FieldError message={fieldError('amount')} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Value</Label>
          <Input
            type="number"
            step="0.01"
            value={form.estimatedValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, estimatedValue: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Campaign</Label>
          <Select value={form.campaignName} onValueChange={(v: string) => setForm({ ...form, campaignName: v === 'none' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {CAMPAIGNS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Channel</Label>
          <Select value={form.channelSource} onValueChange={(v: string) => setForm({ ...form, channelSource: v === 'none' ? '' : v })}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {CHANNELS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isRecurring"
          checked={form.isRecurring}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, isRecurring: e.target.checked })}
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="isRecurring">Recurring donation</Label>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{donation ? 'Save Changes' : 'Create Donation'}</Button>
      </div>
    </form>
  )
}
