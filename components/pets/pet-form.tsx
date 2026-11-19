'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Trash2, X } from 'lucide-react'
import { createPet, deletePet, updatePet } from '@/app/actions'
import { BREEDS, HEALTH_STATUSES, KIND_LABELS, type Pet, type PetKind } from '@/lib/pets/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Props = {
  kind: PetKind
  pet: Pet | null
  onDone: () => void
}

export function PetForm({ kind, pet, onDone }: Props) {
  const label = KIND_LABELS[kind].singular
  const breeds = BREEDS[kind]
  const isEditing = pet !== null

  const [code, setCode] = useState(pet?.code ?? '')
  const [name, setName] = useState(pet?.name ?? '')
  const [bornYear, setBornYear] = useState(pet ? String(pet.bornYear) : '')
  const [color, setColor] = useState(pet?.color ?? '')
  const [healthStatus, setHealthStatus] = useState<string>(pet?.healthStatus || 'Healthy')
  const [breed, setBreed] = useState<string>(pet?.breed && breeds.includes(pet.breed) ? pet.breed : breeds[0])
  const [pedigree, setPedigree] = useState(pet?.pedigree ?? false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const idPrefix = `${kind}-form`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = {
      petId: pet?.petId,
      childId: pet?.childId,
      code,
      name,
      bornYear: Number.parseInt(bornYear, 10),
      color,
      healthStatus,
      breed,
      pedigree,
    }
    startTransition(async () => {
      const result = isEditing ? await updatePet(kind, input) : await createPet(kind, input)
      if (result.ok) {
        toast.success(result.message)
        onDone()
      } else {
        toast.error(result.message)
      }
    })
  }

  function handleDelete() {
    if (!pet) return
    startTransition(async () => {
      const result = await deletePet(kind, pet.petId, pet.childId)
      setConfirmOpen(false)
      if (result.ok) {
        toast.success(result.message)
        onDone()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? `Editar ${label.toLowerCase()}` : `Nuevo ${label.toLowerCase()}`}</CardTitle>
        <CardDescription>
          {isEditing
            ? `ID mascota ${pet.petId} · ID ${label.toLowerCase()} ${pet.childId}`
            : `Completa los datos para registrar un ${label.toLowerCase()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-code`}>Código</Label>
              <Input
                id={`${idPrefix}-code`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={50}
                placeholder="P-001"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-name`}>Nombre</Label>
              <Input
                id={`${idPrefix}-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="Firulais"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-year`}>Año de nacimiento</Label>
              <Input
                id={`${idPrefix}-year`}
                type="number"
                inputMode="numeric"
                min={1980}
                max={new Date().getFullYear()}
                value={bornYear}
                onChange={(e) => setBornYear(e.target.value)}
                required
                placeholder="2020"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-color`}>Color</Label>
              <Input
                id={`${idPrefix}-color`}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                maxLength={50}
                placeholder="Café"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-health`}>Estado de salud</Label>
              <Select
                items={HEALTH_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                value={healthStatus}
                onValueChange={(v) => v && setHealthStatus(v as string)}
              >
                <SelectTrigger id={`${idPrefix}-health`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEALTH_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${idPrefix}-breed`}>Raza</Label>
              <Select value={breed} onValueChange={(v) => v && setBreed(v as string)}>
                <SelectTrigger id={`${idPrefix}-breed`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breeds.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {kind === 'dog' && (
            <Label htmlFor={`${idPrefix}-pedigree`} className="flex items-center gap-2 font-normal">
              <Checkbox
                id={`${idPrefix}-pedigree`}
                checked={pedigree}
                onCheckedChange={(checked) => setPedigree(Boolean(checked))}
              />
              Tiene pedigree
            </Label>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
            {isEditing && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 aria-hidden="true" />
                  Eliminar
                </Button>
                <Button type="button" variant="ghost" disabled={isPending} onClick={onDone}>
                  <X aria-hidden="true" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{`¿Eliminar a ${pet?.name ?? ''}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
