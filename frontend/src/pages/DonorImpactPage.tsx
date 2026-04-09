import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DonorDonationForm } from '@/components/donations/DonorDonationForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Heart, DollarSign } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createDonation, fetchDonations } from '@/api/DonationsAPI'
import { fetchCurrentDonorSupporter } from '@/api/SupportersAPI'
import type { Donation } from '@/types/Donation'
import type { Supporter } from '@/types/Supporter'

function displayNameFromSupporter(s: Supporter): string | null {
  const display = s.displayName?.trim()
  if (display) return display
  const firstLast = [s.firstName, s.lastName].filter(Boolean).join(' ').trim()
  if (firstLast) return firstLast
  const org = s.organizationName?.trim()
  if (org) return org
  return null
}

export function DonorImpactPage() {
  const { token } = useAuth()

  const [donations, setDonations] = useState<Donation[]>([])
  const [linkedSupporter, setLinkedSupporter] = useState<Supporter | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [dons, me] = await Promise.all([
        fetchDonations(token),
        fetchCurrentDonorSupporter(token),
      ])
      setDonations(dons)
      setLinkedSupporter(me)
    } catch {
      toast.error('Failed to load your impact data.')
      setDonations([])
      setLinkedSupporter(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const totalGiven = donations.reduce(
    (sum, d) => sum + Number(d.amount ?? d.estimatedValue ?? 0),
    0,
  )
  const totalGifts = donations.length

  const donorName = useMemo(() => {
    if (linkedSupporter) {
      const n = displayNameFromSupporter(linkedSupporter)
      if (n) return n
    }
    const s = donations.find((d) => d.supporter)?.supporter
    if (!s) return null
    return displayNameFromSupporter(s)
  }, [linkedSupporter, donations])

  async function handleDonationSubmit(data: Partial<Donation>) {
    if (!token) return
    setSubmitting(true)
    try {
      await createDonation(token, data)
      toast.success('Your donation was recorded.')
      await loadData()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save donation.'
      toast.error(msg)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main id="main-content" className="flex-1 overflow-auto px-6 pb-6 pt-14 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Impact</h1>
          <span className="block text-sm text-muted-foreground mt-1">
            {loading ? (
              <Skeleton className="h-4 w-48 inline-block align-middle" />
            ) : donorName ? (
              <>
                {donorName} — your personalized giving impact dashboard
              </>
            ) : (
              <>Your personalized giving impact dashboard</>
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              icon: DollarSign,
              label: 'Total Given',
              value: loading ? '—' : `$${Math.round(totalGiven).toLocaleString()}`,
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
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Make a Donation</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full max-w-lg" />
            ) : !linkedSupporter ? (
              <p className="text-sm text-muted-foreground">
                Your login is not linked to a supporter record yet. Contact Safe Harbor if you believe this is an
                error.
              </p>
            ) : (
              <div className="max-w-lg">
                <DonorDonationForm onSubmit={handleDonationSubmit} submitting={submitting} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
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
              <p className="text-sm text-muted-foreground">No donations recorded yet.</p>
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
                              ? `$${d.amount.toLocaleString()}`
                              : d.estimatedValue != null
                                ? `~$${d.estimatedValue.toLocaleString()}`
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
    </div>
  )
}
