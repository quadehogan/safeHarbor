import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
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
import { Heart, DollarSign, Plus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { fetchDonations, createDonation } from '@/api/DonationsAPI'
import { fetchMySupporter } from '@/api/SupportersAPI'
import type { Donation } from '@/types/Donation'
import { toast } from 'sonner'

/* ------------------------------------------------------------------ */
/*  Constants for the donation form                                    */
/* ------------------------------------------------------------------ */
const CAMPAIGNS = ['Year-End Hope', 'Summer of Safety', 'Back to School', 'GivingTuesday']

export function DonorImpactPage() {
  const { token } = useAuth()

  const [donations, setDonations] = useState<Donation[]>([])
  const [supporterId, setSupporterId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Donation form state
  const [formOpen, setFormOpen] = useState(false)
  const [formAmount, setFormAmount] = useState('')
  const [formCampaign, setFormCampaign] = useState('')
  const [formRecurring, setFormRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function loadData() {
    if (!token) return

    Promise.allSettled([
      fetchDonations(token),
      fetchMySupporter(token),
    ]).then(([dons, supporter]) => {
      if (dons.status === 'fulfilled') setDonations(dons.value)
      if (supporter.status === 'fulfilled') setSupporterId(supporter.value.supporterId)
      setLoading(false)
    })
  }

  useEffect(() => { loadData() }, [token])

  // Derive stats from this donor's donations
  const totalGiven = donations.reduce(
    (sum, d) => sum + Number(d.amount ?? d.estimatedValue ?? 0),
    0,
  )
  const totalGifts = donations.length

  // Resolve donor display name from the first donation's supporter record
  const donorName = useMemo(() => {
    const s = donations.find((d) => d.supporter)?.supporter
    if (!s) return null
    const display = s.displayName?.trim()
    if (display) return display
    const firstLast = [s.firstName, s.lastName].filter(Boolean).join(' ').trim()
    if (firstLast) return firstLast
    const org = s.organizationName?.trim()
    if (org) return org
    return null
  }, [donations])

  // Handle fake donation submission
  async function handleDonate() {
    const amount = parseFloat(formAmount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid donation amount.')
      return
    }
    if (!supporterId) {
      toast.error('Your account is not linked to a donor record.')
      return
    }

    setSubmitting(true)
    try {
      await createDonation(token, {
        supporterId,
        donationType: 'Monetary',
        donationDate: new Date().toISOString().split('T')[0],
        amount,
        currencyCode: 'PHP',
        channelSource: 'Direct',
        campaignName: formCampaign && formCampaign !== 'none' ? formCampaign : null,
        isRecurring: formRecurring,
        impactUnit: 'pesos',
        notes: 'Submitted via donor portal',
      })
      toast.success('Thank you for your donation!')
      setFormOpen(false)
      setFormAmount('')
      setFormCampaign('')
      setFormRecurring(false)
      // Reload donations to show the new one
      setLoading(true)
      loadData()
    } catch {
      toast.error('Failed to submit donation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 overflow-auto px-6 pb-6 pt-14 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Impact</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? (
                <Skeleton className="h-4 w-48 inline-block align-middle" />
              ) : donorName ? (
                <>{donorName} — your personalized giving impact dashboard</>
              ) : (
                <>Your personalized giving impact dashboard</>
              )}
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Make a Donation
          </Button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            {
              icon: DollarSign,
              label: 'Total Given',
              value: loading ? '—' : `₱${Math.round(totalGiven).toLocaleString()}`,
            },
            {
              icon: Heart,
              label: 'Total Gifts',
              value: loading ? '—' : totalGifts,
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Donation History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24" />
                ))}
              </div>
            ) : donations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No donations recorded yet. Click "Make a Donation" above to get started!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">
                        Date
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">
                        Type
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wide">
                        Campaign
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs uppercase tracking-wide text-right">
                        Recurring
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...donations]
                      .sort(
                        (a, b) =>
                          new Date(b.donationDate).getTime() -
                          new Date(a.donationDate).getTime(),
                      )
                      .map((d) => (
                        <TableRow key={d.donationId}>
                          <TableCell className="text-sm">
                            {new Date(d.donationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {d.amount != null
                              ? `₱${d.amount.toLocaleString()}`
                              : d.estimatedValue != null
                                ? `~₱${d.estimatedValue.toLocaleString()}`
                                : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{d.donationType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">{d.campaignName ?? '—'}</TableCell>
                          <TableCell className="text-right">
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
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ============== DONATION DIALOG ============== */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Amount (PHP) *</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 500"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Campaign (optional)</Label>
              <Select value={formCampaign} onValueChange={setFormCampaign}>
                <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Campaign</SelectItem>
                  {CAMPAIGNS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formRecurring}
                onChange={(e) => setFormRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary"
              />
              <Label htmlFor="recurring" className="mb-0">Make this a recurring monthly donation</Label>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                This is a simulated donation for demonstration purposes. No real payment will be processed.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleDonate} disabled={submitting}>
                {submitting ? 'Processing...' : 'Donate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
