import { useQueryClient } from '@tanstack/react-query'
import { AppBskyFeedDefs } from '@atproto/api'
import { PostShadow } from './usePostShadow'
import { TIMELINE_QUERY_KEY } from './useTimelineFeed'

export function usePostActions(post: AppBskyFeedDefs.PostView) {
  const queryClient = useQueryClient()
  
  const updatePostShadow = (uri: string, update: Partial<PostShadow>) => {
    queryClient.setQueryData(['post-shadow', uri], (prev: PostShadow = {}) => ({
      ...prev,
      ...update,
    }))
  }
  
  const invalidateTimeline = () => {
    queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY })
  }
  
  const like = async () => {
    const isLiked = !!post.viewer?.like
    const newCount = (post.likeCount || 0) + (isLiked ? -1 : 1)
    
    // Optimistic update
    updatePostShadow(post.uri, {
      likeCount: newCount,
      viewer: { 
        ...post.viewer, 
        like: isLiked ? undefined : 'temp-like-uri' 
      },
    })
    
    try {
      if (isLiked) {
        await fetch('/xrpc/com.atproto.repo.deleteRecord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: 'user.did', // Your DID
            collection: 'app.bsky.feed.like',
            rkey: post.viewer.like.split('/').pop(),
          }),
        })
      } else {
        await fetch('/xrpc/com.atproto.repo.createRecord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: 'user.did',
            collection: 'app.bsky.feed.like',
            record: {
              subject: {
                uri: post.uri,
                cid: post.cid,
              },
              createdAt: new Date().toISOString(),
            },
          }),
        })
      }
      
      // Refresh to get real data
      invalidateTimeline()
      
    } catch (error) {
      // Revert optimistic update on error
      updatePostShadow(post.uri, {
        likeCount: post.likeCount,
        viewer: { ...post.viewer },
      })
      console.error('Like action failed:', error)
    }
  }
  
  const repost = async () => {
    const isReposted = !!post.viewer?.repost
    const newCount = (post.repostCount || 0) + (isReposted ? -1 : 1)
    
    // Optimistic update
    updatePostShadow(post.uri, {
      repostCount: newCount,
      viewer: { 
        ...post.viewer, 
        repost: isReposted ? undefined : 'temp-repost-uri' 
      },
    })
    
    try {
      if (isReposted) {
        await fetch('/xrpc/com.atproto.repo.deleteRecord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: 'user.did',
            collection: 'app.bsky.feed.repost',
            rkey: post.viewer.repost.split('/').pop(),
          }),
        })
      } else {
        await fetch('/xrpc/com.atproto.repo.createRecord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repo: 'user.did',
            collection: 'app.bsky.feed.repost',
            record: {
              subject: {
                uri: post.uri,
                cid: post.cid,
              },
              createdAt: new Date().toISOString(),
            },
          }),
        })
      }
      
      invalidateTimeline()
      
    } catch (error) {
      // Revert optimistic update
      updatePostShadow(post.uri, {
        repostCount: post.repostCount,
        viewer: { ...post.viewer },
      })
      console.error('Repost action failed:', error)
    }
  }
  
  return { like, repost }
}
