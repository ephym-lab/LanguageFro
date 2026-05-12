'use client'

import { useState } from 'react'
import { useCreateVote, useUpdateVote } from '@/lib/queries/votes'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface VotingInterfaceProps {
  responseId: string
  datasetId: string
  existingRating?: number
  voteId?: string
}

export function VotingInterface({
  responseId,
  datasetId,
  existingRating,
  voteId,
}: VotingInterfaceProps) {
  const [rating, setRating] = useState<number | null>(existingRating || null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const createVoteMutation = useCreateVote(datasetId)
  const updateVoteMutation = useUpdateVote(
    voteId || '',
    datasetId
  )

  const isSubmitting =
    createVoteMutation.isPending || updateVoteMutation.isPending

  const handleVote = async (newRating: number) => {
    setRating(newRating)

    try {
      if (voteId && existingRating) {
        // Update existing vote
        await updateVoteMutation.mutateAsync({
          rating: newRating as 1 | 2 | 3 | 4 | 5,
        })
      } else {
        // Create new vote
        await createVoteMutation.mutateAsync({
          response_id: responseId,
          rating: newRating as 1 | 2 | 3 | 4 | 5,
        })
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      // Reset rating on error
      setRating(existingRating || null)
    }
  }

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground mb-3">Rate this response:</p>
      <div className="flex gap-2 items-center">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleVote(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              disabled={isSubmitting}
              className="transition-all"
              title={ratingLabels[star - 1]}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  (hoverRating ? hoverRating : rating) && star <= (hoverRating || rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>

        {isSubmitting && (
          <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />
        )}

        {rating && (
          <span className="text-sm text-muted-foreground ml-2">
            {ratingLabels[rating - 1]}
          </span>
        )}
      </div>
    </div>
  )
}
