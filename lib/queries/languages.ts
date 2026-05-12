import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  Language,
  CreateLanguageRequest,
  UpdateLanguageRequest,
} from '@/lib/types'

// Query Keys
export const languageKeys = {
  all: ['languages'] as const,
  lists: () => [...languageKeys.all, 'list'] as const,
  details: () => [...languageKeys.all, 'detail'] as const,
  detail: (id: string) => [...languageKeys.details(), id] as const,
}

// Get all languages
export function useLanguages() {
  return useQuery({
    queryKey: languageKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/languages/')
      return getObjectFromResponse(response) as { items: Language[], total: number, limit: number, offset: number }
    },
  })
}

// Get single language
export function useLanguage(id: string) {
  return useQuery({
    queryKey: languageKeys.detail(id),
    queryFn: async (): Promise<Language> => {
      const response = await apiClient.get(`/languages/${id}`)
      return getObjectFromResponse<Language>(response) as Language
    },
  })
}

// Create language mutation
export function useCreateLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateLanguageRequest): Promise<Language> => {
      const response = await apiClient.post('/languages/', data)
      return getObjectFromResponse<Language>(response) as Language
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.lists() })
    },
  })
}

// Update language mutation
export function useUpdateLanguage(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateLanguageRequest): Promise<Language> => {
      const response = await apiClient.patch(`/languages/${id}`, data)
      return getObjectFromResponse<Language>(response) as Language
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: languageKeys.lists() })
    },
  })
}

// Delete language mutation
export function useDeleteLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/languages/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: languageKeys.lists() })
    },
  })
}

// Get languages by subtribe
export function useLanguagesBySubtribe(subtribeId: string | null) {
  return useQuery({
    queryKey: ['languages', 'subtribe', subtribeId],
    queryFn: async () => {
      const response = await apiClient.get(`/languages/by-subtribe/${subtribeId}`)
      return getObjectFromResponse(response) as { items: Language[], total: number, limit: number, offset: number }
    },
    enabled: !!subtribeId,
  })
}
