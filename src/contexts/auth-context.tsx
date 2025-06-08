// src/contexts/auth-context.tsx
'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { atprotoClient, AuthSession, AuthCredentials } from '@/lib/atproto-client'

interface AuthContextType {
  session: AuthSession | null
  loading: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to resume session on app start
    const initAuth = async () => {
      try {
        const resumedSession = await atprotoClient.resumeSession()
        setSession(resumedSession)
      } catch (error) {
        console.error('Failed to resume session:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const newSession = await atprotoClient.login(credentials)
      setSession(newSession)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await atprotoClient.logout()
      setSession(null)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    loading,
    login,
    logout,
    isAuthenticated: session !== null
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