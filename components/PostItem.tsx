import React from 'react'
import { AppBskyFeedDefs } from '@atproto/api'

interface PostItemProps {
  post: AppBskyFeedDefs.PostView
  reason?: AppBskyFeedDefs.ReasonRepost
  feedContext?: string
}

export function PostItem({ post, reason, feedContext }: PostItemProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffMs = now.getTime() - posted.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 30) return `${diffDays}d`
    return posted.toLocaleDateString()
  }

  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50">
      {/* Reason (repost indicator) */}
      {reason && (
        <div className="text-sm text-gray-500 mb-2">
          {reason.$type === 'app.bsky.feed.defs#reasonRepost' && (
            <>🔄 Reposted by @{reason.by.handle}</>
          )}
        </div>
      )}
      
      {/* Post header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={post.author.avatar || ''}
          alt={`@${post.author.handle}`}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold">{post.author.displayName || post.author.handle}</div>
          <div className="text-gray-500 text-sm">@{post.author.handle}</div>
        </div>
        <div className="text-gray-500 text-sm ml-auto">
          {formatTimeAgo(post.indexedAt)}
        </div>
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        <p className="whitespace-pre-wrap">
          {typeof post.record === 'object' && post.record && 'text' in post.record 
            ? (post.record as any).text 
            : 'No content'
          }
        </p>
      </div>
      
      {/* Post actions */}
      <div className="flex items-center gap-6 text-gray-500">
        <button className="flex items-center gap-1 hover:text-red-500">
          ❤️ {post.likeCount || 0}
        </button>
        
        <button className="flex items-center gap-1 hover:text-green-500">
          🔄 {post.repostCount || 0}
        </button>
        
        <button className="flex items-center gap-1 hover:text-blue-500">
          💬 {post.replyCount || 0}
        </button>
      </div>
    </article>
  )
}
