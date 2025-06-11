import React, { useState } from 'react'
import { AuthDebug } from './AuthDebug'
import { AuthLogin } from './AuthLogin'

export function AppSimple() {
  const [showDebug, setShowDebug] = useState(true)
  const [authError, setAuthError] = useState<string>('')

  const handleLogin = async (credentials: { identifier: string; password: string }) => {
    console.log('Login attempt:', credentials)
    setAuthError('')
    
    try {
      // Mock login for testing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate different outcomes
      if (credentials.identifier === 'test') {
        console.log('Mock login success')
        setShowDebug(false)
      } else {
        throw new Error('Test credentials: use "test" as identifier')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Login failed')
      throw error
    }
  }

  if (showDebug) {
    return (
      <div>
        <div className="p-4 bg-blue-100 border-b">
          <button 
            onClick={() => setShowDebug(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Auth Form
          </button>
        </div>
        <AuthDebug />
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 bg-green-100 border-b">
        <button 
          onClick={() => setShowDebug(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Back to Debug
        </button>
        <span className="text-sm text-gray-600">
          Mock login successful! (Use identifier "test" to test)
        </span>
      </div>
      <AuthLogin onLogin={handleLogin} error={authError} />
    </div>
  )
}
