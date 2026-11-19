import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { HealthReportRow, Pet, PetKind } from './constants'

type PetRow = {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: string
}

type ChildRow = {
  id: number
  breed: string
  pedigree?: boolean
  tb_pet: PetRow | PetRow[] | null
}

const PET_COLUMNS = 'id, code, name, born_year, color, health_status'

function toPet(kind: PetKind, row: ChildRow): Pet | null {
  const pet = Array.isArray(row.tb_pet) ? row.tb_pet[0] : row.tb_pet
  if (!pet) return null
  return {
    kind,
    petId: pet.id,
    childId: row.id,
    code: pet.code ?? '',
    name: pet.name ?? '',
    bornYear: pet.born_year ?? 0,
    color: pet.color ?? '',
    healthStatus: pet.health_status ?? '',
    breed: row.breed ?? '',
    pedigree: Boolean(row.pedigree),
  }
}

export async function listPets(kind: PetKind): Promise<Pet[]> {
  const supabase = getSupabaseAdmin()
  const query =
    kind === 'dog'
      ? supabase.from('tb_dog').select(`id, breed, pedigree, tb_pet!inner(${PET_COLUMNS})`)
      : supabase.from('tb_cat').select(`id, breed, tb_pet!inner(${PET_COLUMNS})`)

  const { data, error } = await query.order('id', { ascending: true })
  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as ChildRow[])
    .map((row) => toPet(kind, row))
    .filter((p): p is Pet => p !== null)
}

export async function listAllHealthStatuses(): Promise<string[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('tb_pet').select('health_status')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.health_status as string)
}

export function groupByHealth(statuses: string[]): HealthReportRow[] {
  const counts = new Map<string, number>()
  for (const s of statuses) {
    const key = s || 'Unknown'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Array.from(counts, ([status, count]) => ({ status, count }))
}
