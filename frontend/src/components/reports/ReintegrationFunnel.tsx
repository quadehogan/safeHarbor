import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ReintegrationFunnelProps {
  active: number
  inFamilyReunification: number
  inIndependentLiving: number
  reintegrated: number
  loading?: boolean
}

interface StageProps {
  label: string
  count: number
  total: number
  color: string
}

function Stage({ label, count, total, color }: StageProps) {
  const pct = total > 0 ? Math.max((count / total) * 100, 8) : 8
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full rounded-md flex items-center justify-center py-3 text-white text-sm font-semibold" style={{ backgroundColor: color, opacity: 0.85 + (pct / 500) }}>
        {count}
      </div>
      <p className="text-xs text-center text-muted-foreground leading-tight">{label}</p>
    </div>
  )
}

export function ReintegrationFunnel({
  active,
  inFamilyReunification,
  inIndependentLiving,
  reintegrated,
  loading = false,
}: ReintegrationFunnelProps) {
  const total = active + inFamilyReunification + inIndependentLiving + reintegrated

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Reintegration Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 flex-1" />)}
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <Stage label="In Care" count={active} total={total} color="#6366f1" />
            <div className="text-muted-foreground self-center pb-6">→</div>
            <Stage label="Reunification Track" count={inFamilyReunification} total={total} color="#8b5cf6" />
            <div className="text-muted-foreground self-center pb-6">→</div>
            <Stage label="Independent Living Track" count={inIndependentLiving} total={total} color="#a855f7" />
            <div className="text-muted-foreground self-center pb-6">→</div>
            <Stage label="Reintegrated" count={reintegrated} total={total} color="#22c55e" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
