'use client'
import { useAuth } from '@/contexts/hybrid-auth-context'
import DashboardWithHybridAuth from '@/components/dashboard-with-hybrid-auth'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()

  console.log('HomePage render:', { isAuthenticated, loading })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return <DashboardWithHybridAuth />
}
