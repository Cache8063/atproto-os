import React from 'react'
import { AppBskyFeedDefs } from '@atproto/api'
import { PostItem } from './PostItem'

interface TimelineProps {
  posts?: AppBskyFeedDefs.FeedViewPost[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

export function Timeline({ posts = [], loading = false, error = null, onRefresh }: TimelineProps) {
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading timeline...</div>
  }
  
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {posts.map((feedItem) => (
        <PostItem
          key={feedItem.post.uri}
          post={feedItem.post}
          reason={feedItem.reason}
          feedContext="timeline"
        />
      ))}
      
      {posts.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No posts in timeline
        </div>
      )}
    </div>
  )
}
