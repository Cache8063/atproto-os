import React, { memo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal } from 'lucide-react'

interface PostViewProps {
  post: any
  onClick?: () => void
  feedType: string
}

export const PostView = memo(function PostView({ post, onClick, feedType }: PostViewProps) {
  const handleInteraction = async (action: 'like' | 'repost' | 'reply', e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/atproto/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          uri: post.uri,
          cid: post.cid,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to ${action}`)
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error)
    }
  }

  return (
    <article
      onClick={onClick}
      className="p-4 hover:bg-bg-contrast-25 transition-colors cursor-pointer"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full overflow-hidden">
            {post.author.avatar && (
              <img 
                src={post.author.avatar} 
                alt={post.author.displayName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-text truncate">
                {post.author.displayName || post.author.handle}
              </span>
              <span className="text-text-medium text-sm">
                @{post.author.handle}
              </span>
              <span className="text-text-low text-sm">·</span>
              <time className="text-text-low text-sm">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>
        
        <button 
          className="p-1 hover:bg-bg-contrast-50 rounded-full transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-text-medium" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-text leading-relaxed whitespace-pre-wrap">
          {post.record.text}
        </p>
      </div>

      {/* Post Media */}
      {post.embed?.images && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <div className={`grid gap-1 ${post.embed.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.embed.images.slice(0, 4).map((image: any, index: number) => (
              <img
                key={index}
                src={image.thumb}
                alt={image.alt || ''}
                className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
              />
            ))}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between max-w-md">
        <button
          onClick={(e) => handleInteraction('reply', e)}
          className="flex items-center space-x-2 text-text-medium hover:text-blue-400 transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-400/10">
            <MessageCircle className="w-4 h-4" />
          </div>
          {post.replyCount > 0 && (
            <span className="text-sm">{post.replyCount}</span>
          )}
        </button>

        <button
          onClick={(e) => handleInteraction('repost', e)}
          className={`flex items-center space-x-2 transition-colors group ${
            post.viewer?.repost 
              ? 'text-green-400' 
              : 'text-text-medium hover:text-green-400'
          }`}
        >
          <div className="p-2 rounded-full group-hover:bg-green-400/10">
            <Repeat2 className="w-4 h-4" />
          </div>
          {post.repostCount > 0 && (
            <span className="text-sm">{post.repostCount}</span>
          )}
        </button>

        <button
          onClick={(e) => handleInteraction('like', e)}
          className={`flex items-center space-x-2 transition-colors group ${
            post.viewer?.like 
              ? 'text-red-400' 
              : 'text-text-medium hover:text-red-400'
          }`}
        >
          <div className="p-2 rounded-full group-hover:bg-red-400/10">
            <Heart className={`w-4 h-4 ${post.viewer?.like ? 'fill-current' : ''}`} />
          </div>
          {post.likeCount > 0 && (
            <span className="text-sm">{post.likeCount}</span>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex items-center space-x-2 text-text-medium hover:text-blue-400 transition-colors group"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-400/10">
            <Share className="w-4 h-4" />
          </div>
        </button>
      </div>
    </article>
  )
})
