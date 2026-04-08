interface OccupancyBarProps {
  current: number
  capacity: number
  showLabel?: boolean
}

export function OccupancyBar({ current, capacity, showLabel = true }: OccupancyBarProps) {
  const pct = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {current}/{capacity}
        </span>
      )}
    </div>
  )
}
