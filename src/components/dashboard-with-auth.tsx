import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  User
} from 'lucide-react'
import { BskyAgent } from '@atproto/api'

// Auth Types
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
  service?: string
}

// Login Modal Component
function LoginModal({ onLogin, loading }: { 
  onLogin: (credentials: AuthCredentials) => Promise<void>
  loading: boolean 
}) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [customService, setCustomService] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async () => {
    setError('')

    if (!identifier || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      // Determine service endpoint
      let serviceEndpoint = 'https://bsky.social'
      
      if (customService) {
        serviceEndpoint = customService.startsWith('http') ? customService : `https://${customService}`
      } else if (identifier.includes('.') && !identifier.includes('@')) {
        // Handle-based service detection
        const handleParts = identifier.split('.')
        if (handleParts.length >= 2) {
          const domain = handleParts.slice(-2).join('.')
          if (domain !== 'bsky.social') {
            serviceEndpoint = `https://${domain}`
          }
        }
      }

      await onLogin({ 
        identifier, 
        password, 
        service: serviceEndpoint 
      })
    } catch (error) {
      setError('Invalid credentials, connection error, or unsupported PDS')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md"
      >
        <div className="flex items-center space-x-3 mb-6">
          <LogIn className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Login to AT Protocol</h2>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="your-handle.bsky.social or email@example.com"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <div className="mt-1 text-xs text-gray-400">
              Supports handles from any AT Protocol PDS
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Your password"
                className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-400 hover:text-blue-300 mb-2"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="space-y-3 p-3 bg-gray-900/50 rounded border border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom PDS Service (Optional)
                  </label>
                  <input
                    type="text"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    placeholder="https://your-pds.example.com or pds.example.com"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div className="mt-1 text-xs text-gray-400">
                    Leave empty to auto-detect from handle or use Bluesky
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Don't have an account? <a href="https://bsky.app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Sign up on Bluesky</a></p>
          <p className="mt-2 text-xs">
            Supports any AT Protocol PDS • <a href="https://atproto.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Learn about federation</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Widget Component
function Widget({ title, icon: Icon, children, className = "" }: {
  title: string
  icon: any
  children: React.ReactNode
  className?: string
}) {
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
  )
}

// Terminal Widget
function TerminalWidget() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  if (isFullscreen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed inset-4 bg-gray-900 border border-gray-700 z-40 p-6 rounded-xl"
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
        <div className="bg-black rounded p-4 h-full font-mono text-green-400 text-sm overflow-auto">
          <div>user@atproto-dashboard:~$ ps aux | grep atproto</div>
          <div className="text-gray-400">atproto  1234  0.1  2.3  /usr/bin/atproto-pds</div>
          <div>user@atproto-dashboard:~$ tail -f /var/log/atproto.log</div>
          <div className="text-gray-400">[INFO] AT Protocol PDS listening on port 3000</div>
          <div className="text-gray-400">[INFO] Federation sync completed successfully</div>
          <div>user@atproto-dashboard:~$ <span className="animate-pulse">|</span></div>
        </div>
      </motion.div>
    )
  }

  return (
    <Widget title="Terminal" icon={Terminal}>
      <div className="bg-black rounded p-3 font-mono text-green-400 text-sm h-24">
        <div>$ tail -f /var/log/atproto.log</div>
        <div className="text-gray-400 text-xs">[INFO] Federation sync completed</div>
        <div>$ <span className="animate-pulse">|</span></div>
      </div>
      <button
        onClick={() => setIsFullscreen(true)}
        className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
      >
        Launch Terminal
      </button>
    </Widget>
  )
}

// Main Dashboard Component
function Dashboard({ session, serviceEndpoint, onLogout }: { 
  session: AuthSession; 
  serviceEndpoint: string;
  onLogout: () => void 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const mockMetrics = {
    cpu: 45,
    memory: 62,
    pdsUptime: '99.9%',
    activeUsers: 127
  }
  
  const mockAlerts = [
    { id: 1, type: 'warning' as const, message: 'High memory usage detected', time: '2 min ago' },
    { id: 2, type: 'info' as const, message: 'PDS sync completed successfully', time: '5 min ago' },
    { id: 3, type: 'error' as const, message: 'Failed to connect to federation peer', time: '8 min ago' }
  ]

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date().toLocaleTimeString())
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
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
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <button className="p-2 hover:bg-gray-700/50 rounded relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-700/50 rounded">
              <User className="w-4 h-4" />
              <span className="text-sm">{session.handle}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-700/50 rounded text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/30 p-4"
            >
              <nav className="space-y-2">
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 bg-gray-700/30">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Server className="w-5 h-5" />
                  <span>PDS Management</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <MessageSquare className="w-5 h-5" />
                  <span>Posts</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </a>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Terminal Widget - spans 2 columns on larger screens */}
            <div className="lg:col-span-2">
              <TerminalWidget />
            </div>
            
            {/* System Metrics */}
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

            {/* AT Protocol Status */}
            <Widget title="AT Protocol Status" icon={Server}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Connection</span>
                  <span className="text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">PDS</span>
                  <span className="text-blue-400 text-xs">{new URL(serviceEndpoint).hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Handle</span>
                  <span className="text-blue-400">{session.handle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">DID</span>
                  <span className="text-gray-400 text-xs font-mono">{session.did.slice(0, 20)}...</span>
                </div>
                <div className="pt-2">
                  <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            </Widget>

            {/* Alerts */}
            <Widget title="Alerts" icon={AlertTriangle}>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mockAlerts.map((alert) => (
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
        </main>
      </div>
    </div>
  )
}

// Main App Component
export default function ATProtocolDashboard() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [serviceEndpoint, setServiceEndpoint] = useState<string>('https://bsky.social')

  const handleLogin = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const endpoint = credentials.service || 'https://bsky.social'
      
      const agent = new BskyAgent({
        service: endpoint
      })

      const response = await agent.login({
        identifier: credentials.identifier,
        password: credentials.password
      })
      
      if (response.success && agent.session) {
        const newSession: AuthSession = {
          accessJwt: agent.session.accessJwt,
          refreshJwt: agent.session.refreshJwt,
          handle: agent.session.handle,
          did: agent.session.did,
          active: agent.session.active || true
        }

        setSession(newSession)
        setServiceEndpoint(endpoint)
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setSession(null)
    setServiceEndpoint('https://bsky.social')
  }

  if (!session) {
    return <LoginModal onLogin={handleLogin} loading={loading} />
  }

  return <Dashboard session={session} serviceEndpoint={serviceEndpoint} onLogout={handleLogout} />
}