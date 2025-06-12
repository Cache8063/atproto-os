'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MessageCircle, 
  Heart, 
  Repeat, 
  Reply, 
  Send,
  Users,
  RefreshCw,
  ArrowLeft,
  Share
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'

interface ThreadModalProps {
  isOpen: boolean
  onClose: () => void
  thread: any
  onInteraction: (action: 'like' | 'repost' | 'reply', post: any, text?: string) => Promise<void>
}

export default function ThreadModal({ isOpen, onClose, thread, onInteraction }: ThreadModalProps) {
  const { isAuthenticated, session } = useAuth()
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyingToPost, setReplyingToPost] = useState<any>(null)
  const [interactionLoading, setInteractionLoading] = useState<{[key: string]: boolean}>({})

  // Get posts to display - use thread data if available
  const postsToDisplay = React.useMemo(() => {
    if (!thread) return []
    
    if (thread.threadData) {
      const flattenThreadData = (data: any): any[] => {
        if (!data) return []
        const posts = [data]
        if (data.replies && Array.isArray(data.replies)) {
          data.replies.forEach((reply: any) => {
            posts.push(...flattenThreadData(reply))
          })
        }
        return posts
      }
      return flattenThreadData(thread.threadData)
    }
    
    return thread.posts || []
  }, [thread])

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

  const handleInteraction = async (action: 'like' | 'repost', post: any) => {
    const interactionKey = `${post.uri}-${action}`
    if (interactionLoading[interactionKey]) return

    setInteractionLoading(prev => ({ ...prev, [interactionKey]: true }))

    try {
      await onInteraction(action, post)
    } catch (error) {
      console.error(`${action} error:`, error)
    } finally {
      setInteractionLoading(prev => {
        const updated = { ...prev }
        delete updated[interactionKey]
        return updated
      })
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || posting || !replyingToPost) return

    setPosting(true)
    try {
      await onInteraction('reply', replyingToPost, replyText.trim())
      setReplyText('')
      setReplyingToPost(null)
    } catch (error) {
      console.error('Reply error:', error)
    } finally {
      setPosting(false)
    }
  }

  const startReply = (post: any) => {
    setReplyingToPost(post)
  }

  const cancelReply = () => {
    setReplyingToPost(null)
    setReplyText('')
  }

  if (!thread) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[90vh] m-4 rounded-xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Thread
                  </h2>
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: 'var(--interactive-primary)20', color: 'var(--text-accent)' }}
                  >
                    {postsToDisplay.length} posts
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thread Content */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="p-4 space-y-4">
                {postsToDisplay.map((post, index) => (
                  <motion.div
                    key={post.uri || `post-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border overflow-hidden ${
                      index === 0 ? 'border-[var(--border-accent)]' : 'border-[var(--border-primary)]'
                    }`}
                    style={{ 
                      backgroundColor: index === 0 ? 'var(--interactive-primary)10' : 'var(--bg-primary)'
                    }}
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {post.author?.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.displayName}
                            className="rounded-full object-cover"
                            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                          />
                        ) : (
                          <div 
                            className="rounded-full flex items-center justify-center"
                            style={{ 
                              backgroundColor: 'var(--bg-tertiary)',
                              width: '40px', 
                              height: '40px',
                              minWidth: '40px',
                              minHeight: '40px'
                            }}
                          >
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {post.author?.displayName?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2 text-sm mb-2">
                          <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {post.author?.displayName || 'Unknown'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }} className="truncate">
                            @{post.author?.handle || 'unknown'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>·</span>
                          <span style={{ color: 'var(--text-muted)' }} className="whitespace-nowrap">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                          {index === 0 && (
                            <span 
                              className="text-xs px-2 py-0.5 rounded whitespace-nowrap"
                              style={{ backgroundColor: 'var(--interactive-primary)20', color: 'var(--text-accent)' }}
                            >
                              Root
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-3 text-sm leading-relaxed break-words" style={{ color: 'var(--text-primary)' }}>
                          {post.text || 'No content'}
                        </div>

                        {/* Post Actions */}
                        <div className="flex items-center justify-between max-w-md text-sm">
                          <button
                            onClick={() => startReply(post)}
                            className="flex items-center space-x-1 hover:bg-blue-400/10 p-2 rounded-full transition-colors group"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Reply className="w-4 h-4 group-hover:text-blue-400" />
                            <span className="group-hover:text-blue-400">Reply</span>
                          </button>
                          
                          <button
                            onClick={() => handleInteraction('repost', post)}
                            disabled={interactionLoading[`${post.uri}-repost`]}
                            className="flex items-center space-x-1 hover:bg-green-400/10 p-2 rounded-full transition-colors group disabled:opacity-50"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Repeat className={`w-4 h-4 group-hover:text-green-400 ${interactionLoading[`${post.uri}-repost`] ? 'animate-spin' : ''}`} />
                            <span className="group-hover:text-green-400">{post.repostCount || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => handleInteraction('like', post)}
                            disabled={interactionLoading[`${post.uri}-like`]}
                            className="flex items-center space-x-1 hover:bg-red-400/10 p-2 rounded-full transition-colors group disabled:opacity-50"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Heart className={`w-4 h-4 group-hover:text-red-400 ${interactionLoading[`${post.uri}-like`] ? 'animate-spin' : ''}`} />
                            <span className="group-hover:text-red-400">{post.likeCount || 0}</span>
                          </button>
                          
                          <button
                            className="flex items-center space-x-1 hover:bg-blue-400/10 p-2 rounded-full transition-colors group"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Share className="w-4 h-4 group-hover:text-blue-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {replyingToPost && isAuthenticated && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t overflow-hidden"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Replying to <span style={{ color: 'var(--text-accent)' }}>@{replyingToPost.author?.handle}</span>
                      </div>
                      <button
                        onClick={cancelReply}
                        className="text-sm hover:opacity-75"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <form onSubmit={handleReply} className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-3 py-2 rounded border resize-none text-sm"
                        style={{ 
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        rows={3}
                        maxLength={300}
                        disabled={posting}
                        autoFocus
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {300 - replyText.length} characters remaining
                        </div>
                        
                        <button
                          type="submit"
                          disabled={!replyText.trim() || posting}
                          className="px-4 py-2 rounded flex items-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          style={{ 
                            backgroundColor: 'var(--interactive-primary)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {posting ? (
                            <div 
                              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                              style={{ borderColor: 'var(--text-primary)' }}
                            />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>{posting ? 'Posting...' : 'Reply'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
