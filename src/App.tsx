import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { AuthLogin } from '../components/AuthLogin'
import { Timeline } from '../components/Timeline'
import { AppHeader } from '../components/AppHeader'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) {
          return false // Don't retry auth errors
        }
        return failureCount < 3
      },
    },
  },
})

function AppContent() {
  const { 
    isAuthenticated, 
    login, 
    logout, 
    loading, 
    error, 
    handle, 
    displayName, 
    avatar 
  } = useAuth()

  console.log('Auth state:', { isAuthenticated, loading, error, handle })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthLogin onLogin={login} loading={loading} error={error} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        user={{ handle, displayName, avatar }}
        onLogout={logout}
      />
      <main className="max-w-2xl mx-auto py-6">
        <Timeline />
      </main>
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
