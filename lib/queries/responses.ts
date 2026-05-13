import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  ResponseObj,
  ResponseListResponse,
  CreateResponseRequest,
  UpdateResponseRequest,
  FilterParams,
  DatasetResponseCount,
} from '@/lib/types'

export const responseKeys = {
  all: ['responses'] as const,
  lists: () => [...responseKeys.all, 'list'] as const,
  infinite: (filters?: FilterParams) => [...responseKeys.lists(), { filters }] as const,
  datasetInfinite: (datasetId: string, filters?: FilterParams) => [...responseKeys.lists(), 'dataset', datasetId, { filters }] as const,
  detail: (datasetId: string) => [...responseKeys.all, 'detail', datasetId] as const,
}

// Get all responses with filters (paginated)
export function useGetResponses(filters?: FilterParams, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: responseKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        offset: pageParam.toString(),
        limit: limit.toString(),
        ...(filters?.is_ai_generated !== undefined && { is_ai_generated: filters.is_ai_generated.toString() }),
        ...(filters?.vote_type && { vote_type: filters.vote_type }),
      })

      const response = await apiClient.get(`/responses/?${params}`)
      return getObjectFromResponse<ResponseListResponse>(response) as ResponseListResponse
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (nextOffset < lastPage.total) {
        return nextOffset
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

// Get responses for a specific dataset
export function useGetDatasetResponses(datasetId: string, filters?: FilterParams, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: responseKeys.datasetInfinite(datasetId, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        offset: pageParam.toString(),
        limit: limit.toString(),
        ...(filters?.is_ai_generated !== undefined && { is_ai_generated: filters.is_ai_generated.toString() }),
        ...(filters?.vote_type && { vote_type: filters.vote_type }),
      })

      const response = await apiClient.get(`/responses/dataset/${datasetId}?${params}`)
      return getObjectFromResponse<ResponseListResponse>(response) as ResponseListResponse
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (nextOffset < lastPage.total) {
        return nextOffset
      }
      return undefined
    },
    initialPageParam: 0,
  })
}

export function useCreateResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateResponseRequest): Promise<ResponseObj> => {
      const response = await apiClient.post('/responses/', data)
      return getObjectFromResponse<ResponseObj>(response) as ResponseObj
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: responseKeys.all,
      })
    },
  })
}

export function useUpdateResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateResponseRequest }): Promise<ResponseObj> => {
      const response = await apiClient.patch(`/responses/${id}`, data)
      return getObjectFromResponse<ResponseObj>(response) as ResponseObj
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: responseKeys.all,
      })
    },
  })
}

// Upload voice recording
interface UploadVoiceRecordingRequest {
  dataset_id: string
  audio_blob: Blob
  language_variant_id?: string
}

export function useUploadVoiceRecording() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UploadVoiceRecordingRequest): Promise<ResponseObj> => {
      const formData = new FormData()
      formData.append('dataset_id', data.dataset_id)
      formData.append('audio', data.audio_blob)
      if (data.language_variant_id) {
        formData.append('language_variant_id', data.language_variant_id)
      }

      const response = await apiClient.post('/responses/upload-voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return getObjectFromResponse<ResponseObj>(response) as ResponseObj
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: responseKeys.all,
      })
    },
  })
}


export function useDatasetResponseCount(datasetId: string) {
  return useQuery({
    queryKey: [...responseKeys.detail(datasetId), 'count'] as const,
    queryFn: async (): Promise<DatasetResponseCount> => {
      const response = await apiClient.get(`/datasets/${datasetId}/responses/count`)
      const data = getObjectFromResponse<{ total: number; accepted: number }>(response)
      return data as DatasetResponseCount
    },
    enabled: !!datasetId, // Only run if we have a datasetId
  })
}

// Get current user's responses
export function useMyResponses(filters?: FilterParams, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: [...responseKeys.lists(), 'me', { filters }] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        offset: pageParam.toString(),
        limit: limit.toString(),
        ...(filters?.language_id && { language_id: filters.language_id }),
        ...(filters?.is_ai_generated !== undefined && { is_ai_generated: filters.is_ai_generated.toString() }),
        ...(filters?.vote_type && { vote_type: filters.vote_type }),
      })

      const response = await apiClient.get(`/responses/user/me?${params}`)
      return getObjectFromResponse<ResponseListResponse>(response) as ResponseListResponse
    },
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit
      if (nextOffset < lastPage.total) {
        return nextOffset
      }
      return undefined
    },
    initialPageParam: 0,
  })
}