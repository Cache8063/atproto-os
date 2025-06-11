'use client'
import { useState } from 'react'

export function QuickLogin() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('Login successful!')
        window.location.reload()
      } else {
        alert(`Login failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`Login error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSession = () => {
    localStorage.removeItem('atproto-session')
    alert('Session cleared')
    window.location.reload()
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white mb-4">Quick Login</h3>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="text"
          placeholder="Handle or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded"
          required
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={clearSession}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Clear Session
          </button>
        </div>
      </form>
    </div>
  )
}
