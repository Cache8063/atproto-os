import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface AuthState {
  isAuthenticated: boolean
  accessJwt?: string
  refreshJwt?: string
  did?: string
  handle?: string
  displayName?: string
  avatar?: string
}

interface LoginCredentials {
  identifier: string
  password: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('atproto-auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAuthState({ ...parsed, isAuthenticated: true })
      } catch (e) {
        localStorage.removeItem('atproto-auth')
      }
    }
  }, [])

  const login = async ({ identifier, password }: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        accessJwt: data.accessJwt,
        refreshJwt: data.refreshJwt,
        did: data.did,
        handle: data.handle,
        displayName: data.displayName,
        avatar: data.avatar
      }

      setAuthState(newAuthState)
      localStorage.setItem('atproto-auth', JSON.stringify(newAuthState))
      
      // Clear any cached data from previous sessions
      queryClient.clear()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAuthState({ isAuthenticated: false })
    localStorage.removeItem('atproto-auth')
    queryClient.clear()
  }

  const refreshSession = async () => {
    if (!authState.refreshJwt) return false

    try {
      const response = await fetch('/xrpc/com.atproto.server.refreshSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.refreshJwt}`
        }
      })

      if (!response.ok) throw new Error('Refresh failed')

      const data = await response.json()
      
      const updatedAuth = {
        ...authState,
        accessJwt: data.accessJwt,
        refreshJwt: data.refreshJwt
      }

      setAuthState(updatedAuth)
      localStorage.setItem('atproto-auth', JSON.stringify(updatedAuth))
      return true

    } catch (err) {
      logout() // Force re-login if refresh fails
      return false
    }
  }

  return {
    ...authState,
    login,
    logout,
    refreshSession,
    loading,
    error
  }
}
