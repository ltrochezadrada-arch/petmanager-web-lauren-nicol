import { Badge } from '@/components/ui/badge'
import { healthLabel } from '@/lib/pets/constants'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  Healthy: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  Sick: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'In Surgery': 'bg-chart-2/20 text-foreground border-chart-2/40',
}

export function HealthBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('font-medium', STYLES[status])}>
      {healthLabel(status)}
    </Badge>
  )
}
