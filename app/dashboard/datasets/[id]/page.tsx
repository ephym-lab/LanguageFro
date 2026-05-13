'use client'

import { useDataset } from '@/lib/queries/datasets'
import { useLanguage } from '@/lib/queries/languages'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mic, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useCreateVote } from '@/lib/queries/votes'
import { toast } from 'sonner'

export default function DatasetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const datasetId = params.id as string

  const [votedResponseIds, setVotedResponseIds] = useState<string[]>([])

  const datasetQuery = useDataset(datasetId)
  const dataset = datasetQuery.data
  const createVote = useCreateVote(datasetId)

  // Get language info if language_id exists
  const languageQuery = useLanguage(dataset?.language_id || '')

  if (datasetQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Dataset not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  // Calculate total acceptances and rejections for AI responses
  const totalAcceptances = dataset.ai_responses?.reduce((sum, r) => sum + (r.acceptance_count || 0), 0) || 0
  const totalRejections = dataset.ai_responses?.reduce((sum, r) => sum + (r.rejection_count || 0), 0) || 0


  const handleVote = async (responseId: string, voteType: 'accept' | 'reject') => {
    try {
      await createVote.mutateAsync({
        response_id: responseId,
        vote: voteType,
      })
      toast.success(`Successfully ${voteType === 'accept' ? 'accepted' : 'rejected'} response`)
      setVotedResponseIds(prev => [...prev, responseId])
    } catch (error: any) {
      console.error('Voting error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to submit vote'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/datasets">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Datasets
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {dataset.original_text}
        </h1>

        <div className="flex flex-wrap gap-2 mt-4">
          {dataset.allowed_categories?.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
          {languageQuery.data && (
            <Badge variant="outline">{languageQuery.data.name}</Badge>
          )}
          <Badge variant="outline">
            Level: {dataset.level?.replace('_', ' ') || 'N/A'}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dataset Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Dataset Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Original Text
                </p>
                <p className="text-foreground font-medium">
                  {dataset.original_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Language
                  </p>
                  <p className="text-foreground font-medium">
                    {languageQuery.isLoading
                      ? 'Loading...'
                      : languageQuery.data?.name || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Categories
                  </p>
                  <p className="text-foreground font-medium">
                    {dataset.allowed_categories?.map(c => c.name).join(', ') || 'None'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Level
                  </p>
                  <p className="text-foreground font-medium">
                    {dataset.level?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Response Percentage
                  </p>
                  <p className="text-foreground font-medium">
                    {dataset.response_percentage}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Is Clean
                  </p>
                  <p className="text-foreground font-medium">
                    {dataset.is_clean ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Created
                  </p>
                  {/* <p className="text-foreground font-medium">
                    {new Date(dataset.created_at).toLocaleDateString()}
                  </p> */}
                </div>
              </div>
            </div>
          </Card>

          {/* AI Responses Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              AI Responses ({dataset.ai_responses?.length || 0})
            </h2>

            {!dataset.ai_responses || dataset.ai_responses.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No AI responses yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {dataset.ai_responses.map((response) => (
                  <Card key={response.id} className="p-6">
                    <div className="mb-3">
                      <h3 className="font-semibold text-foreground">
                        {response.response_text}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Language: {response.language?.name || 'Unknown'} • 
                        AI Generated
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{response.acceptance_count || 0} acceptances</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{response.rejection_count || 0} rejections</span>
                      </div>
                    </div>

                    {/* Voting buttons would go here */}
                    {!votedResponseIds.includes(response.id) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-2">Vote on this response:</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                            onClick={() => handleVote(response.id, 'accept')}
                            disabled={createVote.isPending}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={() => handleVote(response.id, 'reject')}
                            disabled={createVote.isPending}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <h3 className="font-semibold text-foreground mb-4">
              Contribute to This Dataset
            </h3>
            <div className="space-y-3">
              <Link href={`/dashboard/datasets/${datasetId}/contribute`} className="block">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                  <MessageSquare className="w-4 h-4" />
                  Submit Text Response
                </Button>
              </Link>
              <Link href={`/dashboard/datasets/${datasetId}/contribute?tab=voice`} className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Mic className="w-4 h-4" />
                  Record Voice
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Response Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Responses</span>
                <span className="font-semibold text-foreground">
                  {dataset.ai_responses?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Acceptances</span>
                <span className="font-semibold text-green-600">
                  {totalAcceptances}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Rejections</span>
                <span className="font-semibold text-red-600">
                  {totalRejections}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-semibold text-foreground">
                    {dataset.response_percentage}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-primary/5">
            <h3 className="font-semibold text-foreground mb-2">
              How to Vote
            </h3>
            <p className="text-sm text-muted-foreground">
              Rate each response based on translation accuracy, cultural
              authenticity, and overall quality.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}