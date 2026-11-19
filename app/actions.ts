'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { BREEDS, HEALTH_STATUSES, type PetInput, type PetKind } from '@/lib/pets/constants'

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

const CHILD_TABLE: Record<PetKind, 'tb_dog' | 'tb_cat'> = { dog: 'tb_dog', cat: 'tb_cat' }
const KIND_NAME: Record<PetKind, string> = { dog: 'Perro', cat: 'Gato' }

function isKind(kind: unknown): kind is PetKind {
  return kind === 'dog' || kind === 'cat'
}

function validate(kind: PetKind, input: PetInput): string | null {
  const currentYear = new Date().getFullYear()
  if (!input.code?.trim() || input.code.trim().length > 50) return 'El código es obligatorio (máx. 50 caracteres).'
  if (!input.name?.trim() || input.name.trim().length > 100) return 'El nombre es obligatorio (máx. 100 caracteres).'
  if (!Number.isInteger(input.bornYear) || input.bornYear < 1980 || input.bornYear > currentYear)
    return `El año de nacimiento debe estar entre 1980 y ${currentYear}.`
  if ((input.color ?? '').length > 50) return 'El color no puede superar 50 caracteres.'
  if (!HEALTH_STATUSES.some((s) => s.value === input.healthStatus)) return 'Estado de salud inválido.'
  if (!BREEDS[kind].includes(input.breed)) return 'Raza inválida.'
  return null
}

function petPayload(input: PetInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    born_year: input.bornYear,
    color: input.color.trim(),
    health_status: input.healthStatus,
  }
}

function childPayload(kind: PetKind, input: PetInput) {
  return kind === 'dog' ? { breed: input.breed, pedigree: Boolean(input.pedigree) } : { breed: input.breed }
}

async function codeTaken(code: string, exceptPetId?: number) {
  const supabase = getSupabaseAdmin()
  let query = supabase.from('tb_pet').select('id').eq('code', code).limit(1)
  if (exceptPetId) query = query.neq('id', exceptPetId)
  const { data } = await query
  return (data?.length ?? 0) > 0
}

export async function createPet(kind: PetKind, input: PetInput): Promise<ActionResult> {
  if (!isKind(kind)) return { ok: false, message: 'Tipo de mascota inválido.' }
  const invalid = validate(kind, input)
  if (invalid) return { ok: false, message: invalid }

  if (await codeTaken(input.code.trim())) {
    return { ok: false, message: 'Ya existe una mascota con ese código.' }
  }

  const supabase = getSupabaseAdmin()
  const { data: pet, error: petError } = await supabase
    .from('tb_pet')
    .insert(petPayload(input))
    .select('id')
    .single()

  if (petError || !pet) return { ok: false, message: `No se pudo guardar el ${KIND_NAME[kind].toLowerCase()}.` }

  const { error: childError } = await supabase
    .from(CHILD_TABLE[kind])
    .insert({ ...childPayload(kind, input), id_pet: pet.id })

  if (childError) {
    await supabase.from('tb_pet').delete().eq('id', pet.id)
    return { ok: false, message: `No se pudo guardar el ${KIND_NAME[kind].toLowerCase()}.` }
  }

  revalidatePath('/')
  return { ok: true, message: `${KIND_NAME[kind]} guardado correctamente.` }
}

export async function updatePet(kind: PetKind, input: PetInput): Promise<ActionResult> {
  if (!isKind(kind)) return { ok: false, message: 'Tipo de mascota inválido.' }
  if (!Number.isInteger(input.petId) || !Number.isInteger(input.childId))
    return { ok: false, message: 'Selecciona una mascota para editar.' }
  const invalid = validate(kind, input)
  if (invalid) return { ok: false, message: invalid }

  if (await codeTaken(input.code.trim(), input.petId)) {
    return { ok: false, message: 'Ya existe otra mascota con ese código.' }
  }

  const supabase = getSupabaseAdmin()
  const { error: petError } = await supabase.from('tb_pet').update(petPayload(input)).eq('id', input.petId!)
  if (petError) return { ok: false, message: `No se pudo actualizar el ${KIND_NAME[kind].toLowerCase()}.` }

  const { error: childError } = await supabase
    .from(CHILD_TABLE[kind])
    .update(childPayload(kind, input))
    .eq('id', input.childId!)
    .eq('id_pet', input.petId!)
  if (childError) return { ok: false, message: `No se pudo actualizar el ${KIND_NAME[kind].toLowerCase()}.` }

  revalidatePath('/')
  return { ok: true, message: `${KIND_NAME[kind]} actualizado correctamente.` }
}

export async function deletePet(kind: PetKind, petId: number, childId: number): Promise<ActionResult> {
  if (!isKind(kind) || !Number.isInteger(petId) || !Number.isInteger(childId))
    return { ok: false, message: 'Mascota inválida.' }

  const supabase = getSupabaseAdmin()
  const { error: childError } = await supabase
    .from(CHILD_TABLE[kind])
    .delete()
    .eq('id', childId)
    .eq('id_pet', petId)
  if (childError) return { ok: false, message: `No se pudo eliminar el ${KIND_NAME[kind].toLowerCase()}.` }

  await supabase.from('tb_pet_hospital').delete().eq('id_pet', petId)
  const { error: petError } = await supabase.from('tb_pet').delete().eq('id', petId)
  if (petError) return { ok: false, message: `No se pudo eliminar el ${KIND_NAME[kind].toLowerCase()}.` }

  revalidatePath('/')
  return { ok: true, message: `${KIND_NAME[kind]} eliminado correctamente.` }
}
