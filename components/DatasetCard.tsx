'use client'

import Link from 'next/link'
import { Dataset } from '@/lib/types'
import { useDatasetResponseCount } from '@/lib/queries/responses'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChevronRight, Loader2 } from 'lucide-react'

interface DatasetCardProps {
  dataset: Dataset
  languageName?: string
  categoryName?: string
}

export function DatasetCard({
  dataset,
  languageName,
  categoryName,
}: DatasetCardProps) {
  const { data: responseCount, isLoading } = useDatasetResponseCount(dataset.id)
  
  const firstCategory = dataset.allowed_categories?.[0]?.name

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
      <Link href={`/dashboard/datasets/${dataset.id}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {dataset.original_text.substring(0, 100)}
              {dataset.original_text.length > 100 ? '...' : ''}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {firstCategory && (
              <Badge variant="secondary">{firstCategory}</Badge>
            )}
            {languageName && (
              <Badge variant="secondary">{languageName}</Badge>
            )}
            {categoryName && (
              <Badge variant="secondary">{categoryName}</Badge>
            )}
            <Badge variant="outline">
              Level: {dataset.level?.replace('_', ' ') || 'N/A'}
            </Badge>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex gap-4">
              <span>
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                ) : (
                  `${responseCount?.total || 0} responses`
                )}
              </span>
              {(responseCount?.accepted ?? 0) > 0 && (
                <span className="text-green-600">
                  {responseCount?.accepted ?? 0} accepted
                </span>
              )}
            </div>
            {/* <span>
              {dataset.created_at ? new Date(dataset.created_at).toLocaleDateString() : 'Recent'}
            </span> */}
          </div>
        </div>
      </Link>
    </Card>
  )
}