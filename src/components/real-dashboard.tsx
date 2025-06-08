'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
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
  User,
  Server
} from 'lucide-react';
import { realATProtoAuth } from '../lib/real-atproto-auth';

// Types (same as before)
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
  pdsHealth: boolean;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pdsHealth, setPdsHealth] = useState(false);

  // Check PDS health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await realATProtoAuth.checkPDSHealth();
      setPdsHealth(health);
    };
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    try {
      const response = await realATProtoAuth.login(credentials);
      
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
    await realATProtoAuth.logout();
    setSession(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      loading,
      login,
      logout,
      isAuthenticated: session !== null,
      userProfile,
      pdsHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Modal
const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, pdsHealth } = useAuth();

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
      setError('Invalid credentials or PDS connection error. Check your arcnode.xyz account.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-xl border border-gray-600 p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Login to Your PDS</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* PDS Status */}
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">PDS Status</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              pdsHealth 
                ? 'bg-green-900/30 text-green-400' 
                : 'bg-red-900/30 text-red-400'
            }`}>
              {pdsHealth ? '🟢 arcnode.xyz Online' : '🔴 arcnode.xyz Offline'}
            </span>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Handle or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="your-handle.arcnode.xyz"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your arcnode.xyz password"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-700 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !pdsHealth}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-900/20 rounded text-xs text-blue-200">
            <p className="font-semibold mb-1">🏠 Your Personal Data Server</p>
            <p>Connecting to: <strong>arcnode.xyz</strong></p>
            <p>Use your arcnode.xyz account credentials</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Dashboard Component (updated for custom PDS)
const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, session, logout, userProfile, pdsHealth } = useAuth();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Server className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">AT Protocol Dashboard</h1>
          <p className="text-gray-400">Connect to your Personal Data Server</p>
          <p className="text-blue-400 text-sm mt-2">arcnode.xyz</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            AT Protocol Dashboard{' '}
            <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">CUSTOM PDS</span>
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400">arcnode.xyz</span>
            </div>
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <span className="text-sm text-gray-300">@{session?.handle}</span>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-700 rounded"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Profile */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Your Profile</h3>
            </div>
            <div className="flex items-center space-x-4">
              {userProfile?.avatar && (
                <img 
                  src={userProfile.avatar} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h4 className="font-semibold text-white text-lg">
                  {userProfile?.displayName || session?.handle}
                </h4>
                <p className="text-gray-400">@{session?.handle}</p>
                <div className="flex space-x-4 mt-2 text-sm">
                  <span className="text-blue-400">
                    {userProfile?.followersCount || 0} followers
                  </span>
                  <span className="text-green-400">
                    {userProfile?.followsCount || 0} following
                  </span>
                  <span className="text-yellow-400">
                    {userProfile?.postsCount || 0} posts
                  </span>
                </div>
              </div>
            </div>
            {userProfile?.description && (
              <p className="mt-4 text-gray-300">{userProfile.description}</p>
            )}
          </div>

          {/* PDS Status */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Your PDS</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className={pdsHealth ? 'text-green-400' : 'text-red-400'}>
                  {pdsHealth ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Service</span>
                <span className="text-purple-400">arcnode.xyz</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">DID</span>
                <span className="text-gray-400 font-mono">
                  {session?.did.slice(0, 25)}...
                </span>
              </div>
              <div className="text-xs text-purple-400 bg-purple-900/20 rounded p-2 mt-3">
                🏠 Personal Data Server Connection
              </div>
            </div>
          </div>

          {/* Connection Stats */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Connection</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Protocol</span>
                <span className="text-blue-400">AT Protocol</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Auth</span>
                <span className="text-green-400">JWT Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Sync</span>
                <span className="text-green-400">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Auth Wrapper (same as before)
const AuthRequiredDashboard: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setShowLogin(!isAuthenticated);
  }, [isAuthenticated]);

  return (
    <>
      <Dashboard />
      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </>
  );
};

// Main Component
const RealATProtocolDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRequiredDashboard />
    </AuthProvider>
  );
};

export default RealATProtocolDashboard;
