import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/lib/types'

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
}

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/categories/')
      return getObjectFromResponse(response) as { items: Category[], total: number, limit: number, offset: number }
    },
  })
}

// Get single category
export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async (): Promise<Category> => {
      const response = await apiClient.get(`/categories/${id}`)
      return getObjectFromResponse<Category>(response) as Category
    },
  })
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest): Promise<Category> => {
      const response = await apiClient.post('/categories/', data)
      return getObjectFromResponse<Category>(response) as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

// Update category mutation
export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateCategoryRequest): Promise<Category> => {
      const response = await apiClient.patch(`/categories/${id}`, data)
      return getObjectFromResponse<Category>(response) as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}
