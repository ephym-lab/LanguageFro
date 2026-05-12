'use client'

import { useState } from 'react'
import {
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from '@/lib/queries/languages'
import { useSubTribes } from '@/lib/queries/tribes'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoreHorizontal, Plus, Loader2, Trash2 } from 'lucide-react'
import { useTribes } from '@/lib/queries/tribes'

const languageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  iso_code: z.string().min(2, 'ISO code is required'),
  description: z.string().min(1, 'Description is required'),
  endangered_status: z.enum(['safe', 'vulnerable', 'endangered', 'critically_endangered']),
  subtribe_id: z.string().min(1, 'Subtribe is required'),
})

type LanguageFormData = z.infer<typeof languageSchema>

export default function AdminLanguagesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedTribe, setSelectedTribe] = useState<string | null>(null)

  const languagesQuery = useLanguages()
  const tribesQuery = useTribes()
  const subtribesQuery = useSubTribes(selectedTribe)
  const createMutation = useCreateLanguage()
  const updateMutation = useUpdateLanguage(editingId || '')
  const deleteMutation = useDeleteLanguage()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
  })

  const onSubmit = async (data: LanguageFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      reset()
      setIsDialogOpen(false)
      setEditingId(null)
      languagesQuery.refetch()
    } catch (error) {
      console.error('Failed to save language:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this language?')) {
      try {
        await deleteMutation.mutateAsync(id)
        languagesQuery.refetch()
      } catch (error) {
        console.error('Failed to delete language:', error)
      }
    }
  }

  const columns = [
    {
      key: 'name' as const,
      label: 'Language',
    },
    {
      key: 'iso_code' as const,
      label: 'ISO Code',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'endangered_status' as const,
      label: 'Status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          safe: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
          vulnerable: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
          endangered: 'bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100',
          critically_endangered: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
        }
        return (
          <span className={`text-xs font-medium px-2 py-1 rounded ${colors[value]}`}>
            {value.replace(/_/g, ' ')}
          </span>
        )
      },
    },
    {
      key: 'language_id' as const,
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

  const languages = languagesQuery.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Languages
          </h1>
          <p className="text-muted-foreground">
            Manage indigenous African languages
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
              Add Language
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Language' : 'Add New Language'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update language information'
                  : 'Create a new language in the platform'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tribe</label>
                <Select value={selectedTribe || ''} onValueChange={setSelectedTribe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tribe" />
                  </SelectTrigger>
                  <SelectContent>
                    {tribesQuery.data?.map((tribe) => (
                      <SelectItem key={tribe.tribe_id} value={tribe.tribe_id}>
                        {tribe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTribe && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sub-Tribe
                  </label>
                  <Controller
                    name="subtribe_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sub-tribe" />
                        </SelectTrigger>
                        <SelectContent>
                          {subtribesQuery.data?.map((subtribe) => (
                            <SelectItem
                              key={subtribe.subtribe_id}
                              value={subtribe.subtribe_id}
                            >
                              {subtribe.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  placeholder="Language name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  ISO Code
                </label>
                <Input
                  placeholder="e.g., en, es, yo"
                  {...register('iso_code')}
                  className={errors.iso_code ? 'border-destructive' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <Controller
                  name="endangered_status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="vulnerable">Vulnerable</SelectItem>
                        <SelectItem value="endangered">Endangered</SelectItem>
                        <SelectItem value="critically_endangered">
                          Critically Endangered
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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
                  'Save Language'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Languages Table */}
      <DataTable
        columns={columns}
        data={languages}
        isLoading={languagesQuery.isLoading}
        emptyMessage="No languages found"
      />
    </div>
  )
}
