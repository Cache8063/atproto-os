'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { hybridATProtoAuth, AuthSession, AuthCredentials } from '@/lib/hybrid-atproto-auth'

interface AuthContextType {
  session: AuthSession | null
  profile: any | null
  service: string | null
  loading: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [service, setService] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const result = await hybridATProtoAuth.login(credentials)
      
      if (result.success && result.session) {
        setSession(result.session)
        setProfile(result.profile || null)
        setService(result.service || null)
        console.log(`Successfully logged in to ${result.service}`)
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
    await hybridATProtoAuth.logout()
    setSession(null)
    setProfile(null)
    setService(null)
  }

  const isAuthenticated = session !== null

  const value: AuthContextType = {
    session,
    profile,
    service,
    loading,
    login,
    logout,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}