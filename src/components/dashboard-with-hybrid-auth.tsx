'use client'
import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useAuth, AuthProvider } from '@/contexts/hybrid-auth-context'
import { ThemeProvider } from '@/contexts/theme-context'
import LoginModal from '@/components/login-modal'
import ModernDashboard from '@/components/modern-dashboard'
import VersionFooter from '@/components/version-footer'

function DashboardContent() {
  const { isAuthenticated, login, loading, session, service, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

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
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)'
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            AT Protocol Dashboard
          </h1>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
            Multi-service AT Protocol interface
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Supports Bluesky, custom PDS, and auto-detection
          </p>
          <button
            onClick={() => setShowLogin(true)}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--interactive-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-accent)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 0 20px var(--border-glow)'
                e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.backgroundColor = 'var(--interactive-primary)'
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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

        <VersionFooter />
      </div>
    )
  }

  return (
    <div className="relative">
      <ModernDashboard />
      
      {/* User info and logout in header */}
      <div 
        className="absolute top-4 right-4 flex items-center space-x-4 rounded-lg px-4 py-2 z-10 transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {session && (
          <div className="text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Logged in as:</span>
            <span className="ml-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              {session.handle}
            </span>
            {service && (
              <div className="text-xs" style={{ color: 'var(--text-accent)' }}>
                {service.replace('https://', '')}
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded text-sm transition-all duration-300 hover:shadow-lg"
          style={{ 
            backgroundColor: 'var(--status-error)',
            color: 'var(--text-primary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 10px var(--border-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardWithHybridAuth() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
