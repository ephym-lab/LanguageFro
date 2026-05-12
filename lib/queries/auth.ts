import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/lib/types'
import { Language } from '@/lib/types'

// Auth Query Keys
export const authKeys = {
  all: ['auth'] as const,
  me: ['auth', 'me'] as const,
}

export const userKeys = {
  all: ['user'] as const,
  languages: () => [...userKeys.all, 'languages'] as const,
}

// Register mutation
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<RegisterResponse> => {
      const response = await apiClient.post('/users/register', data)
      return getObjectFromResponse<RegisterResponse>(response)!
    },
  })
}

// Verify OTP mutation
export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
      const response = await apiClient.post('/users/verify-otp', data)
      return getObjectFromResponse<VerifyOtpResponse>(response)!
    },
  })
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await apiClient.post('/users/login', data)
      return getObjectFromResponse<LoginResponse>(response)! // Returns { user, tokens }
    },
    onSuccess: () => {
      // Invalidate me query to refetch user
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/users/logout')
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
    },
  })
}

// Refresh token mutation
export function useRefreshToken() {
  return useMutation({
    mutationFn: async (
      data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> => {
      const response = await apiClient.post('/users/refresh', data)
      return getObjectFromResponse<RefreshTokenResponse>(response)!
    },
  })
}

// Get current user query
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get('/users/me')
      return getObjectFromResponse<User>(response) as User
    },
    retry: false,
  })
}

export function useUserLanguages() {
  return useQuery({
    queryKey: userKeys.languages(),
    queryFn: async () => {
      const response = await apiClient.get('/users/me/languages')
      // The response has { success, message, data: [...], status }
      const result = getObjectFromResponse<Language[]>(response)
      console.log('Raw API response:', response)
      console.log('Extracted data:', result)
      return result || []
    },
  })
}
