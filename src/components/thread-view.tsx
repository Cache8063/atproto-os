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
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'

interface ThreadData {
  id: string
  rootPost: any
  posts: any[]
  author: {
    handle: string
    displayName: string
    avatar?: string
  }
  threadData?: any // Full thread data from AT Protocol
}

interface ThreadViewProps {
  threads: ThreadData[]
  activeThread: string | null
  onThreadSelect: (threadId: string) => void
  onCloseThread: (threadId: string) => void
}

interface ThreadParticipant {
  did: string
  handle: string
  displayName: string
  avatar?: string
  postCount: number
  lastActive: string
}

// Helper function to flatten thread data recursively
const flattenThreadData = (threadData: any): any[] => {
  if (!threadData) return []
  
  const posts = [threadData]
  
  if (threadData.replies && Array.isArray(threadData.replies)) {
    threadData.replies.forEach((reply: any) => {
      posts.push(...flattenThreadData(reply))
    })
  }
  
  return posts
}

export default function ThreadView({ 
  threads, 
  activeThread, 
  onThreadSelect, 
  onCloseThread 
}: ThreadViewProps) {
  const { isAuthenticated, session, service } = useAuth()
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [participants, setParticipants] = useState<ThreadParticipant[]>([])
  const [showParticipants, setShowParticipants] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const currentThread = threads.find(t => t.id === activeThread)

  // Calculate thread participants from thread data
  useEffect(() => {
    if (!currentThread) return

    console.log('Calculating participants for thread:', currentThread.id)
    console.log('Thread data:', currentThread.threadData)
    console.log('Posts:', currentThread.posts)

    const participantMap = new Map<string, ThreadParticipant>()
    
    // Use thread data if available, otherwise fall back to posts
    let postsToProcess = []
    
    if (currentThread.threadData) {
      // Flatten the thread data recursively
      postsToProcess = flattenThreadData(currentThread.threadData)
      console.log('Using thread data, flattened posts:', postsToProcess.length)
    } else {
      postsToProcess = currentThread.posts
      console.log('Using fallback posts:', postsToProcess.length)
    }
    
    postsToProcess.forEach(post => {
      const author = post.author
      if (!author || !author.did) return

      if (participantMap.has(author.did)) {
        const existing = participantMap.get(author.did)!
        existing.postCount += 1
        existing.lastActive = post.createdAt || existing.lastActive
      } else {
        participantMap.set(author.did, {
          did: author.did,
          handle: author.handle,
          displayName: author.displayName,
          avatar: author.avatar,
          postCount: 1,
          lastActive: post.createdAt || new Date().toISOString()
        })
      }
    })

    const participantsList = Array.from(participantMap.values()).sort((a, b) => b.postCount - a.postCount)
    console.log('Calculated participants:', participantsList.length)
    setParticipants(participantsList)
  }, [currentThread])

  const getAuthHeaders = () => {
    if (!session || !service) return {}
    
    return {
      'Authorization': `Bearer ${session.accessJwt}`,
      'X-AT-Session': JSON.stringify({
        handle: session.handle,
        did: session.did,
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt
      }),
      'X-AT-Service': service
    }
  }

  const refreshThread = async () => {
    if (!currentThread || !currentThread.rootPost) return
    
    setRefreshing(true)
    try {
      const response = await fetch(`/api/atproto/thread?uri=${encodeURIComponent(currentThread.rootPost.uri)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Thread refreshed:', data.thread)
        
        // TODO: Update the thread data in the parent component
        // This would require a callback from the parent
      }
    } catch (error) {
      console.error('Thread refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || posting || !currentThread || !isAuthenticated) return

    setPosting(true)
    try {
      const response = await fetch('/api/atproto/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          action: 'reply',
          postUri: currentThread.rootPost.uri,
          postCid: currentThread.rootPost.cid,
          text: replyText.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reply')
      }

      setReplyText('')
      // Refresh the thread to show the new reply
      setTimeout(() => refreshThread(), 1000)
    } catch (error: any) {
      console.error('Reply error:', error)
    } finally {
      setPosting(false)
    }
  }

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

  if (!currentThread) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
            <MessageCircle className="w-5 h-5" />
            <span>Conversations</span>
          </h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click on a post to start a conversation</p>
            <p className="text-sm mt-1">Threads will appear here for easy discussion</p>
          </div>
        </div>
      </div>
    )
  }

  // Get posts to display - use thread data if available
  let postsToDisplay = []
  if (currentThread.threadData) {
    postsToDisplay = flattenThreadData(currentThread.threadData)
    console.log('Displaying from thread data:', postsToDisplay.length, 'posts')
  } else {
    postsToDisplay = currentThread.posts
    console.log('Displaying from fallback posts:', postsToDisplay.length, 'posts')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Tabs */}
      {threads.length > 1 && (
        <div className="p-2 border-b flex space-x-1 overflow-x-auto" style={{ borderColor: 'var(--border-primary)' }}>
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm whitespace-nowrap transition-all duration-200 ${
                activeThread === thread.id ? 'border' : 'hover:opacity-75'
              }`}
              style={{
                backgroundColor: activeThread === thread.id ? 'var(--interactive-primary)20' : 'transparent',
                borderColor: activeThread === thread.id ? 'var(--border-accent)' : 'transparent',
                color: activeThread === thread.id ? 'var(--text-accent)' : 'var(--text-secondary)'
              }}
            >
              {thread.author.avatar ? (
                <img
                  src={thread.author.avatar}
                  alt={thread.author.displayName}
                  className="rounded-full object-cover"
                  style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px' }}
                />
              ) : (
                <div 
                  className="rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)',
                    width: '16px', 
                    height: '16px', 
                    minWidth: '16px', 
                    minHeight: '16px' 
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {thread.author.displayName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <span>{thread.author.displayName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseThread(thread.id)
                }}
                className="hover:bg-red-500/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Thread Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Thread</h3>
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: 'var(--interactive-primary)20', color: 'var(--text-accent)' }}
            >
              {postsToDisplay.length} posts
            </span>
            {currentThread.threadData && (
              <span 
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'var(--status-success)20', color: 'var(--status-success)' }}
              >
                Full thread
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshThread}
              disabled={refreshing}
              className="p-1 rounded hover:opacity-75"
              style={{ color: 'var(--text-secondary)' }}
              title="Refresh thread"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-1 rounded hover:opacity-75"
              style={{ color: 'var(--text-secondary)' }}
              title="Show participants"
            >
              <Users className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:opacity-75"
              style={{ color: 'var(--text-secondary)' }}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onCloseThread(currentThread.id)}
              className="p-1 rounded hover:opacity-75"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Participants Panel */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Participants ({participants.length})
              </div>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.did} className="flex items-center space-x-2 text-sm">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.displayName}
                        className="rounded-full object-cover"
                        style={{ width: '24px', height: '24px', minWidth: '24px', minHeight: '24px' }}
                      />
                    ) : (
                      <div 
                        className="rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'var(--bg-tertiary)',
                          width: '24px', 
                          height: '24px', 
                          minWidth: '24px', 
                          minHeight: '24px' 
                        }}
                      >
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                          {participant.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {participant.displayName}
                      </div>
                      <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{participant.postCount} posts</span>
                        <span>•</span>
                        <span>{formatTimeAgo(participant.lastActive)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thread Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {postsToDisplay.map((post, index) => (
                <motion.div
                  key={post.uri || `post-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    index === 0 ? 'border-[var(--border-accent)]' : 'border-[var(--border-primary)]'
                  }`}
                  style={{ 
                    backgroundColor: index === 0 ? 'var(--interactive-primary)10' : 'var(--bg-secondary)'
                  }}
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.displayName}
                          className="rounded-full object-cover"
                          style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                        />
                      ) : (
                        <div 
                          className="rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: 'var(--bg-tertiary)',
                            width: '32px', 
                            height: '32px', 
                            minWidth: '32px', 
                            minHeight: '32px' 
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {post.author?.displayName?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {post.author?.displayName || 'Unknown'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          @{post.author?.handle || 'unknown'}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {formatTimeAgo(post.createdAt)}
                        </span>
                        {index === 0 && (
                          <span 
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: 'var(--interactive-primary)20', color: 'var(--text-accent)' }}
                          >
                            Root
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm break-words" style={{ color: 'var(--text-primary)' }}>
                        {post.text || 'No content'}
                      </div>

                      <div className="flex items-center space-x-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <button className="flex items-center space-x-1 hover:opacity-75">
                          <Reply className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:opacity-75">
                          <Heart className="w-3 h-3" />
                          <span>{post.likeCount || 0}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:opacity-75">
                          <Repeat className="w-3 h-3" />
                          <span>{post.repostCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reply Form */}
            {isAuthenticated && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add to this conversation..."
                    className="w-full px-3 py-2 rounded border resize-none text-sm"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                    rows={3}
                    maxLength={300}
                    disabled={posting}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
