import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
// @ts-ignore

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const API_URL =  'http://localhost:8080/api/v1'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to safely extract an array from API responses that may use different shapes
export function getArrayFromResponse(response: any): any[] {
  const payload = response?.data?.data ?? response?.data
  if (Array.isArray(payload)) return payload
  if (payload?.items && Array.isArray(payload.items)) return payload.items
  if (payload?.data && Array.isArray(payload.data)) return payload.data
  return []
}

// Helper to safely extract an object (or typed payload) from API responses
export function getObjectFromResponse<T = any>(response: any): T | null {
  const payload = response?.data?.data ?? response?.data
  if (payload && typeof payload === 'object') return payload as T
  return null
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = Cookies.get('refresh_token')

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/users/refresh`, {
            refresh_token: refreshToken,
          })

          const tokens = response.data.data.tokens || response.data.data
          const accessToken = tokens.access_token || tokens.auth_token

          // Update tokens
          Cookies.set('auth_token', accessToken)
          Cookies.set('refresh_token', tokens.refresh_token)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('auth_token')
          Cookies.remove('refresh_token')
          window.location.href = '/auth/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No refresh token, redirect to login
        Cookies.remove('auth_token')
        window.location.href = '/auth/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
