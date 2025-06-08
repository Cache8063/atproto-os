'use client'
import React from 'react'
import { Terminal, Activity, AlertTriangle } from 'lucide-react'

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">AT Protocol Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Terminal</h3>
            </div>
            <div className="bg-black rounded p-3 font-mono text-green-400 text-sm">
              <div>$ echo "Hello AT Protocol!"</div>
              <div className="text-gray-400">Hello AT Protocol!</div>
              <div>$ <span className="animate-pulse">|</span></div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>CPU Usage</span>
                <span className="text-green-400">45%</span>
              </div>
              <div className="flex justify-between">
                <span>Memory</span>
                <span className="text-blue-400">62%</span>
              </div>
              <div className="flex justify-between">
                <span>PDS Status</span>
                <span className="text-green-400">Online</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Alerts</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">System running normally</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">Last sync: 2 min ago</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-400">
          <p>✅ Basic setup working! Ready for full installation.</p>
          <p className="mt-2 text-sm">This confirms your system can run the AT Protocol Dashboard.</p>
        </div>
      </div>
    </div>
  )
}
