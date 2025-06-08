// src/components/integrated-dashboard.tsx
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
  LogOut,
  User,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { useSystemMetrics, systemMetrics } from '@/lib/system-metrics';
import { atprotoClient } from '@/lib/atproto-client';

interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  time: string;
  timestamp: Date;
}

const Widget = ({ title, icon: Icon, children, className = "" }) => {
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

const SystemMetricsWidget = () => {
  const { metrics, loading, error } = useSystemMetrics(2000); // Update every 2 seconds

  if (loading && !metrics) {
    return (
      <Widget title="System Metrics" icon={Activity}>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Widget>
    );
  }

  if (error) {
    return (
      <Widget title="System Metrics" icon={Activity}>
        <div className="text-red-400 text-sm text-center">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          Failed to load metrics
        </div>
      </Widget>
    );
  }

  return (
    <Widget title="System Metrics" icon={Activity}>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {metrics?.cpu.usage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">CPU Usage</div>
          <div className="text-xs text-gray-500">{metrics?.cpu.cores} cores</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {metrics?.memory.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Memory</div>
          <div className="text-xs text-gray-500">
            {systemMetrics.formatBytes(metrics?.memory.used || 0)} / {systemMetrics.formatBytes(metrics?.memory.total || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {metrics?.disk.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Disk Usage</div>
          <div className="text-xs text-gray-500">
            {systemMetrics.formatBytes(metrics?.disk.available || 0)} free
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {systemMetrics.formatUptime(metrics?.uptime || 0)}
          </div>
          <div className="text-sm text-gray-400">Uptime</div>
          <div className="text-xs text-gray-500">{metrics?.processes || 0} processes</div>
        </div>
      </div>
    </Widget>
  );
};

const ATProtoStatusWidget = () => {
  const { session } = useAuth();
  const [serverHealth, setServerHealth] = useState<{ status: string; latency: number } | null>(null);
  const [federationStatus, setFederationStatus] = useState<any>(null);

  useEffect(() => {
    if (session) {
      // Check server health
      const checkHealth = async () => {
        try {
          const health = await atprotoClient.checkServerHealth();
          setServerHealth(health);
          
          const fedStatus = await atprotoClient.getFederationStatus();
          setFederationStatus(fedStatus);
        } catch (error) {
          console.error('Error checking AT Proto status:', error);
        }
      };

      checkHealth();
      const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <Widget title="AT Protocol Status" icon={Shield}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-300">Authentication</span>
          <span className={`text-sm flex items-center space-x-1 ${session ? 'text-green-400' : 'text-red-400'}`}>
            {session ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{session ? 'Connected' : 'Disconnected'}</span>
          </span>
        </div>
        
        {session && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Handle</span>
              <span className="text-sm text-blue-400">@{session.handle}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Server Status</span>
              <span className={`text-sm ${serverHealth?.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {serverHealth?.status || 'checking...'}
              </span>
            </div>
            
            {serverHealth && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Latency</span>
                <span className="text-sm text-gray-400">{serverHealth.latency}ms</span>
              </div>
            )}
            
            {federationStatus && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Federation</span>
                <span className="text-sm text-green-400">
                  {federationStatus.connectedPeers} peers
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Widget>
  );
};

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { metrics } = useSystemMetrics();

  useEffect(() => {
    if (!metrics) return;

    const newAlerts: Alert[] = [];
    
    // Generate alerts based on system metrics
    if (metrics.cpu.usage > 80) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'warning',
        message: `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        time: 'now',
        timestamp: new Date()
      });
    }
    
    if (metrics.memory.percentage > 85) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'warning',
        message: `High memory usage: ${metrics.memory.percentage.toFixed(1)}%`,
        time: 'now',
        timestamp: new Date()
      });
    }
    
    if (metrics.disk.percentage > 90) {
      newAlerts.push({
        id: Date.now() + 3,
        type: 'error',
        message: `Disk space critical: ${metrics.disk.percentage.toFixed(1)}%`,
        time: 'now',
        timestamp: new Date()
      });
    }

    // Add some positive status messages
    if (newAlerts.length === 0) {
      newAlerts.push({
        id: Date.now(),
        type: 'info',
        message: 'All systems running normally',
        time: 'now',
        timestamp: new Date()
      });
    }

    setAlerts(newAlerts);
  }, [metrics]);

  return (
    <Widget title="System Alerts" icon={AlertTriangle}>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-2 p-2 rounded hover:bg-gray-700/30 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${
              alert.type === 'error' ? 'bg-red-400' :
              alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
            }`} />
            <div className="flex-1">
              <div className={`text-sm ${
                alert.type === 'error' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`}>{alert.message}</div>
              <div className="text-xs text-gray-500">{alert.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </Widget>
  );
};

const UserProfileWidget = () => {
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        try {
          const profileData = await atprotoClient.getProfile();
          setProfile(profileData);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };

      fetchProfile();
    }
  }, [session]);

  if (!session) return null;

  return (
    <Widget title="User Profile" icon={User}>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          {profile?.avatar && (
            <img
              src={profile.avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <div className="text-sm font-medium text-white">
              {profile?.displayName || session.handle}
            </div>
            <div className="text-xs text-gray-400">@{session.handle}</div>
          </div>
        </div>
        
        {profile?.description && (
          <div className="text-xs text-gray-300 bg-gray-700/30 rounded p-2">
            {profile.description}
          </div>
        )}
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>{profile?.followersCount || 0} followers</span>
          <span>{profile?.followsCount || 0} following</span>
          <span>{profile?.postsCount || 0} posts</span>
        </div>
        
        <button
          onClick={logout}
          className="w-full mt-3 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </Widget>
  );
};

export default function IntegratedDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { session, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold">Loading AT Protocol Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700/50 rounded transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">AT Protocol Dashboard</h1>
            {isAuthenticated && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Connected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300" suppressHydrationWarning>
              {mounted ? currentTime : '--:--:--'}
            </div>
            <button className="p-2 hover:bg-gray-700/50 rounded transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-700/50 rounded transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                Login
              </button>
            )}
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
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Server className="w-5 h-5" />
                  <span>SSH Console</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <Users className="w-5 h-5" />
                  <span>User Activity</span>
                </a>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to AT Protocol Dashboard</h2>
              <p className="text-gray-400 mb-6">Please log in with your AT Protocol credentials to access the dashboard.</p>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Login to AT Protocol
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SystemMetricsWidget />
              </div>
              
              <ATProtoStatusWidget />
              <AlertsWidget />
              <UserProfileWidget />
              
              <Widget title="SSH Console" icon={Server}>
                <div className="bg-gray-900 rounded p-3 font-mono text-gray-300 text-sm">
                  <div className="text-green-400">Ready for SSH connection</div>
                  <div className="text-gray-500">Configure your servers in settings</div>
                </div>
                <button className="mt-3 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
                  Configure SSH
                </button>
              </Widget>

              <Widget title="Chat" icon={MessageSquare}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">AT Protocol Connected</span>
                  </div>
                  <div className="text-sm text-gray-400">Ready for secure communication</div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                    Open Chat
                  </button>
                </div>
              </Widget>
            </div>
          )}
        </main>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <LoginForm onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}