import { MapPin } from 'lucide-react'
import { FadeIn } from '@/components/FadeIn'
import { Skeleton } from '@/components/ui/skeleton'
import { OccupancyBar } from '@/components/analytics/OccupancyBar'

interface SafehouseLocation {
  city: string
  region: string
  current: number
  capacity: number
}

interface SafehouseLocationsGridProps {
  locations: SafehouseLocation[]
  loading?: boolean
}

export function SafehouseLocationsGrid({ locations, loading = false }: SafehouseLocationsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading
        ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)
        : locations.map((loc, i) => (
            <FadeIn key={loc.city} className={i > 0 ? `delay-${Math.min(i * 75, 300)}` : ''}>
              <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground">{loc.city}</h3>
                    <p className="text-xs text-muted-foreground">{loc.region}</p>
                    <div className="mt-3">
                      {/* showLabel=false for public privacy */}
                      <OccupancyBar current={loc.current} capacity={loc.capacity} showLabel={false} />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
    </div>
  )
}
