'use client'

import { useMemo, useState } from 'react'
import { Pencil, Search } from 'lucide-react'
import { KIND_LABELS, type Pet } from '@/lib/pets/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HealthBadge } from './health-badge'

type Props = {
  pets: Pet[]
  showKind?: boolean
  selectedPetId?: number
  onEdit?: (pet: Pet) => void
}

export function PetTable({ pets, showKind = false, selectedPetId, onEdit }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pets
    return pets.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q),
    )
  }, [pets, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Buscar por código, nombre o raza"
          placeholder="Buscar por código, nombre o raza"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              {showKind && <TableHead>Tipo</TableHead>}
              <TableHead>Raza</TableHead>
              <TableHead className="hidden md:table-cell">Año</TableHead>
              <TableHead className="hidden md:table-cell">Color</TableHead>
              <TableHead>Estado</TableHead>
              {onEdit && (
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {pets.length === 0 ? 'No hay mascotas registradas.' : 'No se encontraron resultados.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((pet) => (
                <TableRow
                  key={`${pet.kind}-${pet.childId}`}
                  data-state={selectedPetId === pet.childId ? 'selected' : undefined}
                >
                  <TableCell className="font-mono text-xs">{pet.code}</TableCell>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  {showKind && (
                    <TableCell>
                      <Badge variant="secondary">{KIND_LABELS[pet.kind].singular}</Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {pet.breed}
                      {pet.kind === 'dog' && pet.pedigree && (
                        <Badge variant="outline" className="text-[10px]">
                          Pedigree
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{pet.bornYear}</TableCell>
                  <TableCell className="hidden md:table-cell">{pet.color || '—'}</TableCell>
                  <TableCell>
                    <HealthBadge status={pet.healthStatus} />
                  </TableCell>
                  {onEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" onClick={() => onEdit(pet)}>
                        <Pencil aria-hidden="true" />
                        <span className="sr-only">{`Editar ${pet.name}`}</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
