import React, { useState, useEffect } from 'react'

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Check what's in localStorage
    const stored = localStorage.getItem('atproto-auth')
    setDebugInfo({
      hasLocalStorage: !!stored,
      localStorageContent: stored,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    })
  }, [])

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
      <pre className="bg-white p-4 rounded border overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div className="mt-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={() => {
            localStorage.setItem('test-key', 'test-value')
            setDebugInfo(prev => ({...prev, testLocalStorage: 'written'}))
          }}
        >
          Test localStorage Write
        </button>
        
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.clear()
            setDebugInfo(prev => ({...prev, cleared: true}))
          }}
        >
          Clear localStorage
        </button>
      </div>
    </div>
  )
}
