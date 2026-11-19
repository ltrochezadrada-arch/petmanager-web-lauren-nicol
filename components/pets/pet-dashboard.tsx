'use client'

import { BarChart3, Cat, Dog, PawPrint } from 'lucide-react'
import type { HealthReportRow, Pet } from '@/lib/pets/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HealthReports } from './health-reports'
import { PetPanel } from './pet-panel'
import { PetTable } from './pet-table'

type Props = {
  dogs: Pet[]
  cats: Pet[]
  overall: HealthReportRow[]
  dogReport: HealthReportRow[]
  catReport: HealthReportRow[]
}

export function PetDashboard({ dogs, cats, overall, dogReport, catReport }: Props) {
  const allPets = [...dogs, ...cats]

  return (
    <Tabs defaultValue="all" className="gap-6">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        <TabsTrigger value="all">
          <PawPrint aria-hidden="true" />
          Todas
        </TabsTrigger>
        <TabsTrigger value="dogs">
          <Dog aria-hidden="true" />
          Perros
        </TabsTrigger>
        <TabsTrigger value="cats">
          <Cat aria-hidden="true" />
          Gatos
        </TabsTrigger>
        <TabsTrigger value="reports">
          <BarChart3 aria-hidden="true" />
          Reportes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Todas las mascotas</CardTitle>
            <CardDescription>Listado combinado de perros y gatos registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <PetTable pets={allPets} showKind />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dogs">
        <PetPanel kind="dog" pets={dogs} />
      </TabsContent>

      <TabsContent value="cats">
        <PetPanel kind="cat" pets={cats} />
      </TabsContent>

      <TabsContent value="reports">
        <HealthReports overall={overall} dogs={dogReport} cats={catReport} />
      </TabsContent>
    </Tabs>
  )
}
