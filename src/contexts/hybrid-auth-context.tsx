'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BskyAgent } from '@atproto/api'

export interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  active: boolean
}

export interface AuthCredentials {
  identifier: string
  password: string
  service?: string
}

class HybridATProtoAuth {
  private agent: BskyAgent | null = null
  private session: AuthSession | null = null
  private currentService: string = 'https://bsky.social'

  // Detect service from handle
  private detectServiceFromHandle(identifier: string): string {
    if (identifier.includes('.arcnode.xyz')) {
      return 'https://arcnode.xyz'
    }
    if (identifier.includes('.')) {
      // Extract domain from handle like user.mydomain.com
      const parts = identifier.split('.')
      if (parts.length >= 2) {
        const domain = parts.slice(-2).join('.')
        if (domain !== 'bsky.social') {
          return `https://${domain}`
        }
      }
    }
    return 'https://bsky.social'
  }

  async login(credentials: AuthCredentials): Promise<{ success: boolean; session?: AuthSession; profile?: any; service?: string }> {
    try {
      // Determine service
      const service = credentials.service || this.detectServiceFromHandle(credentials.identifier)
      this.currentService = service
      
      // Create agent for the detected/specified service
      this.agent = new BskyAgent({ service })
      
      console.log(`Connecting to: ${service}`)
      const response = await this.agent.login({
        identifier: credentials.identifier,
        password: credentials.password
      })
      
      if (response.success && this.agent.session) {
        this.session = {
          accessJwt: this.agent.session.accessJwt,
          refreshJwt: this.agent.session.refreshJwt,
          handle: this.agent.session.handle,
          did: this.agent.session.did,
          active: this.agent.session.active || true
        }

        // Fetch user profile
        let profile = null
        try {
          const profileResponse = await this.agent.getProfile({
            actor: this.session.handle
          })
          profile = profileResponse.data
          console.log(`Profile loaded from ${service}:`, profile)
        } catch (error) {
          console.error(`Error fetching profile from ${service}:`, error)
        }

        return {
          success: true,
          session: this.session,
          profile,
          service
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error(`AT Protocol login error:`, error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.session = null
    this.agent = null
  }

  isAuthenticated(): boolean {
    return this.session !== null && this.agent !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  getCurrentService(): string {
    return this.currentService
  }

  // Get authenticated agent for making API calls
  getAgent(): BskyAgent | null {
    return this.agent
  }

  // Method to check service health
  async checkServiceHealth(service: string): Promise<boolean> {
    try {
      const response = await fetch(`${service}/.well-known/atproto-did`)
      return response.ok
    } catch (error) {
      console.error(`Service health check failed for ${service}:`, error)
      return false
    }
  }

  // Refresh session if needed
  async refreshSession(): Promise<boolean> {
    if (!this.agent || !this.session) {
      return false
    }

    try {
      await this.agent.resumeSession(this.session)
      return true
    } catch (error) {
      console.error('Session refresh failed:', error)
      return false
    }
  }

  // Set session from stored data (for persistence)
  async setSession(session: AuthSession, service: string): Promise<boolean> {
    try {
      this.session = session
      this.currentService = service
      this.agent = new BskyAgent({ service })
      
      console.log('Auth: Attempting to resume session for:', session.handle)
      await this.agent.resumeSession(session)
      console.log('Auth: Session resumed successfully')
      return true
    } catch (error) {
      console.error('Auth: Failed to resume session:', error)
      this.session = null
      this.agent = null
      return false
    }
  }
}

export const hybridATProtoAuth = new HybridATProtoAuth()

// React Context Implementation
interface AuthContextType {
  session: AuthSession | null
  loading: boolean
  isAuthenticated: boolean
  service: string | null
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [service, setService] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load session from sessionStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = sessionStorage.getItem('atproto_session')
        const storedService = sessionStorage.getItem('atproto_service')
        
        if (storedSession && storedService) {
          const parsedSession = JSON.parse(storedSession)
          console.log('Auth: Found stored session for:', parsedSession.handle)
          
          // Try to restore the session with the auth instance
          const success = await hybridATProtoAuth.setSession(parsedSession, storedService)
          
          if (success) {
            console.log('Auth: Session restored successfully')
            setSession(parsedSession)
            setService(storedService)
            setIsAuthenticated(true)
          } else {
            console.log('Auth: Session restoration failed, clearing storage')
            sessionStorage.removeItem('atproto_session')
            sessionStorage.removeItem('atproto_service')
          }
        } else {
          console.log('Auth: No stored session found')
        }
      } catch (error) {
        console.error('Auth: Error during session restoration:', error)
        sessionStorage.removeItem('atproto_session')
        sessionStorage.removeItem('atproto_service')
      } finally {
        setIsInitialized(true)
      }
    }

    restoreSession()
  }, [])

  const login = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const result = await hybridATProtoAuth.login(credentials)
      if (result.success && result.session) {
        setSession(result.session)
        setService(result.service || null)
        setIsAuthenticated(true)
        
        // Store in sessionStorage for persistence
        sessionStorage.setItem('atproto_session', JSON.stringify(result.session))
        if (result.service) {
          sessionStorage.setItem('atproto_service', result.service)
        }
        
        console.log('Auth: Login successful, session stored')
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await hybridATProtoAuth.logout()
      setSession(null)
      setService(null)
      setIsAuthenticated(false)
      
      // Clear stored session
      sessionStorage.removeItem('atproto_session')
      sessionStorage.removeItem('atproto_service')
      
      console.log('Auth: Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    session,
    loading,
    isAuthenticated,
    service,
    login,
    logout
  }

  // Don't render until we've tried to restore the session
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
