import { connection } from 'next/server'
import { PawPrint } from 'lucide-react'
import { groupByHealth, listAllHealthStatuses, listPets } from '@/lib/pets/queries'
import { PetDashboard } from '@/components/pets/pet-dashboard'
import { StatsOverview } from '@/components/pets/stats-overview'

async function loadData() {
  try {
    const [dogs, cats, statuses] = await Promise.all([listPets('dog'), listPets('cat'), listAllHealthStatuses()])
    return { ok: true as const, dogs, cats, statuses }
  } catch (error) {
    console.error('[pet-manager] Failed to load data:', error)
    return { ok: false as const }
  }
}

export default async function Home() {
  await connection()
  const data = await loadData()

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">Pet Manager</h1>
            <p className="text-sm text-muted-foreground">Administración de perros y gatos</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {data.ok ? (
          <>
            <StatsOverview
              dogs={data.dogs.length}
              cats={data.cats.length}
              healthy={data.statuses.filter((s) => s === 'Healthy').length}
              needsCare={data.statuses.filter((s) => s !== 'Healthy').length}
            />
            <PetDashboard
              dogs={data.dogs}
              cats={data.cats}
              overall={groupByHealth(data.statuses)}
              dogReport={groupByHealth(data.dogs.map((d) => d.healthStatus))}
              catReport={groupByHealth(data.cats.map((c) => c.healthStatus))}
            />
          </>
        ) : (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm">
            No se pudo conectar con la base de datos. Verifica la integración de Supabase en la configuración del
            proyecto.
          </div>
        )}
      </main>
    </div>
  )
}
