import { useInfiniteQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export interface FeedSlice {
  _reactKey: string
  uri: string
  items: any[]
  reason?: any
  feedContext?: string
}

export interface FeedPage {
  cursor?: string
  slices: FeedSlice[]
  fetchedAt: number
}

export const TIMELINE_QUERY_KEY = ['timeline'] as const

export function useTimelineFeed(opts: {
  enabled?: boolean
  algorithm?: 'reverse-chronological' | 'discover'
  limit?: number
} = {}) {
  const { enabled = true, algorithm = 'reverse-chronological', limit = 50 } = opts
  const { accessJwt, isAuthenticated, handle } = useAuth()
  
  return useInfiniteQuery({
    queryKey: [...TIMELINE_QUERY_KEY, algorithm],
    enabled: enabled && isAuthenticated && !!accessJwt,
    queryFn: async ({ pageParam }) => {
      console.log('Fetching timeline directly from AT Protocol:', { hasToken: !!accessJwt, handle })
      
      // Call AT Protocol directly instead of your API route
      const url = new URL('https://bsky.social/xrpc/app.bsky.feed.getTimeline')
      if (pageParam) url.searchParams.set('cursor', pageParam)
      url.searchParams.set('limit', limit.toString())
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessJwt}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        console.error('AT Protocol timeline error:', error)
        
        // If 401, the token might be expired
        if (response.status === 401) {
          throw new Error('Authentication expired. Please log in again.')
        }
        
        throw new Error(`Timeline fetch failed: ${response.status} - ${error.message || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Timeline data received:', { feedLength: data.feed?.length, cursor: data.cursor })
      
      const slices: FeedSlice[] = (data.feed || []).map((item: any, index: number) => ({
        _reactKey: `slice-${item.post.uri}-${Date.now()}-${index}`,
        uri: item.post.uri,
        items: [item.post],
        reason: item.reason,
        feedContext: data.feedContext,
      }))
      
      const page: FeedPage = {
        cursor: data.cursor,
        slices,
        fetchedAt: Date.now(),
      }
      
      return page
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })
}
