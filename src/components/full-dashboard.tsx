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

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setSystemMetrics(data);
      setMetricsError(null);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      setMetricsError('Failed to load system metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Update time every second
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Fetch metrics initially
    fetchSystemMetrics();
    
    // Update metrics every 5 seconds
    const metricsTimer = setInterval(fetchSystemMetrics, 5000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(metricsTimer);
    };
  }, []);

  // Calculate active users (mock for now - could be real AT Protocol data later)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <TerminalWidget />
            </div>
            
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

            <Widget title="Alerts" icon={AlertTriangle}>
              <div className="space-y-2">
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
                {mockAlerts.slice(0, 2).map((alert) => (
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
  );
};

export default FullDashboard;