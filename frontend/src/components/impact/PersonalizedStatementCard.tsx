import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PersonalizedStatementCardProps {
  statementText: string
  programArea: string
  allocationAmount: number
  estimatedPctChange: number
  timeWindowMonths: number
  generatedAt: string | null
}

export function PersonalizedStatementCard({
  statementText,
  programArea,
  estimatedPctChange,
  timeWindowMonths,
  generatedAt,
}: PersonalizedStatementCardProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{programArea}</Badge>
          <span className="text-xs text-muted-foreground">
            +{estimatedPctChange.toFixed(1)}% over {timeWindowMonths} months
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{statementText}</p>
        {generatedAt && (
          <p className="text-xs text-muted-foreground">
            Estimated as of {new Date(generatedAt).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
