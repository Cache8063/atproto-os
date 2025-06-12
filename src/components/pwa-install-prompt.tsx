'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show iOS install prompt after a delay
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isIOS, isStandalone])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or recently dismissed
  if (isStandalone) return null
  
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
    return null
  }

  if (!showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div 
          className="p-4 rounded-lg border shadow-lg"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-accent)'
          }}
        >
          <div className="flex items-start space-x-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: 'var(--interactive-primary)20' }}
            >
              {isIOS ? (
                <Smartphone className="w-5 h-5" style={{ color: 'var(--interactive-primary)' }} />
              ) : (
                <Download className="w-5 h-5" style={{ color: 'var(--interactive-primary)' }} />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Install AT Dashboard
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {isIOS 
                  ? 'Tap the share button and "Add to Home Screen"'
                  : 'Install the app for a better experience'
                }
              </p>
              
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="mt-2 px-3 py-1 rounded text-xs font-medium transition-colors"
                  style={{ 
                    backgroundColor: 'var(--interactive-primary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Install
                </button>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="p-1 rounded hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
