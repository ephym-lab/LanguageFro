'use client'

import { useMe } from '@/lib/queries/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Star } from 'lucide-react'

export default function MyResponsesPage() {
  const userQuery = useMe()

  if (userQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Voting History
        </h1>
        <p className="text-muted-foreground">
          View all the responses you&apos;ve voted on
        </p>
      </div>

      {/* Empty State */}
      <Card className="p-12 text-center">
        <Star className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No votes yet
        </h3>
        <p className="text-muted-foreground">
          Start voting on responses to see your history here
        </p>
      </Card>

      {/* Note: In a full implementation, this would fetch the user's votes history from the API */}
      <Card className="p-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 Your voting history is tracked on the backend. Navigate to dataset responses to see and update your votes.
        </p>
      </Card>
    </div>
  )
}
