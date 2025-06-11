import React from 'react'
import { AppBskyFeedDefs } from '@atproto/api'
import { usePostShadow } from '../hooks/usePostShadow'
import { usePostActions } from '../hooks/usePostActions'

interface PostItemProps {
  post: AppBskyFeedDefs.PostView
  reason?: AppBskyFeedDefs.ReasonRepost | AppBskyFeedDefs.ReasonPin
  feedContext?: string
}

export function PostItem({ post: originalPost, reason, feedContext }: PostItemProps) {
  const post = usePostShadow(originalPost) // Apply optimistic updates
  const { like, repost } = usePostActions(post)
  
  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50">
      {/* Reason (repost/pin indicator) */}
      {reason && (
        <div className="text-sm text-gray-500 mb-2">
          {reason.$type === 'app.bsky.feed.defs#reasonRepost' && (
            <>�� Reposted by @{reason.by.handle}</>
          )}
          {reason.$type === 'app.bsky.feed.defs#reasonPin' && (
            <>📌 Pinned</>
          )}
        </div>
      )}
      
      {/* Post header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.author.avatar}
          alt={`@${post.author.handle}`}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold">{post.author.displayName}</div>
          <div className="text-gray-500 text-sm">@{post.author.handle}</div>
        </div>
        <div className="text-gray-500 text-sm ml-auto">
          {new Date(post.indexedAt).toLocaleDateString()}
        </div>
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap">{post.record?.text}</p>
      </div>
      
      {/* Post actions */}
      <div className="flex items-center gap-6 text-gray-500">
        <button
          onClick={like}
          className={`flex items-center gap-1 hover:text-red-500 ${
            post.viewer?.like ? 'text-red-500' : ''
          }`}
        >
          ❤️ {post.likeCount || 0}
        </button>
        
        <button
          onClick={repost}
          className={`flex items-center gap-1 hover:text-green-500 ${
            post.viewer?.repost ? 'text-green-500' : ''
          }`}
        >
          🔄 {post.repostCount || 0}
        </button>
        
        <button className="flex items-center gap-1 hover:text-blue-500">
          💬 {post.replyCount || 0}
        </button>
      </div>
    </article>
  )
}
