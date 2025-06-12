'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      if (!online) {
        setShowOffline(true)
      } else if (showOffline) {
        // Show "back online" briefly
        setTimeout(() => setShowOffline(false), 2000)
      }
    }

    // Check initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [showOffline])

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div 
            className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${
              isOnline ? 'border-green-500' : 'border-red-500'
            }`}
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: isOnline ? 'var(--status-success)' : 'var(--status-error)'
            }}
          >
            {isOnline ? (
              <Wifi className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
            ) : (
              <WifiOff className="w-4 h-4" style={{ color: 'var(--status-error)' }} />
            )}
            <span 
              className="text-sm font-medium"
              style={{ color: isOnline ? 'var(--status-success)' : 'var(--status-error)' }}
            >
              {isOnline ? 'Back online' : 'You are offline'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
