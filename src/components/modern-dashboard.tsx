'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  MessageSquare, 
  Settings, 
  Activity,
  Users,
  Bell,
  RefreshCw,
  Send,
  Heart,
  Repeat,
  Reply,
  MessageCircle,
  Pause,
  Play,
  X,
  ChevronRight,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'
import { useTheme } from '@/contexts/theme-context'

interface NavigationItem {
  id: string
  label: string
  icon: any
  component: React.ComponentType<any>
}

interface TimelinePost {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName: string
    avatar?: string | null
  }
  text: string
  createdAt: string
  replyCount: number
  repostCount: number
  likeCount: number
  isRepost: boolean
  repostBy?: {
    did: string
    handle: string
    displayName: string
  } | null
  embed?: {
    type: string
    images: any[]
    external: any
  } | null
}

interface Thread {
  id: string
  rootPost: TimelinePost
  posts: TimelinePost[]
  participants: string[]
}

// Terminal Component
const TerminalView = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Terminal</h2>
      </div>
      <div 
        className="flex-1 rounded-lg p-4 font-mono text-sm"
        style={{ 
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--status-success)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <div>user@atproto-dashboard:~$ ps aux | grep pds</div>
        <div style={{ color: 'var(--text-muted)' }}>pds    1234  0.1  2.3  /usr/bin/pds</div>
        <div>user@atproto-dashboard:~$ tail -f /var/log/pds.log</div>
        <div style={{ color: 'var(--text-muted)' }}>INFO: Federation sync completed</div>
        <div>user@atproto-dashboard:~$ <span className="animate-pulse">|</span></div>
      </div>
    </div>
  )
}

// Timeline Component  
const TimelineView = ({ onShowThread }: { onShowThread: (post: TimelinePost) => void }) => {
  const { isAuthenticated, session, service } = useAuth()
  const [timeline, setTimeline] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [interactionLoading, setInteractionLoading] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

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

  const fetchTimeline = async () => {
    if (!isAuthenticated || !session || !service) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/atproto/timeline?limit=15', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      })
      
      if (response.status === 401) {
        setError('Not authenticated')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch timeline')
      }
      
      const data = await response.json()
      setTimeline(data)
      setLastRefresh(new Date())
    } catch (error: any) {
      console.error('Timeline fetch error:', error)
      setError(error.message || 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || posting || !isAuthenticated || !session || !service) return

    setPosting(true)
    try {
      const response = await fetch('/api/atproto/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ text: newPost.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post')
      }

      setNewPost('')
      await fetchTimeline()
    } catch (error: any) {
      console.error('Post error:', error)
      setError(error.message || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const handleInteraction = async (action: 'like' | 'repost' | 'reply', post: TimelinePost) => {
    if (!isAuthenticated || !session || !service || interactionLoading) return

    setInteractionLoading(post.uri)
    try {
      const response = await fetch('/api/atproto/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          action, 
          postUri: post.uri,
          postCid: post.cid,
          text: action === 'reply' ? 'Quick reply!' : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action}`)
      }

      // Show success feedback
      setError(`✓ ${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
      setTimeout(() => setError(null), 2000)

      await fetchTimeline()
    } catch (error: any) {
      console.error(`${action} error:`, error)
      setError(`Failed to ${action}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setInteractionLoading(null)
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

  useEffect(() => {
    if (isAuthenticated && session && service) {
      fetchTimeline()
    }
  }, [isAuthenticated, session, service])

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !session || !service) return
    
    const interval = setInterval(() => {
      fetchTimeline()
    }, 25000) // 25 seconds as requested (20-30 range)
    
    return () => clearInterval(interval)
  }, [autoRefresh, isAuthenticated, session, service])

  if (!isAuthenticated || !session || !service) {
    return (
      <div className="h-full flex items-center justify-center">
        <div style={{ color: 'var(--text-muted)' }}>Please log in to view timeline</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Timeline</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg"
            style={{ 
              backgroundColor: autoRefresh ? 'var(--interactive-secondary)' : 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              boxShadow: autoRefresh ? '0 0 10px var(--border-glow)' : 'none'
            }}
            title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={fetchTimeline}
            disabled={loading}
            className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px var(--border-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Post composer */}
      <form onSubmit={handlePost} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's happening?"
            className="flex-1 px-3 py-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--border-accent)'
            }}
            maxLength={300}
            disabled={posting}
          />
          <button
            type="submit"
            disabled={!newPost.trim() || posting}
            className="px-4 py-2 rounded-lg flex items-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: 'var(--interactive-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-accent)'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.boxShadow = '0 0 15px var(--border-glow)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {posting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>

      {/* Status bar */}
      {error && (
        <div 
          className="mb-3 p-2 rounded-lg text-sm"
          style={{ 
            backgroundColor: error.startsWith('✓') ? 'var(--bg-accent)' : 'rgba(239, 68, 68, 0.1)',
            color: error.startsWith('✓') ? 'var(--status-success)' : 'var(--status-error)',
            border: `1px solid ${error.startsWith('✓') ? 'var(--status-success)' : 'var(--status-error)'}`
          }}
        >
          {error}
        </div>
      )}

      {autoRefresh && (
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh: 25s
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" style={{ color: 'var(--interactive-primary)' }}></div>
          </div>
        ) : timeline?.posts.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No posts in timeline
          </div>
        ) : (
          timeline?.posts.map((post: TimelinePost) => (
            <motion.div
              key={post.uri}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-4 rounded-lg transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px var(--border-glow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {post.isRepost && post.repostBy && (
                <div className="flex items-center space-x-1 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <Repeat className="w-3 h-3" />
                  <span>{post.repostBy.displayName} reposted</span>
                </div>
              )}
              
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.displayName}
                      className="rounded-full object-cover"
                      style={{ 
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        const fallback = document.createElement('div')
                        fallback.className = 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium'
                        fallback.style.backgroundColor = 'var(--bg-tertiary)'
                        fallback.style.color = 'var(--text-primary)'
                        fallback.textContent = post.author.displayName[0]?.toUpperCase() || '?'
                        e.target.parentNode?.appendChild(fallback)
                      }}
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{ 
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {post.author.displayName[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-sm mb-1">
                    <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {post.author.displayName}
                    </span>
                    <span className="truncate" style={{ color: 'var(--text-muted)' }}>
                      @{post.author.handle}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm mb-3 break-words" style={{ color: 'var(--text-secondary)' }}>
                    {post.text}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <button
                      onClick={() => onShowThread(post)}
                      className="flex items-center space-x-1 transition-colors duration-200"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--interactive-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Thread</span>
                    </button>
                    
                    <button
                      onClick={() => handleInteraction('reply', post)}
                      disabled={!!interactionLoading}
                      className="flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.color = 'var(--status-info)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      {interactionLoading === post.uri ? (
                        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Reply className="w-4 h-4" />
                      )}
                      <span>{post.replyCount}</span>
                    </button>
                    
                    <button
                      onClick={() => handleInteraction('repost', post)}
                      disabled={!!interactionLoading}
                      className="flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.color = 'var(--status-success)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      {interactionLoading === post.uri ? (
                        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Repeat className="w-4 h-4" />
                      )}
                      <span>{post.repostCount}</span>
                    </button>
                    
                    <button
                      onClick={() => handleInteraction('like', post)}
                      disabled={!!interactionLoading}
                      className="flex items-center space-x-1 transition-colors duration-200 disabled:opacity-50"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.color = 'var(--status-error)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }}
                    >
                      {interactionLoading === post.uri ? (
                        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                      <span>{post.likeCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// Settings Component
const SettingsView = () => {
  const { currentTheme, setTheme, themes } = useTheme()
  
  return (
    <div className="h-full">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Theme</h3>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className="p-4 rounded-lg text-left transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: currentTheme.id === theme.id ? 'var(--bg-accent)' : 'var(--bg-secondary)',
                  border: `2px solid ${currentTheme.id === theme.id ? 'var(--border-accent)' : 'var(--border-primary)'}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 15px var(--border-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.interactive.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.interactive.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.status.success }}
                    />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {theme.name}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {currentTheme.id === theme.id ? 'Current theme' : 'Click to apply'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Thread View Component
const ThreadView = ({ threads, activeThread, onSelectThread, onClose }: {
  threads: Thread[]
  activeThread: Thread | null
  onSelectThread: (thread: Thread) => void
  onClose: () => void
}) => {
  if (threads.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div style={{ color: 'var(--text-muted)' }}>No threads to display</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Threads</h2>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread)}
            className="w-full p-3 rounded-lg text-left transition-all duration-300"
            style={{
              backgroundColor: activeThread?.id === thread.id ? 'var(--bg-accent)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 10px var(--border-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {thread.rootPost.author.displayName}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {thread.posts.length} posts • {thread.participants.length} participants
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Component
const ModernDashboard = () => {
  const [activeView, setActiveView] = useState<string>('timeline')
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [showThreads, setShowThreads] = useState(false)

  const navigationItems: NavigationItem[] = [
    { id: 'timeline', label: 'Timeline', icon: MessageSquare, component: TimelineView },
    { id: 'terminal', label: 'Terminal', icon: Terminal, component: TerminalView },
    { id: 'settings', label: 'Settings', icon: Settings, component: SettingsView },
  ]

  const handleShowThread = (post: TimelinePost) => {
    // Create or find thread
    const existingThread = threads.find(t => t.rootPost.uri === post.uri)
    
    if (existingThread) {
      setActiveThread(existingThread)
    } else {
      const newThread: Thread = {
        id: post.uri,
        rootPost: post,
        posts: [post],
        participants: [post.author.handle]
      }
      setThreads(prev => [...prev, newThread])
      setActiveThread(newThread)
    }
    
    setShowThreads(true)
  }

  const ActiveComponent = navigationItems.find(item => item.id === activeView)?.component || TimelineView

  return (
    <div 
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Left Navigation */}
      <div 
        className="w-64 p-6 flex flex-col"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-primary)'
        }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AT Protocol
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300 group"
              style={{
                backgroundColor: activeView === item.id ? 'var(--bg-accent)' : 'transparent',
                color: activeView === item.id ? 'var(--text-accent)' : 'var(--text-secondary)',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.boxShadow = '0 0 10px var(--border-glow)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeView !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activeView === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            v0.05a • Modern Layout
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex-1 p-6">
        <div 
          className="h-full rounded-lg p-6"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              <ActiveComponent onShowThread={handleShowThread} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Thread Panel */}
      <AnimatePresence>
        {showThreads && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '320px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '1px solid var(--border-primary)'
            }}
          >
            <div className="w-80 p-6 h-full">
              <ThreadView
                threads={threads}
                activeThread={activeThread}
                onSelectThread={setActiveThread}
                onClose={() => setShowThreads(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModernDashboard
