import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, DollarSign, TrendingUp, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PersonalizedStatementCard } from '@/components/impact/PersonalizedStatementCard'
import {
  fetchDonorImpactStatements,
  fetchProgramImpactSummary,
  type DonorImpactStatementDto,
  type ProgramImpactSummaryDto,
} from '@/api/ImpactAPI'
import { fetchDonations } from '@/api/DonationsAPI'
import type { Donation } from '@/types/Donation'

export function DonorImpactPage() {
  const { token, email } = useAuth()

  const [statements, setStatements] = useState<DonorImpactStatementDto[]>([])
  const [programs, setPrograms] = useState<ProgramImpactSummaryDto[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    Promise.allSettled([
      fetchDonorImpactStatements(token),
      fetchProgramImpactSummary(),
      fetchDonations(token),
    ]).then(([stmts, progs, dons]) => {
      if (stmts.status === 'fulfilled') setStatements(stmts.value)
      else setError('Could not load your impact data. Your account may not be linked to a donor record yet.')
      if (progs.status === 'fulfilled') setPrograms(progs.value)
      if (dons.status === 'fulfilled') setDonations(dons.value)
      setLoading(false)
    })
  }, [token])

  // Derive stats from this donor's donations
  const totalGiven = donations.reduce(
    (sum, d) => sum + Number(d.amount ?? d.estimatedValue ?? 0),
    0,
  )
  const totalGifts = donations.length
  const programAreas = [...new Set(statements.map((s) => s.programArea))]
  const highestImpact = statements.length
    ? statements.reduce((best, s) =>
        s.estimatedPctChange > best.estimatedPctChange ? s : best,
      )
    : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Impact</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {email} — your personalized giving impact dashboard
          </p>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: DollarSign,
              label: 'Total Given',
              value: loading ? '—' : `PHP ${Math.round(totalGiven).toLocaleString()}`,
            },
            {
              icon: Heart,
              label: 'Total Gifts',
              value: loading ? '—' : totalGifts,
            },
            {
              icon: Sparkles,
              label: 'Program Areas',
              value: loading ? '—' : programAreas.length || '—',
            },
            {
              icon: TrendingUp,
              label: 'Biggest Impact',
              value: loading
                ? '—'
                : highestImpact
                ? `+${highestImpact.estimatedPctChange.toFixed(1)}%`
                : '—',
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personalized impact statements */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Your Impact Statements</h2>
            <p className="text-sm text-muted-foreground -mt-2">
              Based on your donation allocations and statistical analysis of resident outcomes.
            </p>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : statements.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <p className="text-sm text-muted-foreground">
                  Your impact is being tracked. Personalized results will appear here as our data
                  grows — thank you for your continued support.
                </p>
              </div>
            ) : (
              statements.map((s) => (
                <PersonalizedStatementCard
                  key={s.statementId}
                  statementText={s.statementText}
                  programArea={s.programArea}
                  allocationAmount={s.allocationAmount}
                  estimatedPctChange={s.estimatedPctChange}
                  timeWindowMonths={s.timeWindowMonths}
                  generatedAt={s.generatedAt}
                />
              ))
            )}
          </div>

          {/* Sidebar: program breakdown + org-wide context */}
          <div className="space-y-4">
            {/* Your program areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Your Program Areas</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                  </div>
                ) : programAreas.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No allocations recorded yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {programAreas.map((area) => (
                      <Badge key={area} className="bg-primary/10 text-primary hover:bg-primary/10">
                        {area}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Org-wide program impact context */}
            {programs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Organization-Wide Impact</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Across all donors — statistical estimates
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {programs.map((p) => (
                    <div key={`${p.programArea}-${p.outcomeMetric}`} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-foreground">{p.programArea}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.outcomeMetric.replace(/_/g, ' ')} · {p.timeWindowMonths}mo
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 whitespace-nowrap">
                        +{p.estimatedPctChange.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
