'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, Bell, Mail, User, Settings, Hash, MoreHorizontal } from 'lucide-react'

const navigationItems = [
  { id: 'home', label: 'Home', href: '/', icon: Home },
  { id: 'search', label: 'Search', href: '/search', icon: Search },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
  { id: 'messages', label: 'Messages', href: '/messages', icon: Mail },
  { id: 'hashtags', label: 'Hashtags', href: '/hashtags', icon: Hash },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const [isCompact, setIsCompact] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-800">
          <DesktopSidebar isCompact={isCompact} setIsCompact={setIsCompact} />
        </aside>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileBottomNav />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <MobileMenuOverlay onClose={() => setMobileMenuOpen(false)} />
        )}
      </div>
    </div>
  )
}

function DesktopSidebar({ 
  isCompact, 
  setIsCompact 
}: { 
  isCompact: boolean
  setIsCompact: (compact: boolean) => void 
}) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={() => setIsCompact(!isCompact)}
          className="flex items-center space-x-3 hover:bg-gray-800 p-2 rounded-lg transition-colors w-full"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-sm">AT</span>
          </div>
          {!isCompact && (
            <span className="font-bold text-lg">AT Protocol</span>
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`
                    w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCompact && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const mainItems = navigationItems.slice(0, 4)

  return (
    <nav className="bg-black border-t border-gray-800">
      <div className="flex">
        {mainItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`
                flex-1 flex flex-col items-center py-2 px-1
                ${isActive ? 'text-blue-400' : 'text-gray-400'}
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 truncate">{item.label}</span>
            </button>
          )
        })}
        
        <button className="flex-1 flex flex-col items-center py-2 px-1 text-gray-400">
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-xs mt-1">More</span>
        </button>
      </div>
    </nav>
  )
}

function MobileMenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-64 bg-black border-l border-gray-800 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
