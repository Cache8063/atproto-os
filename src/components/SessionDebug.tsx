'use client'
import { useEffect, useState } from 'react'

export function SessionDebug() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // Check localStorage
    const stored = localStorage.getItem('atproto-session')
    console.log('Stored session:', stored)
    setSessionInfo(stored ? JSON.parse(stored) : 'No session found')
  }, [])

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      console.log('Auth status:', data)
      alert(`Auth status: ${JSON.stringify(data)}`)
    } catch (error) {
      console.error('Auth test failed:', error)
      alert(`Auth test failed: ${error}`)
    }
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white mb-2">Session Debug</h3>
      <pre className="text-xs text-gray-300 mb-2">
        {JSON.stringify(sessionInfo, null, 2)}
      </pre>
      <button 
        onClick={testAuth}
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
      >
        Test Auth
      </button>
    </div>
  )
}
