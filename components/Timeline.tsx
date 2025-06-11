import React from 'react'
import { useTimelineFeed } from '../hooks/useTimelineFeed'
import { PostItem } from './PostItem'
import { LoadMoreButton } from './LoadMoreButton'

export function Timeline() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useTimelineFeed()
  
  const allSlices = data?.pages.flatMap(page => page.slices) ?? []
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading timeline...</div>
  }
  
  if (isError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Failed to load timeline</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {allSlices.map(slice => (
        <div key={slice._reactKey}>
          {slice.items.map(post => (
            <PostItem
              key={post.uri}
              post={post}
              reason={slice.reason}
              feedContext={slice.feedContext}
            />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <LoadMoreButton
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
        />
      )}
    </div>
  )
}
