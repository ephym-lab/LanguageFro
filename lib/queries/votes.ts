import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { getObjectFromResponse } from '@/lib/api'
import { Vote, CreateVoteRequest, VoteListResponse, VoteCountResponse } from '@/lib/types'
import { datasetKeys } from './datasets'
import { responseKeys } from './responses'

// Query Keys
export const voteKeys = {
  all: ['votes'] as const,
  lists: () => [...voteKeys.all, 'list'] as const,
  byResponse: (responseId: string) =>
    [...voteKeys.lists(), 'response', responseId] as const,
  counts: () => [...voteKeys.all, 'count'] as const,
  count: (responseId: string) => [...voteKeys.counts(), responseId] as const,
}

// Get votes for a response
export function useVotesForResponse(responseId: string) {
  return useQuery({
    queryKey: voteKeys.byResponse(responseId),
    queryFn: async (): Promise<VoteListResponse> => {
      const response = await apiClient.get(`/votes/response/${responseId}`)
      return getObjectFromResponse<VoteListResponse>(response) as VoteListResponse
    },
  })
}

// Get vote count for a response
export function useVoteCount(responseId: string) {
  return useQuery({
    queryKey: voteKeys.count(responseId),
    queryFn: async (): Promise<VoteCountResponse> => {
      const response = await apiClient.get(`/votes/response/${responseId}/count`)
      return getObjectFromResponse<VoteCountResponse>(response) as VoteCountResponse
    },
  })
}

// Create vote mutation
export function useCreateVote(datasetId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateVoteRequest): Promise<Vote> => {
      const response = await apiClient.post('/votes/', data)
      return getObjectFromResponse<Vote>(response) as Vote
    },
    onSuccess: (vote) => {
      queryClient.invalidateQueries({
        queryKey: voteKeys.byResponse(vote.response_id),
      })
      queryClient.invalidateQueries({
        queryKey: voteKeys.count(vote.response_id),
      })
      queryClient.invalidateQueries({
        queryKey: datasetKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: responseKeys.all,
      })
    },
  })
}

// Update vote mutation
export function useUpdateVote(voteId: string, datasetId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateVoteRequest>): Promise<Vote> => {
      const response = await apiClient.patch(`/votes/${voteId}`, data)
      return getObjectFromResponse<Vote>(response) as Vote
    },
    onSuccess: (vote) => {
      queryClient.invalidateQueries({
        queryKey: voteKeys.byResponse(vote.response_id),
      })
      queryClient.invalidateQueries({
        queryKey: voteKeys.count(vote.response_id),
      })
      queryClient.invalidateQueries({
        queryKey: datasetKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: responseKeys.all,
      })
    },
  })
}
