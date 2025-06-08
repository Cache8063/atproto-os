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
  User
} from 'lucide-react';

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

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock AT Protocol Auth Service
class MockATProtoAuth {
  private mockUsers = {
    'demo.bsky.social': {
      password: 'demo123',
      profile: {
        handle: 'demo.bsky.social',
        did: 'did:plc:demo123456789abcdef',
        displayName: 'Demo User',
        description: '🚀 Testing AT Protocol Dashboard integration!',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop&crop=face',
        followersCount: 1247,
        followsCount: 892,
        postsCount: 156
      }
    },
    'alice.bsky.social': {
      password: 'alice123', 
      profile: {
        handle: 'alice.bsky.social',
        did: 'did:plc:alice789012345abcdef',
        displayName: 'Alice Cooper',
        description: 'Developer • Open Source Enthusiast ☕',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=128&h=128&fit=crop&crop=face',
        followersCount: 523,
        followsCount: 301,
        postsCount: 89
      }
    }
  };

  async login(credentials: AuthCredentials) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = this.mockUsers[credentials.identifier as keyof typeof this.mockUsers];
    
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid credentials');
    }

    return {
      success: true,
      session: {
        accessJwt: 'mock_jwt_' + Date.now(),
        refreshJwt: 'mock_refresh_' + Date.now(),
        handle: user.profile.handle,
        did: user.profile.did,
        active: true
      },
      profile: user.profile
    };
  }
}

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mockAuth] = useState(() => new MockATProtoAuth());

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    try {
      const response = await mockAuth.login(credentials);
      setSession(response.session);
      setUserProfile(response.profile);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
      userProfile
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
      setError('Invalid credentials');
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
          <h2 className="text-xl font-bold text-white">Login to AT Protocol</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Handle or Email</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="demo.bsky.social"
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
                placeholder="demo123"
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
              disabled={loading}
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

          <div className="mt-4 p-3 bg-gray-900/50 rounded text-xs text-gray-400">
            <p className="font-semibold text-white mb-2">Demo Accounts:</p>
            <p>demo.bsky.social / demo123</p>
            <p>alice.bsky.social / alice123</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">AT Protocol Dashboard</h1>
          <p className="text-gray-400">Please log in to continue</p>
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
            <span className="text-xs bg-yellow-600 px-2 py-1 rounded text-black">DEMO</span>
          </h1>
          
          <div className="flex items-center space-x-4">
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
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h4 className="font-semibold text-white">{userProfile?.displayName}</h4>
                <p className="text-gray-400 text-sm">@{session?.handle}</p>
                <div className="flex space-x-4 mt-2 text-sm">
                  <span className="text-blue-400">{userProfile?.followersCount} followers</span>
                  <span className="text-green-400">{userProfile?.followsCount} following</span>
                  <span className="text-yellow-400">{userProfile?.postsCount} posts</span>
                </div>
              </div>
            </div>
            {userProfile?.description && (
              <p className="mt-4 text-gray-300 text-sm">{userProfile.description}</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">AT Protocol</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Status</span>
                <span className="text-green-400">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Service</span>
                <span className="text-blue-400">Demo Mode</span>
              </div>
              <div className="text-xs text-yellow-400 bg-yellow-900/20 rounded p-2 mt-3">
                🧪 Demo Environment Active
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Auth Wrapper
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
const MockATProtocolDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRequiredDashboard />
    </AuthProvider>
  );
};

export default MockATProtocolDashboard;
