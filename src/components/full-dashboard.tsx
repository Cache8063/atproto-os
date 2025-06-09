'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, 
  Activity, 
  AlertTriangle, 
  Users,
  Settings,
  Bell,
  Menu,
  X,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  LogOut,
  User,
  Home
} from 'lucide-react'
import { BskyAgent } from '@atproto/api'

// Types
interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  active: boolean
}

interface AuthCredentials {
  identifier: string
  password: string
}

interface Post {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
  record: {
    text: string
    createdAt: string
  }
  embed?: {
    images?: Array<{
      alt: string
      image: {
        ref: string
      }
    }>
  }
  replyCount: number
  repostCount: number
  likeCount: number
}

// AT Protocol Authentication
class ATProtoAuth {
  private agent: BskyAgent
  private session: AuthSession | null = null

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social'
    })
  }

  private async resolveServiceFromHandle(identifier: string): Promise<string> {
    if (identifier.includes('@') && identifier.includes('.')) {
      return 'https://bsky.social'
    }
    
    if (identifier.includes('.') && !identifier.endsWith('.bsky.social')) {
      try {
        const parts = identifier.split('.')
        if (parts.length >= 2) {
          const domain = parts.slice(-2).join('.')
          return `https://${domain}`
        }
      } catch (error) {
        console.log('Custom domain resolution failed:', error)
      }
    }
    
    return 'https://bsky.social'
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const serviceUrl = await this.resolveServiceFromHandle(credentials.identifier)
      
      this.agent = new BskyAgent({
        service: String(serviceUrl)
      })

      console.log(`Attempting login to: ${serviceUrl}`)
      const response = await this.agent.login(credentials)
      
      if (response.success && this.agent.session) {
        this.session = {
          accessJwt: this.agent.session.accessJwt,
          refreshJwt: this.agent.session.refreshJwt,
          handle: this.agent.session.handle,
          did: this.agent.session.did,
          active: this.agent.session.active || true
        }
        console.log(`Successfully logged in to ${serviceUrl} as @${this.session.handle}`)
        return this.session
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('AT Protocol login error:', error)
      
      if (String(this.agent.service) !== 'https://bsky.social') {
        console.log('Custom PDS login failed, retrying with bsky.social...')
        try {
          this.agent = new BskyAgent({
            service: 'https://bsky.social'
          })
          
          console.log('Attempting fallback login to: https://bsky.social')
          const response = await this.agent.login(credentials)
          
          if (response.success && this.agent.session) {
            this.session = {
              accessJwt: this.agent.session.accessJwt,
              refreshJwt: this.agent.session.refreshJwt,
              handle: this.agent.session.handle,
              did: this.agent.session.did,
              active: this.agent.session.active || true
            }
            console.log(`Successfully logged in to bsky.social as @${this.session.handle}`)
            return this.session
          }
        } catch (fallbackError) {
          console.error('Fallback login to bsky.social also failed:', fallbackError)
          throw new Error(`Login failed on both custom PDS and bsky.social: ${fallbackError}`)
        }
      }
      
      throw error
    }
  }

  async getTimeline(): Promise<Post[]> {
    if (!this.session) throw new Error('Not authenticated')
    
    try {
      const response = await this.agent.getTimeline({
        limit: 20
      })
      
      return response.data.feed.map((item: any) => ({
        uri: String(item.post.uri),
        cid: String(item.post.cid),
        author: {
          did: String(item.post.author.did),
          handle: String(item.post.author.handle),
          displayName: item.post.author.displayName ? String(item.post.author.displayName) : undefined,
          avatar: item.post.author.avatar ? String(item.post.author.avatar) : undefined
        },
        record: {
          text: String(item.post.record.text || ''),
          createdAt: String(item.post.record.createdAt)
        },
        embed: item.post.embed?.images ? {
          images: item.post.embed.images.map((img: any) => ({
            alt: String(img.alt || ''),
            image: { ref: String(img.image.ref) }
          }))
        } : undefined,
        replyCount: Number(item.post.replyCount) || 0,
        repostCount: Number(item.post.repostCount) || 0,
        likeCount: Number(item.post.likeCount) || 0
      }))
    } catch (error) {
      console.error('Error fetching timeline:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.session = null
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  getServiceUrl(): string {
    return String(this.agent.service) || 'https://bsky.social'
  }
}

const atprotoAuth = new ATProtoAuth()

// Login Modal Component
function LoginModal({ onClose, onLogin, loading = false }: {
  onClose: () => void
  onLogin: (credentials: AuthCredentials) => Promise<void>
  loading?: boolean
}) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')

    if (!identifier || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await onLogin({ identifier, password })
      onClose()
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.message?.includes('Invalid identifier')) {
        setError('Invalid username/handle. Check your handle format.')
      } else if (error.message?.includes('Invalid password')) {
        setError('Incorrect password. Please try again.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setError('Network error. Check your connection or PDS server.')
      } else {
        setError('Login failed. Check your credentials and try again.')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Login to AT Protocol</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Handle or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="handle.bsky.social or your.domain"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Bluesky handles, custom domains, or email addresses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Timeline Post Component
function TimelinePost({ post }: { post: Post }) {
  const [imageError, setImageError] = useState(false)
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return `${Math.floor(diffMins / 1440)}d`
  }

  return (
    <div className="border-b border-gray-700 p-4 hover:bg-gray-800/30 transition-all duration-300">
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          {post.author.avatar && !imageError ? (
            <img 
              src={String(post.author.avatar)} 
              alt={String(post.author.handle)}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <User className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-semibold text-white">
              {String(post.author.displayName || post.author.handle)}
            </span>
            <span className="text-gray-400">@{String(post.author.handle)}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatTime(post.record.createdAt)}</span>
          </div>
          
          <div className="mt-1 text-white whitespace-pre-wrap text-sm leading-relaxed">
            {String(post.record.text)}
          </div>

          {post.embed?.images && post.embed.images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.embed.images.slice(0, 4).map((img, index) => (
                <div 
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-700"
                >
                  <img
                    src={`https://cdn.bsky.app/img/feed_thumbnail/plain/${post.author.did}/${img.image.ref}@jpeg`}
                    alt={img.alt || 'Image'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-6 mt-3 text-gray-400">
            <button className="flex items-center space-x-1 hover:text-blue-400 transition-all duration-300 transform hover:scale-105">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{String(post.replyCount || 0)}</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-green-400 transition-all duration-300 transform hover:scale-105">
              <Repeat2 className="w-4 h-4" />
              <span className="text-sm">{String(post.repostCount || 0)}</span>
            </button>
            
            <button className="flex items-center space-x-1 hover:text-red-400 transition-all duration-300 transform hover:scale-105">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{String(post.likeCount || 0)}</span>
            </button>
            
            <button className="hover:text-gray-300 transition-all duration-300 transform hover:scale-105">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <button className="p-1 hover:bg-gray-700 rounded-full transition-all duration-200">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}

// Timeline Component
function Timeline() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    try {
      setLoading(true)
      setError('')
      const timelinePosts = await atprotoAuth.getTimeline()
      setPosts(timelinePosts)
    } catch (err) {
      setError('Failed to load timeline')
      console.error('Timeline error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={loadTimeline}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-700">
      {posts.map((post) => (
        <TimelinePost key={post.uri} post={post} />
      ))}
    </div>
  )
}

// Widget Component
function Widget({ title, icon: Icon, children, className = '' }: {
  title: string
  icon: React.ComponentType<any>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6 hover:border-gray-600/50 transition-all duration-400 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('timeline')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    if (!atprotoAuth.isAuthenticated()) {
      setShowLogin(true)
    } else {
      setSession(atprotoAuth.getSession())
    }

    setCurrentTime(new Date().toLocaleTimeString())
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogin = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const newSession = await atprotoAuth.login(credentials)
      setSession(newSession)
      setShowLogin(false)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await atprotoAuth.logout()
    setSession(null)
    setShowLogin(true)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <AnimatePresence>
          {showLogin && (
            <LoginModal
              onClose={() => setShowLogin(false)}
              onLogin={handleLogin}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  const mockMetrics = {
    cpu: 45,
    memory: 62,
    pdsUptime: '99.9%',
    activeUsers: 127
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700/50 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">AT Protocol Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              {currentTime}
            </div>
            <div className="text-sm text-blue-400">
              @{String(session.handle)}
            </div>
            <div className="text-xs text-gray-500 hidden md:block">
              {(() => {
                try {
                  return String(atprotoAuth.getServiceUrl())
                } catch (e) {
                  return 'https://bsky.social'
                }
              })()}
            </div>
            <button className="p-2 hover:bg-gray-700/50 rounded relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-700/50 rounded"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/30 p-4"
            >
              <nav className="space-y-2">
                <button
                  onClick={() => setCurrentView('timeline')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 ${
                    currentView === 'timeline' ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Timeline</span>
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 ${
                    currentView === 'dashboard' ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setCurrentView('terminal')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-all duration-300 ${
                    currentView === 'terminal' ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </button>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1">
          {currentView === 'timeline' && (
            <div className="max-w-sm mx-auto border-x border-gray-700 min-h-screen">
              <div className="sticky top-0 bg-gray-900/90 backdrop-blur-md border-b border-gray-700 p-4">
                <h2 className="text-xl font-bold">Home Timeline</h2>
              </div>
              <Timeline />
            </div>
          )}

          {currentView === 'dashboard' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Widget title="System Metrics" icon={Activity}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{mockMetrics.cpu}%</div>
                      <div className="text-sm text-gray-400">CPU Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{mockMetrics.memory}%</div>
                      <div className="text-sm text-gray-400">Memory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{mockMetrics.pdsUptime}</div>
                      <div className="text-sm text-gray-400">PDS Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{mockMetrics.activeUsers}</div>
                      <div className="text-sm text-gray-400">Active Users</div>
                    </div>
                  </div>
                </Widget>

                <Widget title="Account Info" icon={User}>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Handle</span>
                      <span className="text-blue-400">@{String(session.handle)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status</span>
                      <span className="text-green-400">Connected</span>
                    </div>
                  </div>
                </Widget>

                <Widget title="Quick Actions" icon={Settings}>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                      Refresh Timeline
                    </button>
                    <button className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm">
                      View Profile
                    </button>
                  </div>
                </Widget>
              </div>
            </div>
          )}

          {currentView === 'terminal' && (
            <div className="p-6">
              <Widget title="Terminal" icon={Terminal} className="h-96">
                <div className="bg-black rounded p-4 h-full font-mono text-green-400 text-sm">
                  <div>user@atproto-dashboard:~$ ps aux | grep bsky</div>
                  <div className="text-gray-400">Connected to {session.handle}</div>
                  <div>user@atproto-dashboard:~$ <span className="animate-pulse">|</span></div>
                </div>
              </Widget>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}