'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Activity, 
  AlertTriangle, 
  Settings,
  Bell,
  Menu,
  X,
  Shield,
  User,
  LogOut
} from 'lucide-react';
import LoginModal from './login-modal';
import { simpleAuth, AuthSession } from '@/lib/simple-auth';

const mockMetrics = {
  cpu: 45,
  memory: 62,
  pdsUptime: '99.9%',
  activeUsers: 127
};

const mockAlerts = [
  { id: 1, type: 'info', message: 'AT Protocol connected successfully', time: 'now' },
  { id: 2, type: 'info', message: 'System running normally', time: '1 min ago' }
];

const Widget = ({ title, icon: Icon, children }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
};

export default function DashboardWithAuth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Load existing session
    simpleAuth.loadSession();
    setSession(simpleAuth.getSession());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (credentials: { identifier: string; password: string }) => {
    setLoginLoading(true);
    try {
      const newSession = await simpleAuth.login(credentials);
      setSession(newSession);
    } catch (error) {
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await simpleAuth.logout();
    setSession(null);
  };

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
            {session && (
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
            <button className="p-2 hover:bg-gray-700/50 rounded relative">
              <Bell className="w-5 h-5" />
              {session && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>}
            </button>
            <button className="p-2 hover:bg-gray-700/50 rounded">
              <Settings className="w-5 h-5" />
            </button>
            {session ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-400">@{session.handle}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-700/50 rounded text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
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
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Activity className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/50">
                  <Terminal className="w-5 h-5" />
                  <span>Terminal</span>
                </a>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!session ? (
            // Login prompt
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-300 mb-2">Welcome to AT Protocol Dashboard</h2>
              <p className="text-gray-400 mb-6">Connect your AT Protocol account to access the dashboard.</p>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Connect AT Protocol
              </button>
            </div>
          ) : (
            // Authenticated dashboard
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* User Profile */}
              <Widget title="User Profile" icon={User}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-medium text-white">@{session.handle}</div>
                      <div className="text-xs text-gray-400">{session.did}</div>
                    </div>
                  </div>
                  <div className="text-sm text-green-400">✓ Connected to AT Protocol</div>
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

              {/* Alerts */}
              <Widget title="System Status" icon={AlertTriangle}>
                <div className="space-y-2">
                  {mockAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-2 p-2 rounded">
                      <div className="w-2 h-2 rounded-full mt-2 bg-green-400" />
                      <div className="flex-1">
                        <div className="text-sm text-green-400">{alert.message}</div>
                        <div className="text-xs text-gray-500">{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Widget>

            </div>
          )}
        </main>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
            loading={loginLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
