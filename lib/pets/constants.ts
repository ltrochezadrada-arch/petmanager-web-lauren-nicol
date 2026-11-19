export type PetKind = 'dog' | 'cat'

export const HEALTH_STATUSES = [
  { value: 'Healthy', label: 'Sano' },
  { value: 'Sick', label: 'Enfermo' },
  { value: 'In Surgery', label: 'En cirugía' },
] as const

export type HealthStatus = (typeof HEALTH_STATUSES)[number]['value']

export const DOG_BREEDS = ['Criollo', 'Schnauzer', 'German shepherd', 'Pincher'] as const
export const CAT_BREEDS = ['Birman', 'British', 'Bombay', 'Abyssinian'] as const

export const BREEDS: Record<PetKind, readonly string[]> = {
  dog: DOG_BREEDS,
  cat: CAT_BREEDS,
}

export const KIND_LABELS: Record<PetKind, { singular: string; plural: string }> = {
  dog: { singular: 'Perro', plural: 'Perros' },
  cat: { singular: 'Gato', plural: 'Gatos' },
}

export function healthLabel(value: string | null | undefined) {
  return HEALTH_STATUSES.find((s) => s.value === value)?.label ?? value ?? 'Sin estado'
}

export type Pet = {
  kind: PetKind
  petId: number
  childId: number
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}

export type HealthReportRow = { status: string; count: number }

export type PetInput = {
  petId?: number
  childId?: number
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}
