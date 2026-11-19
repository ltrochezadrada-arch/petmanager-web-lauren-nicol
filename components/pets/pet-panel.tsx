'use client'

import { useState } from 'react'
import { KIND_LABELS, type Pet, type PetKind } from '@/lib/pets/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PetForm } from './pet-form'
import { PetTable } from './pet-table'

export function PetPanel({ kind, pets }: { kind: PetKind; pets: Pet[] }) {
  const [selected, setSelected] = useState<Pet | null>(null)
  const labels = KIND_LABELS[kind]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <PetForm
          key={selected ? `edit-${selected.childId}` : 'new'}
          kind={kind}
          pet={selected}
          onDone={() => setSelected(null)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{`Lista de ${labels.plural.toLowerCase()}`}</CardTitle>
          <CardDescription>{`${pets.length} registrados · usa el lápiz para editar o eliminar.`}</CardDescription>
        </CardHeader>
        <CardContent>
          <PetTable pets={pets} selectedPetId={selected?.childId} onEdit={setSelected} />
        </CardContent>
      </Card>
    </div>
  )
}
