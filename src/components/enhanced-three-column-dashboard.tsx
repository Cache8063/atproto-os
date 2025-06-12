'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  MessageSquare, 
  Activity, 
  Settings,
  Bell,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  Home,
  Search,
  AtSign
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'
import { useTheme } from '@/contexts/theme-context'
import VersionFooter from '@/components/version-footer'
import TimelineView from '@/components/timeline-view'
import ThreadView from '@/components/thread-view'
import ThreadModal from '@/components/thread-modal'
import SystemMetricsView from '@/components/system-metrics-view'
import TerminalView from '@/components/terminal-view'
import NotificationsView from '@/components/notifications-view'
import PWAInstallPrompt from '@/components/pwa-install-prompt'
import OfflineIndicator from '@/components/offline-indicator'

export type ViewType = 'timeline' | 'notifications' | 'terminal' | 'metrics' | 'settings' | null

export interface ThreadData {
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

interface NavigationItem {
  id: ViewType
  label: string
  icon: React.ElementType
  description?: string
  badge?: number
}

const navigationItems: NavigationItem[] = [
  { id: 'timeline', label: 'Home', icon: Home, description: 'Your timeline feed' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Mentions and replies', badge: 3 },
  { id: 'terminal', label: 'Terminal', icon: Terminal, description: 'System command interface' },
  { id: 'metrics', label: 'System', icon: Activity, description: 'Performance monitoring' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration and preferences' }
]

export default function EnhancedThreeColumnDashboard() {
  const { session, logout } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('timeline')
  const [threads, setThreads] = useState<ThreadData[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [modalThread, setModalThread] = useState<ThreadData | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [navigationPath, setNavigationPath] = useState(['Dashboard'])
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date().toLocaleTimeString())
    
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timeTimer)
  }, [])

  const getAuthHeaders = () => {
    if (!session || !session.accessJwt) return {}
    
    return {
      'Authorization': `Bearer ${session.accessJwt}`,
      'X-AT-Session': JSON.stringify({
        handle: session.handle,
        did: session.did,
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt
      }),
      'X-AT-Service': 'https://bsky.social' // You might want to make this configurable
    }
  }

  const handleViewChange = (view: ViewType) => {
    setActiveView(view)
    const viewLabel = navigationItems.find(item => item.id === view)?.label || 'Dashboard'
    setNavigationPath(['Dashboard', viewLabel])
  }

  const handleOpenThread = (post: any, threadData?: any) => {
    console.log('handleOpenThread called with post:', post)
    console.log('Thread data received:', threadData)
    
    const threadId = `thread-${post.uri}`
    
    // Process thread data to create posts array
    let postsArray = [post] // Start with the original post
    
    if (threadData) {
      // Flatten the thread data recursively to get all posts
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
      
      const flattenedPosts = flattenThreadData(threadData)
      console.log('Flattened thread posts:', flattenedPosts)
      postsArray = flattenedPosts.filter(p => p && p.uri) // Filter out invalid posts
    }
    
    const newThread: ThreadData = {
      id: threadId,
      rootPost: post,
      posts: postsArray,
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar
      },
      threadData: threadData // Store the full thread data
    }

    console.log('New thread being created:', newThread)

    // On mobile or when explicitly requested, show modal instead of sidebar
    if (isMobile || threads.length >= 2) {
      setModalThread(newThread)
    } else {
      // Check if thread already exists in sidebar
      const existingThread = threads.find(t => t.id === threadId)
      if (existingThread) {
        setActiveThread(threadId)
      } else {
        setThreads(prev => [...prev, newThread])
        setActiveThread(threadId)
      }
    }
  }

  const handleCloseThread = (threadId: string) => {
    console.log('Closing thread:', threadId)
    setThreads(prev => prev.filter(t => t.id !== threadId))
    if (activeThread === threadId) {
      const remainingThreads = threads.filter(t => t.id !== threadId)
      setActiveThread(remainingThreads.length > 0 ? remainingThreads[0].id : null)
    }
  }

  const handleModalInteraction = async (action: 'like' | 'repost' | 'reply', post: any, text?: string) => {
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
          text: text
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action}`)
      }

      // Optionally refresh the thread data here
      console.log(`${action} successful on post ${post.uri}`)
      
    } catch (error) {
      console.error(`${action} error:`, error)
      throw error
    }
  }

  const renderSettingsPanel = () => (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Configure your dashboard preferences and appearance
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Theme</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(themes).map(([themeKey, themeConfig]) => (
            <button
              key={themeKey}
              onClick={() => setTheme(themeKey as any)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                theme === themeKey ? 'border-[var(--border-accent)]' : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
              }`}
              style={{ backgroundColor: theme === themeKey ? 'var(--interactive-primary)15' : 'var(--bg-secondary)' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: themeConfig.colors['bg-accent'], borderColor: themeConfig.colors['border-accent'] }}
                />
                <div className="text-left">
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{themeConfig.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{themeConfig.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {session && (
        <div className="space-y-4 pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Account</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{session.handle}</div>
              <div className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{session.did}</div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded border transition-colors hover:bg-red-600/10"
              style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderMainContent = () => {
    switch (activeView) {
      case 'timeline': 
        return <TimelineView onOpenThread={handleOpenThread} />
      case 'notifications':
        return <NotificationsView onOpenThread={handleOpenThread} />
      case 'terminal': return <TerminalView />
      case 'metrics': return <SystemMetricsView />
      case 'settings': return renderSettingsPanel()
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center" style={{ color: 'var(--text-muted)' }}>
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select an option from the sidebar</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen flex flex-col text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)' }}>
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />

      {/* Header */}
      <header className="flex-shrink-0 border-b backdrop-blur-sm" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)50' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded hover:opacity-75 md:block hidden"
              style={{ color: 'var(--text-secondary)' }}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>@dashboard</h1>
              <div className="flex items-center space-x-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                {navigationPath.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span>/</span>}
                    <span className={`truncate ${index === navigationPath.length - 1 ? 'text-[var(--text-accent)]' : ''}`}>{item}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }} suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <button 
              onClick={() => handleViewChange('notifications')}
              className="p-2 rounded relative hover:opacity-75" 
              style={{ color: 'var(--text-secondary)' }}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: 'var(--status-error)', fontSize: '10px' }}>3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Hidden on mobile */}
        <motion.aside
          animate={{ width: isMobile ? 0 : (sidebarCollapsed ? 80 : 280) }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="flex-shrink-0 md:block hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="p-4 h-full flex flex-col overflow-hidden">
            <nav className="space-y-2 flex-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = activeView === item.id
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${isActive ? 'border' : 'hover:opacity-75'}`}
                    style={{
                      backgroundColor: isActive ? 'var(--interactive-primary)20' : 'transparent',
                      borderColor: isActive ? 'var(--border-accent)' : 'transparent',
                      color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className="relative">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.badge && (
                        <span 
                          className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-xs flex items-center justify-center font-medium"
                          style={{ backgroundColor: 'var(--status-error)', color: 'var(--text-primary)', fontSize: '10px' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden min-w-0"
                        >
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{item.label}</span>
                            {item.description && <div className="text-xs opacity-75 mt-1 truncate">{item.description}</div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </nav>

            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-8 border-t overflow-hidden"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <div className="text-xs uppercase tracking-wider mb-3 truncate" style={{ color: 'var(--text-muted)' }}>Quick Actions</div>
                  <button className="w-full flex items-center space-x-3 p-2 rounded text-sm transition-colors hover:opacity-75 overflow-hidden" style={{ color: 'var(--text-secondary)' }}>
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">User Directory</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Center Timeline */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView || 'empty'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full overflow-hidden"
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Threads Panel - Hidden on mobile */}
        <AnimatePresence>
          {threads.length > 0 && !isMobile && (
            <motion.aside
              key="thread-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <ThreadView
                threads={threads}
                activeThread={activeThread}
                onThreadSelect={setActiveThread}
                onCloseThread={handleCloseThread}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Thread Modal for mobile or overflow */}
      <ThreadModal
        isOpen={!!modalThread}
        onClose={() => setModalThread(null)}
        thread={modalThread}
        onInteraction={handleModalInteraction}
      />

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="flex-shrink-0 border-t md:hidden" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className="flex-1 flex flex-col items-center py-2 px-1 text-xs transition-colors"
                  style={{ color: isActive ? 'var(--text-accent)' : 'var(--text-muted)' }}
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6" />
                    {item.badge && (
                      <span 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center"
                        style={{ backgroundColor: 'var(--status-error)', color: 'var(--text-primary)', fontSize: '8px' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 truncate">{item.label}</span>
                </button>
              )
            })}
            <button
              onClick={() => handleViewChange('settings')}
              className="flex-1 flex flex-col items-center py-2 px-1 text-xs"
              style={{ color: activeView === 'settings' ? 'var(--text-accent)' : 'var(--text-muted)' }}
            >
              <Settings className="w-6 h-6" />
              <span className="mt-1">More</span>
            </button>
          </div>
        </nav>
      )}

      <VersionFooter />
    </div>
  )
}
