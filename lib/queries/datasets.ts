import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  Dataset,
  DatasetListResponse,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  FilterParams,
} from '@/lib/types'

// Query Keys
export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  infinite: (filters?: FilterParams) =>
    [...datasetKeys.lists(), { filters }] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
}

// Get paginated datasets with filters
export function useDatasets(
  filters?: FilterParams,
  limit: number = 20
) {
  return useInfiniteQuery({
    queryKey: datasetKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        offset: pageParam.toString(),
        limit: limit.toString(),
        ...(filters?.tribe_id && { tribe_id: filters.tribe_id }),
        ...(filters?.subtribe_id && { subtribe_id: filters.subtribe_id }),
        ...(filters?.language_id && { language_id: filters.language_id }),
        ...(filters?.category_id && { category_id: filters.category_id }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.endangered_status && {
          endangered_status: filters.endangered_status,
        }),
      })

      const response = await apiClient.get(`/datasets/?${params}`)
      return getObjectFromResponse<DatasetListResponse>(response) as DatasetListResponse
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

// Get single dataset
export function useDataset(id: string) {
  return useQuery({
    queryKey: datasetKeys.detail(id),
    queryFn: async (): Promise<Dataset> => {
      const response = await apiClient.get(`/datasets/${id}`)
      return getObjectFromResponse<Dataset>(response) as Dataset
    },
  })
}

// Create dataset mutation
export function useCreateDataset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateDatasetRequest): Promise<Dataset> => {
      const response = await apiClient.post('/datasets/', data)
      return getObjectFromResponse<Dataset>(response) as Dataset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}

// Update dataset mutation
export function useUpdateDataset(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateDatasetRequest): Promise<Dataset> => {
      const response = await apiClient.patch(`/datasets/${id}`, data)
      return getObjectFromResponse<Dataset>(response) as Dataset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}
