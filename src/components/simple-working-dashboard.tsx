'use client'
import React, { useState, useEffect } from 'react'
import { Terminal, Activity, Shield, Menu, Bell, Settings, AlertTriangle } from 'lucide-react'

export default function SimpleWorkingDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">AT Protocol Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">{time}</div>
            <Bell className="w-5 h-5" />
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded hover:bg-gray-700">
                <Activity className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded hover:bg-gray-700">
                <Terminal className="w-5 h-5" />
                <span>Terminal</span>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* System Metrics */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">System Metrics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">45%</div>
                  <div className="text-sm text-gray-400">CPU</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">62%</div>
                  <div className="text-sm text-gray-400">Memory</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">25%</div>
                  <div className="text-sm text-gray-400">Disk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">12h</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </div>

            {/* AT Protocol Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold">AT Protocol</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="text-red-400">Disconnected</span>
                </div>
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  Connect
                </button>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold">Alerts</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">System OK</span>
                </div>
                <div className="text-xs text-gray-500">All systems normal</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
