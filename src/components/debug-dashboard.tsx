'use client'
import React from 'react'
import { useAuth } from '@/contexts/hybrid-auth-context'
import { useTheme } from '@/contexts/theme-context'

export default function DebugDashboard() {
  const { session, loading, isAuthenticated, service, login, logout } = useAuth()
  const { theme, themes } = useTheme()

  console.log('DebugDashboard render:', {
    session,
    loading,
    isAuthenticated,
    service,
    theme
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  const handleTestLogin = async () => {
    try {
      await login({
        identifier: 'test.bsky.social',
        password: 'test-password'
      })
      console.log('Test login attempted')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          AT Protocol Dashboard - Debug Mode
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Authentication Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Authenticated:</span>
                <span style={{ color: isAuthenticated ? 'var(--status-success)' : 'var(--status-error)' }}>
                  {isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Loading:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Service:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {service || 'None'}
                </span>
              </div>
              {session && (
                <>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Handle:</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {session.handle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>DID:</span>
                    <span style={{ color: 'var(--text-primary)' }} className="text-xs font-mono">
                      {session.did.slice(0, 20)}...
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              {!isAuthenticated ? (
                <button
                  onClick={handleTestLogin}
                  className="w-full py-2 px-4 rounded transition-colors"
                  style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-primary)' }}
                >
                  Test Login
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="w-full py-2 px-4 rounded transition-colors"
                  style={{ backgroundColor: 'var(--status-error)', color: 'var(--text-primary)' }}
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Theme Status */}
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Theme Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Current Theme:</span>
                <span style={{ color: 'var(--text-accent)' }}>
                  {themes[theme]?.name || theme}
                </span>
              </div>
              <div className="text-sm">
                <div style={{ color: 'var(--text-secondary)' }} className="mb-2">Available Themes:</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(themes).map(themeKey => (
                    <div key={themeKey} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {themes[themeKey as keyof typeof themes].name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => console.log({ session, isAuthenticated, service, theme })}
              className="py-2 px-4 rounded text-sm transition-colors"
              style={{ backgroundColor: 'var(--status-info)', color: 'var(--text-primary)' }}
            >
              Log State
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="py-2 px-4 rounded text-sm transition-colors"
              style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-primary)' }}
            >
              Go to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 rounded text-sm transition-colors"
              style={{ backgroundColor: 'var(--status-warning)', color: 'var(--text-primary)' }}
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.clear()
                  window.location.reload()
                }
              }}
              className="py-2 px-4 rounded text-sm transition-colors"
              style={{ backgroundColor: 'var(--status-error)', color: 'var(--text-primary)' }}
            >
              Clear & Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
