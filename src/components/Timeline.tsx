'use client'
import React, { useState, useEffect, useCallback } from 'react'

interface TimelineProps {
  feedType?: 'timeline' | 'notifications'
}

interface Post {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName: string
    avatar?: string
  }
  record: {
    text: string
    createdAt: string
  }
  replyCount: number
  repostCount: number
  likeCount: number
}

interface FeedItem {
  post: Post
  reason?: any // Simplified type to avoid build errors
}

export function Timeline({ feedType = 'timeline' }: TimelineProps) {
  const [posts, setPosts] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      setError(null)
      // Mock data for now - replace with real API call
      setPosts([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [feedType])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchPosts}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No posts found
        </div>
      )}
    </div>
  )
}
