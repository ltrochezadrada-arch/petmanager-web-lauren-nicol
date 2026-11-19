'use client'

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { HEALTH_STATUSES, healthLabel, type HealthReportRow } from '@/lib/pets/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const STATUS_COLORS: Record<string, string> = {
  Healthy: 'var(--chart-1)',
  Sick: 'var(--chart-3)',
  'In Surgery': 'var(--chart-2)',
}

const chartConfig = {
  count: { label: 'Mascotas' },
  ...Object.fromEntries(
    HEALTH_STATUSES.map((s) => [s.value.replace(/\s/g, ''), { label: s.label, color: STATUS_COLORS[s.value] }]),
  ),
} satisfies ChartConfig

function toChartData(rows: HealthReportRow[]) {
  return rows.map((r) => ({
    key: r.status.replace(/\s/g, ''),
    status: healthLabel(r.status),
    count: r.count,
    fill: STATUS_COLORS[r.status] ?? 'var(--chart-5)',
  }))
}

function EmptyState() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      No hay datos disponibles.
    </div>
  )
}

type Props = {
  overall: HealthReportRow[]
  dogs: HealthReportRow[]
  cats: HealthReportRow[]
}

export function HealthReports({ overall, dogs, cats }: Props) {
  const overallData = toChartData(overall)
  const dogData = toChartData(dogs)
  const catData = toChartData(cats)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="lg:row-span-2">
        <CardHeader>
          <CardTitle>Mascotas por estado de salud</CardTitle>
          <CardDescription>Distribución general de perros y gatos.</CardDescription>
        </CardHeader>
        <CardContent>
          {overallData.length === 0 ? (
            <EmptyState />
          ) : (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[360px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie data={overallData} dataKey="count" nameKey="key" innerRadius={60} strokeWidth={4}>
                  {overallData.map((d) => (
                    <Cell key={d.key} fill={d.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perros por estado de salud</CardTitle>
          <CardDescription>Cantidad de perros en cada estado.</CardDescription>
        </CardHeader>
        <CardContent>
          {dogData.length === 0 ? (
            <EmptyState />
          ) : (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={dogData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
                <Bar dataKey="count" radius={6}>
                  {dogData.map((d) => (
                    <Cell key={d.key} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gatos por estado de salud</CardTitle>
          <CardDescription>Cantidad de gatos en cada estado.</CardDescription>
        </CardHeader>
        <CardContent>
          {catData.length === 0 ? (
            <EmptyState />
          ) : (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={catData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="status" tickLine={false} axisLine={false} width={80} />
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
                <Bar dataKey="count" radius={6}>
                  {catData.map((d) => (
                    <Cell key={d.key} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
