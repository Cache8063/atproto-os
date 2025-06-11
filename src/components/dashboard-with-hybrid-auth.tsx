'use client'
import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuth, AuthProvider } from '@/contexts/hybrid-auth-context'
import LoginModal from '@/components/login-modal'
import FullDashboard from '@/components/full-dashboard'
import VersionFooter from '@/components/version-footer'

function DashboardContent() {
  const { isAuthenticated, login, loading, session, service, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  // DEBUG: Log auth state and sessionStorage
  useEffect(() => {
    const storedSession = sessionStorage.getItem('atproto_session')
    const storedService = sessionStorage.getItem('atproto_service')
    
    console.log('Dashboard Debug:', {
      isAuthenticated,
      hasSession: !!session,
      sessionHandle: session?.handle,
      loading,
      hasStoredSession: !!storedSession,
      hasStoredService: !!storedService,
      service
    })
  }, [isAuthenticated, session, loading, service])

  const handleLogin = async (credentials: { identifier: string; password: string }) => {
    await login(credentials)
    setShowLogin(false)
  }

  const handleLogout = async () => {
    await logout()
    setShowLogin(false)
  }

  // Check if we should show login screen
  if (!isAuthenticated || !session) {
    console.log('Dashboard: Showing login screen - isAuthenticated:', isAuthenticated, 'session:', !!session)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">AT Protocol Dashboard</h1>
          <p className="text-gray-400 mb-2">Multi-service AT Protocol interface</p>
          <p className="text-sm text-gray-500 mb-8">Supports Bluesky, custom PDS, and auto-detection</p>
          <button
            onClick={() => setShowLogin(true)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{loading ? 'Connecting...' : 'Login to AT Protocol'}</span>
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

        {/* Version Footer on login page too */}
        <VersionFooter />
      </div>
    )
  }

  console.log('Dashboard: Showing main dashboard - authenticated user:', session?.handle)

  return (
    <div className="relative">
      <FullDashboard />
      
      {/* User info and logout in header */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 text-white bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/30 z-10">
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
