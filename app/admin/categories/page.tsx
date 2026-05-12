'use client'

import { useState } from 'react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/queries/categories'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
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

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const categoriesQuery = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory(editingId || '')
  const deleteMutation = useDeleteCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
      reset()
      setIsDialogOpen(false)
      setEditingId(null)
      categoriesQuery.refetch()
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMutation.mutateAsync(id)
        categoriesQuery.refetch()
      } catch (error) {
        console.error('Failed to delete category:', error)
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
      key: 'category_id' as const,
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

  const categories = categoriesQuery.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Categories
          </h1>
          <p className="text-muted-foreground">
            Manage dataset categories
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
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update category information'
                  : 'Create a new category for datasets'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  placeholder="Category name"
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
                  placeholder="Category description"
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
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
                  'Save Category'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={categoriesQuery.isLoading}
        emptyMessage="No categories found"
      />
    </div>
  )
}
