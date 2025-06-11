'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { PostView } from './PostView'
import { RefreshButton } from '../ui/RefreshButton'

interface TimelineProps {
  feedType: 'timeline' | 'notifications'
  refreshInterval?: number
  onPostClick?: (post: any) => void
}

export function Timeline({ 
  feedType, 
  refreshInterval = 300000, // 5 minutes
  onPostClick 
}: TimelineProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [hasNewPosts, setHasNewPosts] = useState(false)
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/atproto/${feedType}`)
      if (!response.ok) throw new Error(`Failed to fetch ${feedType}`)
      
      const data = await response.json()
      setPosts(data.posts || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setIsLoading(false)
    }
  }, [feedType])

  // Initial load
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Periodic refresh check
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/atproto/${feedType}`)
        if (!response.ok) return
        
        const data = await response.json()
        if (data.posts?.[0]?.cid !== posts[0]?.cid) {
          setHasNewPosts(true)
        }
      } catch (error) {
        console.error('Failed to check for new posts:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [feedType, posts])

  // Handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleRefresh = useCallback(async () => {
    setHasNewPosts(false)
    await fetchPosts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchPosts])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (isLoading) {
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
    <div className="relative">
      {/* New posts indicator */}
      {(hasNewPosts || isScrolledDown) && (
        <RefreshButton
          onClick={hasNewPosts ? handleRefresh : scrollToTop}
          showIndicator={hasNewPosts}
          label={hasNewPosts ? 'Load new posts' : 'Scroll to top'}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-10"
        />
      )}

      {/* Timeline */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostView
            key={post.uri}
            post={post}
            onClick={() => onPostClick?.(post)}
            feedType={feedType}
          />
        ))}
      </div>

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-text-medium">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium mb-2">Nothing here yet</h3>
          <p className="text-sm text-center max-w-md">
            {feedType === 'timeline' 
              ? "Your timeline will show posts from accounts you follow."
              : "You'll see notifications when people interact with your posts."
            }
          </p>
        </div>
      )}
    </div>
  )
}
