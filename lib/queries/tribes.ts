import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  Tribe,
  SubTribe,
  CreateTribeRequest,
  UpdateTribeRequest,
  CreateSubTribeRequest,
  UpdateSubTribeRequest,
} from '@/lib/types'

// Query Keys
export const tribeKeys = {
  all: ['tribes'] as const,
  lists: () => [...tribeKeys.all, 'list'] as const,
  details: () => [...tribeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tribeKeys.details(), id] as const,
  subtribes: (tribeId: string) => ['subtribes', tribeId] as const,
  subtribesAll: () => ['subtribes', 'all'] as const,
}

// Get all tribes
export function useTribes() {
  return useQuery({
    queryKey: tribeKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get('/tribes/')
      return getObjectFromResponse(response) as { items: Tribe[], total: number, limit: number, offset: number }
    },
  })
}

// Get single tribe
export function useTribe(id: string) {
  return useQuery({
    queryKey: tribeKeys.detail(id),
    queryFn: async (): Promise<Tribe> => {
      const response = await apiClient.get(`/tribes/${id}/`)
      return getObjectFromResponse<Tribe>(response) as Tribe
    },
  })
}

// Create tribe mutation
export function useCreateTribe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTribeRequest): Promise<Tribe> => {
      const response = await apiClient.post('/tribes/', data)
      return getObjectFromResponse<Tribe>(response) as Tribe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tribeKeys.lists() })
    },
  })
}

// Update tribe mutation
export function useUpdateTribe(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateTribeRequest): Promise<Tribe> => {
      const response = await apiClient.patch(`/tribes/${id}/`, data)
      return getObjectFromResponse<Tribe>(response) as Tribe
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tribeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: tribeKeys.lists() })
    },
  })
}

// Delete tribe mutation
export function useDeleteTribe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/tribes/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tribeKeys.lists() })
    },
  })
}

// Get all subtribes
export function useAllSubTribes() {
  return useQuery({
    queryKey: tribeKeys.subtribesAll(),
    queryFn: async () => {
      const response = await apiClient.get('/subtribes/')
      return getObjectFromResponse(response) as { items: SubTribe[], total: number, limit: number, offset: number }
    },
  })
}

// Get subtribes for a tribe
export function useSubTribes(tribeId: string | null) {
  return useQuery({
    queryKey: tribeKeys.subtribes(tribeId || ''),
    queryFn: async (): Promise<{ items: SubTribe[] }> => {
      const response = await apiClient.get(`/subtribes/by-tribe/${tribeId}`)
      // Endpoint returns array under 'data' according to ENDPOINTS.md
      // We will wrap it to match other list hooks
      const items = getObjectFromResponse<SubTribe[]>(response) || []
      return { items: Array.isArray(items) ? items : [] }
    },
    enabled: !!tribeId,
  })
}

// Create subtribe mutation
export function useCreateSubTribe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSubTribeRequest): Promise<SubTribe> => {
      const response = await apiClient.post('/subtribes/', data)
      return getObjectFromResponse<SubTribe>(response) as SubTribe
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tribeKeys.subtribes(data.tribe_id) })
      queryClient.invalidateQueries({ queryKey: tribeKeys.subtribesAll() })
    },
  })
}

// Update subtribe mutation
export function useUpdateSubTribe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSubTribeRequest }): Promise<SubTribe> => {
      const response = await apiClient.patch(`/subtribes/${id}`, data)
      return getObjectFromResponse<SubTribe>(response) as SubTribe
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tribeKeys.subtribes(data.tribe_id) })
      queryClient.invalidateQueries({ queryKey: tribeKeys.subtribesAll() })
    },
  })
}
