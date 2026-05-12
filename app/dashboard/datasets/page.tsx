'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDatasets } from '@/lib/queries/datasets'
import { DatasetCard } from '@/components/DatasetCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterParams } from '@/lib/types'
import { Loader2, ChevronDown } from 'lucide-react'

export default function DatasetsPage() {
  const [filters, setFilters] = useState<FilterParams>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  // Debounce search term - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // Adjust delay as needed (300-500ms is good)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Apply search filter when debounced value changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearchTerm || undefined,
    }))
  }, [debouncedSearchTerm])

  // Queries
  const datasetsQuery = useDatasets(filters)

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  // Loading states
  if (datasetsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  const datasets = datasetsQuery.data?.pages.flatMap((page) => page.items) || []
  const hasMore = datasetsQuery.hasNextPage

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Datasets</h1>
        <p className="text-muted-foreground">
          Browse and vote on language datasets and translations
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Search Datasets
          </label>
          <Input
            placeholder="Search by text..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm !== debouncedSearchTerm && (
            <p className="text-xs text-muted-foreground mt-1">
              Searching...
            </p>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {datasets.length} of {datasetsQuery.data?.pages[0]?.total || 0} datasets
        {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
      </div>

      {/* Datasets Grid */}
      <div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {datasets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {debouncedSearchTerm ? 'No datasets found matching your search.' : 'No datasets found.'}
              </p>
            </div>
          ) : (
            datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              onClick={() => datasetsQuery.fetchNextPage()}
              disabled={datasetsQuery.isFetchingNextPage}
              variant="outline"
            >
              {datasetsQuery.isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More
                  <ChevronDown className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}