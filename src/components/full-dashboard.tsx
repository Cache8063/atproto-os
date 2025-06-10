'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Server, 
  MessageSquare, 
  Activity, 
  AlertTriangle, 
  Users,
  Settings,
  Bell,
  Menu,
  X,
  RefreshCw,
  Send,
  Heart,
  Repeat,
  Reply
} from 'lucide-react';
import { useAuth } from '@/contexts/hybrid-auth-context';
import VersionFooter from '@/components/version-footer';

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    model: string
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    percentage: number
    totalGB: number
    usedGB: number
  }
  uptime: {
    seconds: number
    formatted: string
    days: number
    hours: number
    minutes: number
  }
  system: {
    platform: string
    architecture: string
    hostname: string
    nodeVersion: string
  }
  timestamp: string
}

const mockAlerts = [
  { id: 1, type: 'warning', message: 'High memory usage detected', time: '2 min ago' },
  { id: 2, type: 'info', message: 'PDS sync completed successfully', time: '5 min ago' },
  { id: 3, type: 'error', message: 'Failed to connect to federation peer', time: '8 min ago' }
];

// Timeline interfaces and component
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

interface TimelineData {
  posts: TimelinePost[]
  cursor: string | null
  service: string
  timestamp: string
}

const Widget = ({ title, icon: Icon, children, className = "" }: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  className?: string 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
};

const TimelineWidget = () => {
  const { isAuthenticated, session, service } = useAuth();
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  const getAuthHeaders = () => {
    if (!session || !service) return {}
    
    console.log('Timeline Widget: Creating auth headers for service:', service)
    
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
      console.log('Timeline Widget: Not authenticated or missing session/service')
      setError('Not authenticated')
      setLoading(false)
      return
    }

    try {
      setError(null)
      console.log('Timeline Widget: Fetching timeline for service:', service)
      
      const headers = getAuthHeaders()
      console.log('Timeline Widget: Request headers:', Object.keys(headers))
      
      const response = await fetch('/api/atproto/timeline?limit=6', {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })
      
      console.log('Timeline Widget: Response status:', response.status)
      
      if (response.status === 401) {
        setError('Not authenticated')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch timeline')
      }
      
      const data = await response.json()
      console.log('Timeline Widget: Successfully loaded timeline with', data.posts?.length, 'posts')
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
      console.log('Timeline Widget: Creating post for service:', service)
      
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
      console.log('Timeline Widget: Post created successfully')
      await fetchTimeline()
    } catch (error: any) {
      console.error('Post error:', error)
      setError(error.message || 'Failed to post')
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

  useEffect(() => {
    console.log('Timeline Widget: Auth state changed:', {
      isAuthenticated,
      hasSession: !!session,
      service,
      handle: session?.handle
    })
    
    if (isAuthenticated && session && service) {
      fetchTimeline()
    } else {
      setTimeline(null)
      setError('Not authenticated')
      setLoading(false)
    }
  }, [isAuthenticated, session, service])

  useEffect(() => {
    if (!isAuthenticated || !session || !service) return
    
    const interval = setInterval(() => {
      if (isAuthenticated && session && service) {
        fetchTimeline()
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [isAuthenticated, session, service])

  return (
    <Widget title="Timeline" icon={MessageSquare}>
      <div className="space-y-3 h-72 overflow-hidden flex flex-col">
        {isAuthenticated && session && service && (
          <form onSubmit={handlePost} className="flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                className="flex-1 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                maxLength={300}
                disabled={posting}
              />
              <button
                type="submit"
                disabled={!newPost.trim() || posting}
                className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center"
              >
                {posting ? (
                  <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-600">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            </div>
          ) : error ? (
            <div className="text-center p-3">
              <div className="text-red-400 text-xs mb-2">{error}</div>
              {isAuthenticated && session && service && (
                <button 
                  onClick={fetchTimeline}
                  className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : timeline?.posts.length === 0 ? (
            <div className="text-center text-gray-400 p-3 text-xs">
              No posts in timeline
            </div>
          ) : (
            timeline?.posts.map((post) => (
              <div key={post.uri} className="border-b border-gray-700/30 pb-2 last:border-b-0">
                {post.isRepost && post.repostBy && (
                  <div className="flex items-center space-x-1 text-xs text-gray-400 mb-1">
                    <Repeat className="w-2.5 h-2.5" />
                    <span className="truncate">{post.repostBy.displayName} reposted</span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <div className="flex-shrink-0">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.displayName}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">
                          {post.author.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="font-medium text-white truncate">
                        {post.author.displayName}
                      </span>
                      <span className="text-gray-400 truncate">
                        @{post.author.handle.length > 15 ? post.author.handle.substring(0, 15) + '...' : post.author.handle}
                      </span>
                      <span className="text-gray-500">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mt-0.5 text-xs text-gray-200 break-words line-clamp-3">
                      {post.text.length > 120 ? post.text.substring(0, 120) + '...' : post.text}
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-1.5 text-xs text-gray-400">
                      <div className="flex items-center space-x-0.5">
                        <Reply className="w-2.5 h-2.5" />
                        <span>{post.replyCount}</span>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <Repeat className="w-2.5 h-2.5" />
                        <span>{post.repostCount}</span>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        <Heart className="w-2.5 h-2.5" />
                        <span>{post.likeCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-shrink-0 pt-2 border-t border-gray-700/30">
          <button
            onClick={fetchTimeline}
            disabled={loading || !isAuthenticated || !session || !service}
            className="w-full px-2 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-xs flex items-center justify-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </Widget>
  )
}

const TerminalWidget = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  if (isFullscreen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed inset-4 bg-gray-900 border border-gray-700 z-50 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Terminal</h2>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-black rounded p-4 h-full font-mono text-green-400 text-sm">
          <div>user@atproto-dashboard:~$ ps aux | grep pds</div>
          <div className="text-gray-400">pds    1234  0.1  2.3  /usr/bin/pds</div>
          <div>user@atproto-dashboard:~$ <span className="animate-pulse">|</span></div>
        </div>
      </motion.div>
    );
  }

  return (
    <Widget title="Terminal" icon={Terminal}>
      <div className="bg-black rounded p-3 font-mono text-green-400 text-sm h-24">
        <div>$ tail -f /var/log/pds.log</div>
        <div className="text-gray-400 text-xs">INFO: Federation sync completed</div>
        <div>$ <span className="animate-pulse">|</span></div>
      </div>
      <button
        onClick={() => setIsFullscreen(true)}
        className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
      >
        Launch Terminal
      </button>
    </Widget>
  );
};

const FullDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setSystemMetrics(data);
      setMetricsError(null);
    } catch (error: any) {
      console.error('Error fetching system metrics:', error);
      setMetricsError('Failed to load system metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    fetchSystemMetrics();
    const metricsTimer = setInterval(fetchSystemMetrics, 5000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(metricsTimer);
    };
  }, []);

  const activeUsers = systemMetrics ? Math.floor(systemMetrics.memory.percentage * 2.3) : 0;

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
            {systemMetrics && (
              <div className="text-xs text-gray-400">
                {systemMetrics.system.hostname} • {systemMetrics.system.platform}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <button className="p-2 hover:bg-gray-700/50 rounded relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-700/50 rounded">
              <Settings className="w-5 h-5" />
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
              className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/30 p-4"
            >
              <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <MessageSquare className="w-5 h-5" />
                  <span>Timeline</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Server className="w-5 h-5" />
                  <span>SSH Console</span>
                </a>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1">
              <TerminalWidget />
            </div>
            
            <div className="lg:col-span-1">
              <TimelineWidget />
            </div>

            <div className="lg:col-span-1">
              <Widget title="System Metrics" icon={Activity}>
                {metricsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </div>
                ) : metricsError ? (
                  <div className="text-red-400 text-sm p-4 text-center">
                    {metricsError}
                    <button 
                      onClick={fetchSystemMetrics}
                      className="block mt-2 text-blue-400 hover:text-blue-300"
                    >
                      Retry
                    </button>
                  </div>
                ) : systemMetrics ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        systemMetrics.cpu.usage > 80 ? 'text-red-400' : 
                        systemMetrics.cpu.usage > 60 ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {Math.round(systemMetrics.cpu.usage)}%
                      </div>
                      <div className="text-sm text-gray-400">CPU Usage</div>
                      <div className="text-xs text-gray-500">{systemMetrics.cpu.cores} cores</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        systemMetrics.memory.percentage > 80 ? 'text-red-400' : 
                        systemMetrics.memory.percentage > 60 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {systemMetrics.memory.percentage}%
                      </div>
                      <div className="text-sm text-gray-400">Memory</div>
                      <div className="text-xs text-gray-500">
                        {systemMetrics.memory.usedGB}GB / {systemMetrics.memory.totalGB}GB
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{systemMetrics.uptime.formatted}</div>
                      <div className="text-sm text-gray-400">Uptime</div>
                      <div className="text-xs text-gray-500">
                        {systemMetrics.uptime.days > 0 && `${systemMetrics.uptime.days}d `}
                        {systemMetrics.uptime.hours}h {systemMetrics.uptime.minutes}m
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{activeUsers}</div>
                      <div className="text-sm text-gray-400">Active Users</div>
                      <div className="text-xs text-gray-500">Estimated</div>
                    </div>
                  </div>
                ) : null}
              </Widget>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <Widget title="Alerts" icon={AlertTriangle}>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {systemMetrics && systemMetrics.memory.percentage > 80 && (
                    <div className="flex items-start space-x-2 p-2 rounded bg-red-900/20 border border-red-800">
                      <div className="w-2 h-2 rounded-full mt-2 bg-red-400" />
                      <div className="flex-1">
                        <div className="text-sm text-red-300">High memory usage: {systemMetrics.memory.percentage}%</div>
                        <div className="text-xs text-red-500">Live alert</div>
                      </div>
                    </div>
                  )}
                  {systemMetrics && systemMetrics.cpu.usage > 80 && (
                    <div className="flex items-start space-x-2 p-2 rounded bg-yellow-900/20 border border-yellow-800">
                      <div className="w-2 h-2 rounded-full mt-2 bg-yellow-400" />
                      <div className="flex-1">
                        <div className="text-sm text-yellow-300">High CPU usage: {Math.round(systemMetrics.cpu.usage)}%</div>
                        <div className="text-xs text-yellow-500">Live alert</div>
                      </div>
                    </div>
                  )}
                  {mockAlerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-2 p-2 rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-400' :
                        alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm text-gray-300">{alert.message}</div>
                        <div className="text-xs text-gray-500">{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Widget>
            </div>

            <div className="lg:col-span-1">
              <Widget title="AT Protocol Stats" icon={Users}>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">1.2K</div>
                    <div className="text-sm text-gray-400">Posts Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">45</div>
                    <div className="text-sm text-gray-400">Active Peers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">98%</div>
                    <div className="text-sm text-gray-400">Sync Health</div>
                  </div>
                </div>
              </Widget>
            </div>
          </div>
        </main>
      </div>

      {/* Version Footer */}
      <VersionFooter />
    </div>
  );
};

export default FullDashboard;
