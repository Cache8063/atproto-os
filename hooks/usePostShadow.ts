import { useQueryClient } from '@tanstack/react-query'
import { AppBskyFeedDefs } from '@atproto/api'

export interface PostShadow {
  likeUri?: string | null
  likeCount?: number
  repostUri?: string | null
  repostCount?: number
  replyCount?: number
  viewer?: {
    like?: string
    repost?: string
  }
}

export function usePostShadow(post: AppBskyFeedDefs.PostView) {
  const queryClient = useQueryClient()
  
  const shadow = queryClient.getQueryData<PostShadow>(['post-shadow', post.uri])
  
  if (!shadow) return post
  
  // Apply shadow updates
  return {
    ...post,
    likeCount: shadow.likeCount ?? post.likeCount,
    repostCount: shadow.repostCount ?? post.repostCount,
    replyCount: shadow.replyCount ?? post.replyCount,
    viewer: {
      ...post.viewer,
      like: shadow.viewer?.like ?? post.viewer?.like,
      repost: shadow.viewer?.repost ?? post.viewer?.repost,
    },
  }
}
