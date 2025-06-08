import React, { createContext, useContext, useState, useEffect } from 'react';
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
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Shield,
  User
} from 'lucide-react';
// Mock AT Protocol implementation for demonstration

// Types
interface AuthSession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
  active: boolean;
}

interface AuthCredentials {
  identifier: string;
  password: string;
}

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  userProfile: any;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock AT Protocol Auth Service
class MockATProtoAuth {
  // Mock user database for demo
  private mockUsers = {
    'demo.bsky.social': {
      password: 'demo123',
      profile: {
        handle: 'demo.bsky.social',
        did: 'did:plc:demo123456789abcdef',
        displayName: 'Demo User',
        description: '🚀 Testing AT Protocol Dashboard integration. Building the future of decentralized social media!',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face',
        followersCount: 1247,
        followsCount: 892,
        postsCount: 156,
        verified: true
      }
    },
    'alice.bsky.social': {
      password: 'alice123',
      profile: {
        handle: 'alice.bsky.social',
        did: 'did:plc:alice789012345abcdef',
        displayName: 'Alice Cooper',
        description: 'Developer • Open Source Enthusiast • Coffee Lover ☕',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=128&h=128&fit=crop&crop=face',
        followersCount: 523,
        followsCount: 301,
        postsCount: 89,
        verified: false
      }
    },
    'test@example.com': {
      password: 'test123',
      profile: {
        handle: 'test.bsky.social',
        did: 'did:plc:test345678901abcdef',
        displayName: 'Test Account',
        description: 'This is a test account for AT Protocol Dashboard demo',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&crop=face',
        followersCount: 42,
        followsCount: 37,
        postsCount: 12,
        verified: false
      }
    }
  };

  async login(credentials: AuthCredentials): Promise<{ success: boolean; session?: AuthSession; profile?: any }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers[credentials.identifier as keyof typeof this.mockUsers];
    
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid credentials');
    }

    const session: AuthSession = {
      accessJwt: 'mock_access_jwt_' + Date.now(),
      refreshJwt: 'mock_refresh_jwt_' + Date.now(),
      handle: user.profile.handle,
      did: user.profile.did,
      active: true
    };

    return {
      success: true,
      session,
      profile: user.profile
    };
  }
}

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mockAuth] = useState(() => new MockATProtoAuth());

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    try {
      const response = await mockAuth.login(credentials);
      
      if (response.success && response.session) {
        setSession(response.session);
        setUserProfile(response.profile);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('AT Protocol login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setSession(null);
    setUserProfile(null);
  };

  const isAuthenticated = session !== null;

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      login,
      logout,
      isAuthenticated,
      userProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Modal Component
const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    setError('');

    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({ identifier, password });
      onClose();
    } catch (error) {
      setError('Invalid credentials or connection error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <LogIn className="w-6 h-6 text-blue-400" />
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
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="your-handle.bsky.social"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
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

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
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
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p className="mb-3">Demo Accounts (for testing):</p>
          <div className="bg-gray-900/50 rounded p-3 text-left space-y-1">
            <div className="text-xs">
              <strong className="text-white">demo.bsky.social</strong> / <span className="text-gray-300">demo123</span>
            </div>
            <div className="text-xs">
              <strong className="text-white">alice.bsky.social</strong> / <span className="text-gray-300">alice123</span>
            </div>
            <div className="text-xs">
              <strong className="text-white">test@example.com</strong> / <span className="text-gray-300">test123</span>
            </div>
          </div>
          <p className="mt-3">
            <span className="text-yellow-400">Note:</span> This is a demo using mock AT Protocol data
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Widget Component
const Widget: React.FC<{ title: string; icon: React.ComponentType<any>; children: React.ReactNode; className?: string }> = 
  ({ title, icon: Icon, children, className = '' }) => {
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

// User Profile Widget
const UserProfileWidget: React.FC = () => {
  const { userProfile, session } = useAuth();

  if (!userProfile || !session) return null;

  return (
    <Widget title="Your Profile" icon={User}>
      <div className="flex items-center space-x-4">
        {userProfile.avatar && (
          <img 
            src={userProfile.avatar} 
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-white">{userProfile.displayName || session.handle}</h4>
          <p className="text-gray-400 text-sm">@{session.handle}</p>
          <div className="flex space-x-4 mt-2 text-sm">
            <span className="text-blue-400">{userProfile.followersCount || 0} followers</span>
            <span className="text-green-400">{userProfile.followsCount || 0} following</span>
            <span className="text-yellow-400">{userProfile.postsCount || 0} posts</span>
          </div>
        </div>
      </div>
      {userProfile.description && (
        <p className="mt-4 text-gray-300 text-sm">{userProfile.description}</p>
      )}
    </Widget>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, session, logout, userProfile } = useAuth();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mockMetrics = {
    cpu: 45,
    memory: 62,
    pdsUptime: '99.9%',
    activeUsers: 127
  };

  const mockAlerts = [
    { id: 1, type: 'success' as const, message: 'Connected to Demo AT Protocol', time: '1 min ago' },
    { id: 2, type: 'info' as const, message: 'Mock profile data loaded', time: '3 min ago' },
    { id: 3, type: 'warning' as const, message: 'Demo environment active', time: '5 min ago' }
  ];

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
            <h1 className="text-xl font-bold">AT Protocol Dashboard <span className="text-xs bg-yellow-600 px-2 py-1 rounded text-black font-normal">DEMO</span></h1>
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">Demo Mode</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            {isAuthenticated && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">@{session?.handle}</span>
                </div>
                <button className="p-2 hover:bg-gray-700/50 rounded relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-700/50 rounded"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
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
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 bg-gray-700/30">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <MessageSquare className="w-5 h-5" />
                  <span>Posts</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Users className="w-5 h-5" />
                  <span>Followers</span>
                </a>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6">
          {isAuthenticated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Profile Widget */}
              <div className="lg:col-span-2">
                <UserProfileWidget />
              </div>
              
              {/* AT Protocol Status */}
              <Widget title="AT Protocol Status" icon={Shield}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Connection</span>
                    <span className="text-yellow-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Demo Mode</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Service</span>
                    <span className="text-blue-400">Demo Environment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">DID</span>
                    <span className="text-gray-400 text-xs font-mono">
                      {session?.did.slice(0, 20)}...
                    </span>
                  </div>
                  <div className="text-xs text-yellow-400 bg-yellow-900/20 rounded p-2 mt-3">
                    🧪 This is a demonstration using mock AT Protocol data
                  </div>
                </div>
              </Widget>

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

              {/* Terminal Widget */}
              <Widget title="Terminal" icon={Terminal}>
                <div className="bg-black rounded p-3 font-mono text-green-400 text-sm h-24">
                  <div>$ atproto status --demo</div>
                  <div className="text-gray-400 text-xs">✅ Demo: Connected as {session?.handle}</div>
                  <div className="text-blue-400 text-xs">🧪 Mock Environment Active</div>
                  <div>$ <span className="animate-pulse">|</span></div>
                </div>
                <button className="mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Launch Terminal
                </button>
              </Widget>

              {/* Alerts */}
              <Widget title="Alerts" icon={AlertTriangle}>
                <div className="space-y-2">
                  {mockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-2 p-2 rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'error' ? 'bg-red-400' :
                        alert.type === 'warning' ? 'bg-yellow-400' : 
                        alert.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
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
          ) : (
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-8">
                <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">AT Protocol Dashboard Demo</h2>
                <p className="text-gray-400 mb-8">
                  Experience the AT Protocol dashboard with mock authentication. This demo showcases decentralized identity management and real-time profile synchronization features.
                </p>
                <div className="text-sm text-gray-500 mb-6">
                  <p>✅ Mock AT Protocol authentication</p>
                  <p>✅ Simulated profile synchronization</p>
                  <p>✅ Dashboard interface preview</p>
                  <p className="text-yellow-400 mt-2">🧪 Demo Environment - Use provided test accounts</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Auth Required Wrapper
const AuthRequiredDashboard: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  return (
    <>
      <Dashboard />
      <AnimatePresence>
        {showLogin && !isAuthenticated && (
          <LoginModal onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// Main App Component
const ATProtocolDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRequiredDashboard />
    </AuthProvider>
  );
};

export default ATProtocolDashboard;