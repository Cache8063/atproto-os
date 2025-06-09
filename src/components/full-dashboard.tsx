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
  X
} from 'lucide-react';

const mockMetrics = {
  cpu: 45,
  memory: 62,
  pdsUptime: '99.9%',
  activeUsers: 127
};

const mockAlerts = [
  { id: 1, type: 'warning', message: 'High memory usage detected', time: '2 min ago' },
  { id: 2, type: 'info', message: 'PDS sync completed successfully', time: '5 min ago' },
  { id: 3, type: 'error', message: 'Failed to connect to federation peer', time: '8 min ago' }
];

const Widget = ({ title, icon: Icon, children }) => {
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
      <div className="bg-black rounded p-3 font-mono text-green-400 text-sm h-20">
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

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Widget title="Terminal" icon={Terminal}>
              <div className="bg-black rounded p-3 font-mono text-green-400 text-sm h-20">
                <div>$ tail -f /var/log/pds.log</div>
                <div className="text-gray-400 text-xs">INFO: Federation sync completed</div>
                <div>$ <span className="animate-pulse">|</span></div>
              </div>
            </Widget>
            
            <Widget title="System Metrics" icon={Activity}>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{mockMetrics.cpu}%</div>
                  <div className="text-xs text-gray-400">CPU</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{mockMetrics.memory}%</div>
                  <div className="text-xs text-gray-400">Memory</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{mockMetrics.pdsUptime}</div>
                  <div className="text-xs text-gray-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{mockMetrics.activeUsers}</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
              </div>
            </Widget>

            <Widget title="Alerts" icon={AlertTriangle}>
              <div className="space-y-2">
                {mockAlerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-2 p-2 rounded">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      alert.type === 'error' ? 'bg-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <div className="text-xs text-gray-300">{alert.message}</div>
                      <div className="text-xs text-gray-500">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Widget>

            <Widget title="AT Protocol" icon={MessageSquare}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Posts</span>
                  <span className="text-blue-400">1.2k</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Federation</span>
                  <span className="text-green-400">Connected</span>
                </div>
              </div>
            </Widget>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FullDashboard;