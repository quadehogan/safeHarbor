import { Badge } from '@/components/ui/badge'

interface AnonymizedStoryCardProps {
  label: string
  age: string
  text: string
  status: string
  image: string
}

export function AnonymizedStoryCard({ label, age, text, status, image }: AnonymizedStoryCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden h-full flex flex-col">
      <img src={image} alt={label} className="h-44 w-full object-cover" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
            {status}
          </Badge>
          <span className="text-xs text-muted-foreground">Age {age}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{text}"</p>
        <p className="mt-4 text-xs font-medium text-foreground/50">— {label}</p>
      </div>
    </div>
  )
}
