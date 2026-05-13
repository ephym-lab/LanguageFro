'use client'

import { useMyResponses } from '@/lib/queries/responses'
import { useLanguage } from '@/lib/queries/languages'
import { useCategory } from '@/lib/queries/categories'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp,
  Globe,
  Tag,
  Calendar,
  Eye
} from 'lucide-react'
import { useState } from 'react'
import { ResponseObj } from '@/lib/types'

function ContributionCard({ response }: { response: ResponseObj }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: language, isLoading: isLoadingLang } = useLanguage(response.language_id)
  const { data: category, isLoading: isLoadingCat } = useCategory(response.category_id || '')

  return (
    <Card className="p-5 flex flex-col h-full hover:shadow-md transition-shadow border-muted">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {response.is_accepted ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-muted-foreground px-2 py-0">
              <XCircle className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          )}
          {response.is_ai_generated && (
            <Badge variant="outline" className="text-blue-600 border-blue-200 px-2 py-0">
              <BrainCircuit className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1">
        <p className="text-foreground font-medium line-clamp-3 mb-3">
          {response.response_text || response.content || "No content provided"}
        </p>
      </div>

      <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground mt-2 pt-3 border-t border-muted">
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          <span>{isLoadingLang ? "..." : language?.name || "Unknown"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>{isLoadingCat ? "..." : category?.name || "General"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-muted animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Detailed View</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Full Response</p>
              <p className="text-sm bg-muted/30 p-2 rounded border border-muted/50">
                {response.response_text || response.content}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Language ID</p>
                <p className="text-xs font-mono truncate">{response.language_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dataset ID</p>
                <p className="text-xs font-mono truncate">{response.dataset_id}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(response.created_at).toLocaleString()}</span>
              </div>
              <span>ID: {response.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function MyResponsesPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyResponses()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const responses = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Contributions
        </h1>
        <p className="text-muted-foreground">
          Track and manage your submitted translations and language data
        </p>
      </div>

      {responses.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No contributions yet
          </h3>
          <p className="text-muted-foreground">
            Explore datasets and start contributing to see your history here
          </p>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {responses.map((response) => (
              <ContributionCard key={response.id} response={response} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="gap-2"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Contributions
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
