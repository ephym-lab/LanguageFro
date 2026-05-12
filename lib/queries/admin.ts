import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  User,
  PaginationParams,
} from '@/lib/types'

interface UserListResponse {
  items: User[]
  total: number
  limit: number
  offset: number
}

// Query Keys
export const adminKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...adminKeys.users.all, 'list'] as const,
    list: (filters?: PaginationParams) =>
      [...adminKeys.users.lists(), filters] as const,
    details: () => [...adminKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...adminKeys.users.details(), id] as const,
  },
}

// Get paginated users list
export function useUsers(offset: number = 0, limit: number = 20) {
  return useQuery({
    queryKey: adminKeys.users.list({ offset, limit }),
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      })
      const response = await apiClient.get(`/users/?${params}`)
      return getObjectFromResponse<UserListResponse>(response) as UserListResponse
    },
  })
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: adminKeys.users.detail(id),
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get(`/users/${id}`)
      return getObjectFromResponse<User>(response) as User
    },
  })
}

// Alias for admin users list (admin version)
export function useAdminUsers(page: number = 1, pageSize: number = 20) {
  const offset = (page - 1) * pageSize
  return useUsers(offset, pageSize)
}

// Get admin statistics
interface AdminStats {
  total_users?: number
  active_users?: number
  datasets_count?: number
  responses_count?: number
  total_languages?: number
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await apiClient.get('/admin/stats')
      return getObjectFromResponse<AdminStats>(response) as AdminStats
    },
  })
}

// Suspend user mutation
export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string): Promise<User> => {
      const response = await apiClient.post(`/admin/users/${userId}/suspend`, {})
      return getObjectFromResponse<User>(response) as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.lists() })
    },
  })
}

// Activate user mutation
export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string): Promise<User> => {
      const response = await apiClient.post(`/admin/users/${userId}/activate`, {})
      return getObjectFromResponse<User>(response) as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.lists() })
    },
  })
}
