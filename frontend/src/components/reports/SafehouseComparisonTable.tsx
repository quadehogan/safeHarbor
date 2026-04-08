import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { OccupancyBar } from '@/components/analytics/OccupancyBar'
import type { SafehouseMetricRowDto } from '@/api/ReportsAPI'

interface SafehouseComparisonTableProps {
  rows: SafehouseMetricRowDto[]
  loading?: boolean
}

type SortKey = 'occupancy' | 'incidents'

export function SafehouseComparisonTable({ rows, loading = false }: SafehouseComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('occupancy')

  const sorted = [...rows].sort((a, b) => {
    if (sortKey === 'occupancy') {
      const rateA = a.capacity > 0 ? a.currentOccupancy / a.capacity : 0
      const rateB = b.capacity > 0 ? b.currentOccupancy / b.capacity : 0
      return rateB - rateA
    }
    return b.totalIncidents - a.totalIncidents
  })

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-xs text-muted-foreground">
        Sort by:
        <button
          onClick={() => setSortKey('occupancy')}
          className={`underline-offset-2 ${sortKey === 'occupancy' ? 'font-semibold text-foreground underline' : 'hover:underline'}`}
        >
          Occupancy
        </button>
        <button
          onClick={() => setSortKey('incidents')}
          className={`underline-offset-2 ${sortKey === 'incidents' ? 'font-semibold text-foreground underline' : 'hover:underline'}`}
        >
          Incidents
        </button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Safehouse</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead className="text-center">Incidents</TableHead>
            <TableHead className="text-center">Reintegrations YTD</TableHead>
            <TableHead className="text-center">Avg Health</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.safehouseId}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {row.city}, {row.region}
              </TableCell>
              <TableCell className="min-w-[140px]">
                <OccupancyBar current={row.currentOccupancy} capacity={row.capacity} />
              </TableCell>
              <TableCell className="text-center">
                {row.totalIncidents > 0 ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    {row.totalIncidents}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {row.reintegrationsYtd}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-sm">
                {row.avgHealthScore != null ? `${row.avgHealthScore.toFixed(1)} / 5` : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
