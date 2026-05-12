import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import { TranslationRequest, TranslationResponse, AiGenerateDatasetRequest } from '@/lib/types'

export const useNormalTranslate = () => {
  return useMutation({
    mutationFn: async (data: TranslationRequest): Promise<TranslationResponse> => {
      const response = await apiClient.post('/translate/normal-translate', data)
      return getObjectFromResponse<TranslationResponse>(response) as TranslationResponse
    },
  })
}

export const useAsyncTranslate = () => {
  return useMutation({
    mutationFn: async (data: TranslationRequest): Promise<TranslationResponse> => {
      const response = await apiClient.post('/translate/async-translate', data)
      return getObjectFromResponse<TranslationResponse>(response) as TranslationResponse
    },
  })
}

export const useGenerateDataset = () => {
  return useMutation({
    mutationFn: async (data: AiGenerateDatasetRequest) => {
      const response = await apiClient.post('/ai/generate-dataset', data)
      return getObjectFromResponse(response)
    },
  })
}
