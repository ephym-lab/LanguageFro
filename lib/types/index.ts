// Auth Types
export interface RegisterRequest {
  username: string
  name: string
  email: string
  password: string
  gender: string
  phone?: string
  avatar?: string
  languages: string[]
}

export interface RegisterResponse {
  user_id: string
  email: string
  username: string
  name: string
  gender: string
  phone: string
  avatar: string
}

export interface VerifyOtpRequest {
  email: string
  code: string
}

export interface VerifyOtpResponse {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    user_id: string
    email: string
    username: string
    role: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token?: string
  auth_token?: string
  refresh_token: string
}

// User Types
export interface User {
  id: string
  username: string
  name?: string
  full_name?: string
  email: string
  gender?: string
  role: string
  phone?: string
  avatar?: string
  is_verified?: boolean
  is_active?: boolean
  languages?: Language[]
  created_at?: string
  updated_at?: string
}

export interface UpdateUserRequest {
  username?: string
  avatar?: string
}

// Tribe Types
export interface Tribe {
  id: string
  name: string
  country: string
  country_code: string
  created_at: string
}

export interface CreateTribeRequest {
  name: string
  country: string
  country_code: string
}

export interface UpdateTribeRequest {
  country?: string
  country_code?: string
}

// Subtribe Types
export interface SubTribe {
  id: string
  name: string
  tribe_id: string
  created_at: string
}

export interface CreateSubTribeRequest {
  name: string
  tribe_id: string
  language_id: string
}

export interface UpdateSubTribeRequest {
  name?: string
}

// Language Types
export interface Language {
  id: string
  name: string
  code: string
  subtribe_id: string | null
  created_at: string
}

export interface CreateLanguageRequest {
  name: string
  code: string
}

export interface UpdateLanguageRequest {
  name?: string
  code?: string
}

// Category Types
export interface Category {
  id: string
  name: string
  description: string
  created_at: string
}

export interface CreateCategoryRequest {
  name: string
  description: string
}

export interface UpdateCategoryRequest {
  description?: string
}

export interface AiResponse {
  id: string
  response_text: string
  language: Language
  is_ai_generated: boolean
  acceptance_count: number
  rejection_count: number
}

// Dataset Types
export interface Dataset {
  id: string
  original_text: string
  level: string
  response_percentage: number
  is_clean: boolean
  allowed_categories: Category[]
  language_id: string  // Present in your API response
  ai_responses: AiResponse[]  // Present in your API response
  created_at: string  // Present in your API response
  updated_at: string  // Present in your API response
}

export interface CreateDatasetRequest {
  original_text: string
  level: string
  category_ids: string[]
  language_id: string
}

export interface UpdateDatasetRequest {
  original_text?: string
}

export interface DatasetListResponse {
  items: Dataset[]
  total: number
  limit: number
  offset: number
}

// Response Types
export interface ResponseObj {
  id: string
  response_text: string
  response_date: string
  is_accepted: boolean
  user_id: string
  dataset_id: string
  language_id: string
  category_id: string
  created_at: string
}

export interface CreateResponseRequest {
  dataset_id: string
  response_text?: string
  language_id?: string
  category_id?: string
}

export interface UpdateResponseRequest {
  response_text: string
}

export interface ResponseListResponse {
  items: ResponseObj[]
  total: number
  limit: number
  offset: number
}

// Vote Types
export interface Vote {
  id: string
  vote?: 'accept' | 'reject'
  rating?: 1 | 2 | 3 | 4 | 5
  user_id: string
  response_id: string
  created_at: string
}

export interface CreateVoteRequest {
  vote?: 'accept' | 'reject'
  rating?: 1 | 2 | 3 | 4 | 5
  response_id: string
}

export interface VoteListResponse {
  items: Vote[]
  total: number
  limit: number
  offset: number
}

export interface VoteCountResponse {
  total: number
  accepted: number
  rejected: number
}

// Translation Types
export interface TranslationRequest {
  text: string
  source_lang: string
  target_lang: string
}

export interface TranslationResponse {
  original: string
  translated: string
  source_lang: string
  target_lang: string
}

// AI Generation Types
export interface AiGenerateDatasetRequest {
  language_id: string
  level: string
  category_ids?: string[]
  target_languages?: string[]
  generation_count?: number
}

// Pagination Types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface FilterParams {
  tribe_id?: string
  subtribe_id?: string
  language_id?: string
  category_id?: string
  status?: string
  search?: string
  endangered_status?: string
  is_ai_generated?: boolean
  vote_type?: string
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  status: number
}

export interface DatasetResponseCount {
  total: number
  accepted: number
}
