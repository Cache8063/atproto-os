import React from 'react'

interface PostViewProps {
  post: {
    uri: string
    cid: string
    author: {
      did: string
      handle: string
      displayName: string
      avatar?: string
    }
    record?: {
      text: string
    }
    text?: string
    indexedAt: string
    replyCount?: number
    repostCount?: number
    likeCount?: number
    viewer?: {
      like?: string
      repost?: string
    }
  }
  reason?: any
  feedContext?: string
}

export function PostItem({ post, reason, feedContext }: PostViewProps) {
  const displayText = post.record?.text || post.text || ''
  
  return (
    <article className="border-b border-gray-200 p-4 hover:bg-gray-50">
      {reason && (
        <div className="text-sm text-gray-500 mb-2">
          {reason.$type === 'app.bsky.feed.defs#reasonRepost' && (
            <>🔄 Reposted by @{reason.by?.handle}</>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt={`@${post.author.handle}`}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="font-semibold">{post.author.displayName}</div>
          <div className="text-gray-500 text-sm">@{post.author.handle}</div>
        </div>
        <div className="text-gray-500 text-sm ml-auto">
          {new Date(post.indexedAt).toLocaleDateString()}
        </div>
      </div>
      
      <div className="mb-4">
        <p className="whitespace-pre-wrap">{displayText}</p>
      </div>
      
      <div className="flex items-center gap-6 text-gray-500 text-sm">
        <span>💬 {post.replyCount || 0}</span>
        <span>🔄 {post.repostCount || 0}</span>
        <span>❤️ {post.likeCount || 0}</span>
      </div>
    </article>
  )
}
