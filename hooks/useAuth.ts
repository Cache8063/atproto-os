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
  const [loading, setLoading] = useState(true) // Start as loading
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem('atproto-auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Found stored auth:', parsed)
        setAuthState({ ...parsed, isAuthenticated: true })
      } catch (e) {
        console.error('Invalid stored auth:', e)
        localStorage.removeItem('atproto-auth')
      }
    }
    setLoading(false)
  }, [])

  const login = async ({ identifier, password }: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      // Try to determine the service endpoint
      let service = 'https://bsky.social'
      if (identifier.includes('.')) {
        // If identifier looks like a domain, try to resolve it
        try {
          const resolveResponse = await fetch(`https://${identifier}/.well-known/atproto-did`)
          if (resolveResponse.ok) {
            service = `https://${identifier}`
          }
        } catch (e) {
          // Fall back to bsky.social
        }
      }

      console.log('Attempting login to:', service)
      
      const response = await fetch(`${service}/xrpc/com.atproto.server.createSession`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: identifier.trim(), 
          password 
        })
      })

      console.log('Login response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Login error:', errorData)
        throw new Error(errorData.message || `Login failed (${response.status})`)
      }

      const data = await response.json()
      console.log('Login successful:', { did: data.did, handle: data.handle })
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        accessJwt: data.accessJwt,
        refreshJwt: data.refreshJwt,
        did: data.did,
        handle: data.handle,
        displayName: data.displayName,
        avatar: data.avatar,
      }

      setAuthState(newAuthState)
      localStorage.setItem('atproto-auth', JSON.stringify(newAuthState))
      
      // Clear any cached data from previous sessions
      queryClient.clear()

    } catch (err) {
      console.error('Login failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('Logging out')
    setAuthState({ isAuthenticated: false })
    localStorage.removeItem('atproto-auth')
    queryClient.clear()
    setError(null)
  }

  const refreshSession = async () => {
    if (!authState.refreshJwt) return false

    try {
      const response = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
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
      console.error('Session refresh failed:', err)
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
