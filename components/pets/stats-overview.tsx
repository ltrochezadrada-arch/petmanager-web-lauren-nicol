import { Activity, Cat, Dog, HeartPulse } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  dogs: number
  cats: number
  healthy: number
  needsCare: number
}

export function StatsOverview({ dogs, cats, healthy, needsCare }: Props) {
  const stats = [
    { label: 'Perros', value: dogs, icon: Dog },
    { label: 'Gatos', value: cats, icon: Cat },
    { label: 'Sanos', value: healthy, icon: HeartPulse },
    { label: 'Requieren atención', value: needsCare, icon: Activity },
  ]

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} size="sm">
          <CardContent className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          </CardContent>
        </Card>
      ))}
    </dl>
  )
}
