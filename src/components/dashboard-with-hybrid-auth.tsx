'use client'
import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuth, AuthProvider } from '@/contexts/hybrid-auth-context'
import LoginModal from '@/components/login-modal'
import FullDashboard from '@/components/full-dashboard'

function DashboardContent() {
  const { isAuthenticated, login, loading, session, service, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(!isAuthenticated)

  const handleLogin = async (credentials: { identifier: string; password: string }) => {
    await login(credentials)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    await logout()
    setShowLogin(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AT Protocol Dashboard</h1>
          <p className="text-gray-400 mb-2">Multi-service AT Protocol interface</p>
          <p className="text-sm text-gray-500 mb-8">Supports Bluesky, custom PDS, and auto-detection</p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center space-x-2 mx-auto"
          >
            <LogIn className="w-5 h-5" />
            <span>Login to AT Protocol</span>
          </button>
        </div>

        <AnimatePresence>
          {showLogin && (
            <LoginModal
              onClose={() => setShowLogin(false)}
              onLogin={handleLogin}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative">
      <FullDashboard />
      
      {/* User info and logout in header */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 text-white bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/30">
        {session && (
          <div className="text-sm">
            <span className="text-gray-400">Logged in as:</span>
            <span className="ml-2 font-medium">{session.handle}</span>
            {service && (
              <div className="text-xs text-blue-400">
                {service.replace('https://', '')}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardWithHybridAuth() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}