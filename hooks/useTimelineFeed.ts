import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { AppBskyFeedDefs } from '@atproto/api'

export interface FeedSlice {
  _reactKey: string
  uri: string
  items: AppBskyFeedDefs.PostView[]
  reason?: AppBskyFeedDefs.ReasonRepost | AppBskyFeedDefs.ReasonPin
  feedContext?: string
  source?: {
    uri: string
    cid: string
  }
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
  const { enabled = true, algorithm = 'reverse-chronological', limit = 30 } = opts
  
  return useInfiniteQuery({
    queryKey: [...TIMELINE_QUERY_KEY, algorithm],
    enabled,
    queryFn: async ({ pageParam }) => {
      // Your AT Protocol timeline fetch
      const response = await fetch('/xrpc/app.bsky.feed.getTimeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm,
          cursor: pageParam,
          limit,
        }),
      })
      
      const data = await response.json()
      
      // Transform posts into slices (like Bluesky does)
      const slices: FeedSlice[] = data.feed.map((item: any, index: number) => ({
        _reactKey: `slice-${item.post.uri}-${Date.now()}-${index}`,
        uri: item.post.uri,
        items: [item.post], // Single post per slice for now
        reason: item.reason,
        feedContext: data.feedContext,
        source: item.feedGenerator ? {
          uri: item.feedGenerator.uri,
          cid: item.feedGenerator.cid,
        } : undefined,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })
}
