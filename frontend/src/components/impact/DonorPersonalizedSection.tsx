import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { PersonalizedStatementCard } from './PersonalizedStatementCard'
import { fetchDonorImpactStatements, type DonorImpactStatementDto } from '@/api/ImpactAPI'

interface DonorPersonalizedSectionProps {
  token: string
}

export function DonorPersonalizedSection({ token }: DonorPersonalizedSectionProps) {
  const [statements, setStatements] = useState<DonorImpactStatementDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDonorImpactStatements(token)
      .then(setStatements)
      .catch(() => setStatements([]))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
        <div className="mb-8">
          <div className="h-1 w-12 rounded-full bg-primary mb-4" />
          <h2 className="text-2xl font-semibold text-foreground">Your Personal Impact</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on your donation allocations and resident outcomes.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : statements.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-border p-6 bg-muted/30">
            Your impact is being tracked. Personalized results will appear here as our data grows —
            thank you for your continued support.
          </p>
        ) : (
          <div className="space-y-4">
            {statements.map((s) => (
              <PersonalizedStatementCard
                key={s.statementId}
                statementText={s.statementText}
                programArea={s.programArea}
                allocationAmount={s.allocationAmount}
                estimatedPctChange={s.estimatedPctChange}
                timeWindowMonths={s.timeWindowMonths}
                generatedAt={s.generatedAt}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
