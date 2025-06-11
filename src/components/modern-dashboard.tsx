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
  ChevronLeft,
  User,
  LogOut,
  Menu,
  Palette,
  ChevronsLeft,
  ChevronsRight,
  SkipBack,
  SkipForward,
  Home
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'
import { useTheme } from '@/contexts/theme-context'

interface NavigationItem {
  id: string
  label: string
  icon: any
  component: React.ComponentType<any>
  children?: NavigationItem[]
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

interface NavigationState {
  path: string[]
  level: number
}

// Navigation breadcrumb component
const NavigationBreadcrumb = ({ 
  navigationState, 
  onNavigate, 
  maxLevels = 5 
}: {
  navigationState: NavigationState
  onNavigate: (level: number) => void
  maxLevels?: number
}) => {
  const canGoBack = navigationState.level > 0
  const canGoForward = navigationState.level < navigationState.path.length - 1
  const canGoToStart = navigationState.level > 0
  const canGoToEnd = navigationState.level < navigationState.path.length - 1

  return (
    <div className="flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <button
        onClick={() => onNavigate(0)}
        disabled={!canGoToStart}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Go to start"
      >
        <SkipBack className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onNavigate(Math.max(0, navigationState.level - maxLevels))}
        disabled={!canGoBack}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Back 5 levels"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onNavigate(navigationState.level - 1)}
        disabled={!canGoBack}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Back"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center space-x-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        {navigationState.path.slice(0, navigationState.level + 1).map((item, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onNavigate(index)}
              className="hover:underline"
              style={{ color: index === navigationState.level ? 'var(--text-accent)' : 'var(--text-muted)' }}
            >
              {item}
            </button>
            {index < navigationState.level && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onNavigate(navigationState.level + 1)}
        disabled={!canGoForward}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Forward"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onNavigate(Math.min(navigationState.path.length - 1, navigationState.level + maxLevels))}
        disabled={!canGoForward}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Forward 5 levels"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => onNavigate(navigationState.path.length - 1)}
        disabled={!canGoToEnd}
        className="p-1 rounded transition-all duration-200 disabled:opacity-50"
        style={{ color: 'var(--text-muted)' }}
        title="Go to end"
      >
        <SkipForward className="w-4 h-4" />
      </button>
    </div>
  )
}

// Reply Modal Component
const ReplyModal = ({ post, onClose, onReply }: {
  post: TimelinePost
  onClose: () => void
  onReply: (text: string) => Promise<void>
}) => {
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || sending) return

    setSending(true)
    try {
      await onReply(replyText.trim())
      onClose()
    } catch (error) {
      console.error('Reply error:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-lg p-6"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Reply to {post.author.displayName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {post.author.displayName}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {post.text.length > 100 ? post.text.substring(0, 100) + '...' : post.text}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="w-full px-3 py-2 rounded-lg text-sm resize-none h-24 focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--border-accent)'
            }}
            maxLength={300}
            disabled={sending}
            autoFocus
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {replyText.length}/300
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-300"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyText.trim() || sending}
                className="px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-300 disabled:opacity-50"
                style={{ 
                  backgroundColor: 'var(--interactive-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-accent)'
                }}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Reply</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Left Controls Panel
const LeftControlsPanel = ({ 
  leftPanelMode, 
  setLeftPanelMode,
  onRefresh,
  refreshing,
  autoRefresh,
  setAutoRefresh,
  onLogout,
  activeView,
  setActiveView 
}: {
  leftPanelMode: 'full' | 'icons' | 'collapsed'
  setLeftPanelMode: (mode: 'full' | 'icons' | 'collapsed') => void
  onRefresh: () => void
  refreshing: boolean
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
  onLogout: () => void
  activeView: string
  setActiveView: (view: string) => void
}) => {
  const topLevelItems = [
    { id: 'timeline', label: 'Timeline', icon: MessageSquare },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  if (leftPanelMode === 'collapsed') {
    return (
      <div 
        className="w-12 p-2 flex flex-col border-r"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <button
          onClick={() => setLeftPanelMode('icons')}
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-4"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Expand menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (leftPanelMode === 'icons') {
    return (
      <div 
        className="w-16 p-2 flex flex-col border-r"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)'
        }}
      >
        <button
          onClick={() => setLeftPanelMode('full')}
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-4"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Expand menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {topLevelItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-2"
            style={{
              backgroundColor: activeView === item.id ? 'var(--bg-accent)' : 'transparent',
              color: activeView === item.id ? 'var(--text-accent)' : 'var(--text-secondary)',
            }}
            title={item.label}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-2"
          style={{ 
            backgroundColor: autoRefresh ? 'var(--interactive-secondary)' : 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            boxShadow: autoRefresh ? '0 0 10px var(--border-glow)' : 'none'
          }}
          title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
        >
          {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg mb-2"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={onLogout}
          className="p-2 rounded-lg transition-all duration-300 hover:shadow-lg"
          style={{ 
            backgroundColor: 'var(--status-error)',
            color: 'var(--text-primary)'
          }}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div 
      className="w-64 p-4 flex flex-col border-r"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            AT Protocol
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Dashboard v0.05a
          </p>
        </div>
        <button
          onClick={() => setLeftPanelMode('icons')}
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--text-muted)' }}
          title="Collapse to icons"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          MAIN
        </div>
        {topLevelItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-300"
            style={{
              backgroundColor: activeView === item.id ? 'var(--bg-accent)' : 'transparent',
              color: activeView === item.id ? 'var(--text-accent)' : 'var(--text-secondary)',
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

      <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          CONTROLS
        </div>
        
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-300"
          style={{ 
            backgroundColor: autoRefresh ? 'var(--interactive-secondary)' : 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            boxShadow: autoRefresh ? '0 0 10px var(--border-glow)' : 'none'
          }}
        >
          {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-sm">Auto-refresh</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-300 disabled:opacity-50"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-2 rounded-lg text-left transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--status-error)',
            color: 'var(--text-primary)'
          }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  )
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
const TimelineView = ({ 
  onShowThread,
  onRefresh,
  refreshing,
  autoRefresh,
  lastRefresh 
}: { 
  onShowThread: (post: TimelinePost) => void
  onRefresh: () => void
  refreshing: boolean
  autoRefresh: boolean
  lastRefresh: Date
}) => {
  const { isAuthenticated, session, service } = useAuth()
  const [timeline, setTimeline] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [interactionLoading, setInteractionLoading] = useState<string | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyingTo, setReplyingTo] = useState<TimelinePost | null>(null)

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

  const fetchTimeline = async (skipLoadingState = false) => {
    if (!isAuthenticated || !session || !service) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    if (!skipLoadingState) setLoading(true)
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
      // Refresh timeline after posting
      await fetchTimeline(true) // Skip loading state to maintain position
    } catch (error: any) {
      console.error('Post error:', error)
      setError(error.message || 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const handleInteraction = async (action: 'like' | 'repost' | 'reply', post: TimelinePost) => {
    if (!isAuthenticated || !session || !service || interactionLoading) return

    if (action === 'reply') {
      setReplyingTo(post)
      setShowReplyModal(true)
      return
    }

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
          postCid: post.cid
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action}`)
      }

      // Show success feedback without refreshing timeline
      setError(`✓ ${action.charAt(0).toUpperCase() + action.slice(1)} successful!`)
      setTimeout(() => setError(null), 2000)

      // Update the specific post in the timeline instead of refetching
      if (timeline?.posts) {
        const updatedPosts = timeline.posts.map((p: TimelinePost) => {
          if (p.uri === post.uri) {
            return {
              ...p,
              [action === 'like' ? 'likeCount' : 'repostCount']: p[action === 'like' ? 'likeCount' : 'repostCount'] + 1
            }
          }
          return p
        })
        setTimeline(prev => ({ ...prev, posts: updatedPosts }))
      }
    } catch (error: any) {
      console.error(`${action} error:`, error)
      setError(`Failed to ${action}`)
      setTimeout(() => setError(null), 3000)
    } finally {
      setInteractionLoading(null)
    }
  }

  const handleReply = async (text: string) => {
    if (!replyingTo || !isAuthenticated || !session || !service) return

    const response = await fetch('/api/atproto/interact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ 
        action: 'reply', 
        postUri: replyingTo.uri,
        postCid: replyingTo.cid,
        text
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to reply')
    }

    setError('✓ Reply sent successfully!')
    setTimeout(() => setError(null), 2000)
    
    // Update reply count without full refresh
    if (timeline?.posts) {
      const updatedPosts = timeline.posts.map((p: TimelinePost) => {
        if (p.uri === replyingTo.uri) {
          return { ...p, replyCount: p.replyCount + 1 }
        }
        return p
      })
      setTimeline(prev => ({ ...prev, posts: updatedPosts }))
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

  // Handle external refresh calls
  useEffect(() => {
    if (refreshing) {
      fetchTimeline(true)
    }
  }, [refreshing])

  if (!isAuthenticated || !session || !service) {
    return (
      <div className="h-full flex items-center justify-center">
        <div style={{ color: 'var(--text-muted)' }}>Please log in to view timeline</div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Timeline</h2>
          {autoRefresh && (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh: 5 min
            </div>
          )}
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
                        <Reply className="w-4 h-4" />
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

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && replyingTo && (
          <ReplyModal
            post={replyingTo}
            onClose={() => {
              setShowReplyModal(false)
              setReplyingTo(null)
            }}
            onReply={handleReply}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Settings Component
const SettingsView = ({ onShowThemeSettings }: { onShowThemeSettings: () => void }) => {
  return (
    <div className="h-full">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h2>
      
      <div className="space-y-4">
        <button
          onClick={onShowThemeSettings}
          className="w-full p-4 rounded-lg text-left transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 15px var(--border-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5" style={{ color: 'var(--interactive-secondary)' }} />
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                Theme Settings
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Customize colors and appearance
              </div>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} />
          </div>
        </button>
      </div>
    </div>
  )
}

// Theme Settings Component
const ThemeSettingsView = () => {
  const { currentTheme, setTheme, themes } = useTheme()
  
  return (
    <div className="h-full">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Theme Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Choose Theme</h3>
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
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Threads</h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ color: 'var(--text-muted)' }}>
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Click "Thread" on any post to start a conversation view</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Threads ({threads.length})
        </h2>
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
          <motion.button
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-1">
              <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {thread.rootPost.author.displayName}
              </span>
              {activeThread?.id === thread.id && (
                <span className="text-xs px-2 py-1 rounded" style={{ 
                  backgroundColor: 'var(--interactive-primary)', 
                  color: 'var(--text-primary)' 
                }}>
                  Active
                </span>
              )}
            </div>
            <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              {thread.rootPost.text.length > 50 ? 
                thread.rootPost.text.substring(0, 50) + '...' : 
                thread.rootPost.text}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {thread.posts.length} post{thread.posts.length !== 1 ? 's' : ''} • {thread.participants.length} participant{thread.participants.length !== 1 ? 's' : ''}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Component
const ModernDashboard = () => {
  const { logout } = useAuth()
  const [leftPanelMode, setLeftPanelMode] = useState<'full' | 'icons' | 'collapsed'>('full')
  const [activeView, setActiveView] = useState<string>('timeline')
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [showThreads, setShowThreads] = useState(false)
  const [showThemeSettings, setShowThemeSettings] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Navigation state for deep navigation
  const [navigationState, setNavigationState] = useState<NavigationState>({
    path: ['Timeline'],
    level: 0
  })

  const handleRefresh = () => {
    setRefreshing(true)
    setLastRefresh(new Date())
    // The refreshing state will be picked up by the TimelineView component
    setTimeout(() => setRefreshing(false), 1000) // Reset after 1 second
  }

  const handleShowThread = (post: TimelinePost) => {
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

  const handleShowThemeSettings = () => {
    setShowThemeSettings(true)
    setNavigationState({
      path: ['Settings', 'Theme Settings'],
      level: 1
    })
  }

  const handleNavigate = (level: number) => {
    setNavigationState(prev => ({ ...prev, level }))
    
    // Handle navigation logic
    if (level === 0) {
      setShowThemeSettings(false)
    }
  }

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      handleRefresh()
    }, 300000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [autoRefresh])

  // Determine what to show in middle column
  const renderMiddleContent = () => {
    if (showThemeSettings) {
      return <ThemeSettingsView />
    }

    switch (activeView) {
      case 'timeline':
        return (
          <TimelineView 
            onShowThread={handleShowThread}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            autoRefresh={autoRefresh}
            lastRefresh={lastRefresh}
          />
        )
      case 'terminal':
        return <TerminalView />
      case 'settings':
        return <SettingsView onShowThemeSettings={handleShowThemeSettings} />
      default:
        return <TimelineView onShowThread={handleShowThread} onRefresh={handleRefresh} refreshing={refreshing} autoRefresh={autoRefresh} lastRefresh={lastRefresh} />
    }
  }

  return (
    <div 
      className="min-h-screen w-full flex"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Left Navigation Panel */}
      <LeftControlsPanel
        leftPanelMode={leftPanelMode}
        setLeftPanelMode={setLeftPanelMode}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onLogout={logout}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Middle Content Column */}
      <div className="flex-1 min-w-0 p-6 flex flex-col">
        {/* Navigation breadcrumb for deep navigation */}
        {navigationState.path.length > 1 && (
          <div className="mb-4">
            <NavigationBreadcrumb
              navigationState={navigationState}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        <div 
          className="flex-1 h-full w-full rounded-lg p-6"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showThemeSettings ? 'theme-settings' : activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              {renderMiddleContent()}
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
            className="overflow-hidden border-l"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)'
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
