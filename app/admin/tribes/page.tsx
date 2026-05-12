'use client'

import { useState } from 'react'
import {
  useTribes,
  useCreateTribe,
  useUpdateTribe,
  useDeleteTribe,
} from '@/lib/queries/tribes'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoreHorizontal, Plus, Loader2, Trash2 } from 'lucide-react'
import { Tribe } from '@/lib/types'

const tribeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  icon_url: z.string().optional(),
})

type TribeFormData = z.infer<typeof tribeSchema>

export default function AdminTribesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const tribesQuery = useTribes()
  const createMutation = useCreateTribe()
  const updateMutation = useUpdateTribe(editingId || '')
  const deleteMutation = useDeleteTribe()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TribeFormData>({
    resolver: zodResolver(tribeSchema),
  })

  const onSubmit = async (data: TribeFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      reset()
      setIsDialogOpen(false)
      setEditingId(null)
      tribesQuery.refetch()
    } catch (error) {
      console.error('Failed to save tribe:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tribe?')) {
      try {
        await deleteMutation.mutateAsync(id)
        tribesQuery.refetch()
      } catch (error) {
        console.error('Failed to delete tribe:', error)
      }
    }
  }

  const columns = [
    {
      key: 'name' as const,
      label: 'Name',
    },
    {
      key: 'description' as const,
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {value}
        </span>
      ),
    },
    {
      key: 'tribe_id' as const,
      label: 'Actions',
      render: (value: string) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingId(value)
                setIsDialogOpen(true)
              }}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(value)}
              className="text-destructive cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const tribes = tribesQuery.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tribes</h1>
          <p className="text-muted-foreground">
            Manage indigenous tribes and communities
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                reset()
                setEditingId(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tribe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Tribe' : 'Add New Tribe'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update tribe information'
                  : 'Create a new tribe in the platform'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  placeholder="Tribe name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  placeholder="Tribe description"
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Icon URL (optional)
                </label>
                <Input
                  placeholder="https://example.com/icon.png"
                  {...register('icon_url')}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Tribe'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tribes Table */}
      <DataTable
        columns={columns}
        data={tribes}
        isLoading={tribesQuery.isLoading}
        emptyMessage="No tribes found"
      />
    </div>
  )
}
