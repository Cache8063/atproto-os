'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeVariant = 'deep-blue' | 'deep-orange' | 'midnight' | 'purple'

interface ThemeContextType {
  theme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  themes: Record<ThemeVariant, ThemeConfig>
}

interface ThemeConfig {
  name: string
  description: string
  colors: {
    'bg-primary': string
    'bg-secondary': string
    'bg-tertiary': string
    'bg-accent': string
    'text-primary': string
    'text-secondary': string
    'text-muted': string
    'text-accent': string
    'interactive-primary': string
    'interactive-hover': string
    'interactive-active': string
    'interactive-disabled': string
    'border-primary': string
    'border-secondary': string
    'border-accent': string
    'border-glow': string
    'status-success': string
    'status-warning': string
    'status-error': string
    'status-info': string
  }
}

const themes: Record<ThemeVariant, ThemeConfig> = {
  'deep-blue': {
    name: 'Deep Blue',
    description: 'Professional blue with cool undertones',
    colors: {
      'bg-primary': '#0f172a',
      'bg-secondary': '#1e293b',
      'bg-tertiary': '#334155',
      'bg-accent': '#1d4ed8',
      'text-primary': '#f8fafc',
      'text-secondary': '#cbd5e1',
      'text-muted': '#64748b',
      'text-accent': '#60a5fa',
      'interactive-primary': '#1d4ed8',
      'interactive-hover': '#2563eb',
      'interactive-active': '#1e40af',
      'interactive-disabled': '#475569',
      'border-primary': '#334155',
      'border-secondary': '#475569',
      'border-accent': '#1d4ed8',
      'border-glow': '#60a5fa80',
      'status-success': '#10b981',
      'status-warning': '#f59e0b',
      'status-error': '#ef4444',
      'status-info': '#3b82f6'
    }
  },
  'deep-orange': {
    name: 'Deep Orange',
    description: 'Warm orange with rich depth',
    colors: {
      'bg-primary': '#1c1917',
      'bg-secondary': '#292524',
      'bg-tertiary': '#44403c',
      'bg-accent': '#ea580c',
      'text-primary': '#fafaf9',
      'text-secondary': '#d6d3d1',
      'text-muted': '#78716c',
      'text-accent': '#fb923c',
      'interactive-primary': '#ea580c',
      'interactive-hover': '#dc2626',
      'interactive-active': '#c2410c',
      'interactive-disabled': '#57534e',
      'border-primary': '#44403c',
      'border-secondary': '#57534e',
      'border-accent': '#ea580c',
      'border-glow': '#fb923c80',
      'status-success': '#16a34a',
      'status-warning': '#eab308',
      'status-error': '#dc2626',
      'status-info': '#0ea5e9'
    }
  },
  'midnight': {
    name: 'Midnight',
    description: 'Deep blacks with subtle purple hints',
    colors: {
      'bg-primary': '#0c0a0e',
      'bg-secondary': '#1a1625',
      'bg-tertiary': '#2d2438',
      'bg-accent': '#6366f1',
      'text-primary': '#faf9fb',
      'text-secondary': '#d4d1d8',
      'text-muted': '#78716c',
      'text-accent': '#a78bfa',
      'interactive-primary': '#6366f1',
      'interactive-hover': '#7c3aed',
      'interactive-active': '#5b21b6',
      'interactive-disabled': '#52525b',
      'border-primary': '#2d2438',
      'border-secondary': '#52525b',
      'border-accent': '#6366f1',
      'border-glow': '#a78bfa80',
      'status-success': '#059669',
      'status-warning': '#d97706',
      'status-error': '#dc2626',
      'status-info': '#0284c7'
    }
  },
  'purple': {
    name: 'Purple',
    description: 'Rich purple with elegant contrast',
    colors: {
      'bg-primary': '#1e1b2e',
      'bg-secondary': '#2a2550',
      'bg-tertiary': '#3c366b',
      'bg-accent': '#8b5cf6',
      'text-primary': '#f8fafc',
      'text-secondary': '#e2e8f0',
      'text-muted': '#94a3b8',
      'text-accent': '#c084fc',
      'interactive-primary': '#8b5cf6',
      'interactive-hover': '#a855f7',
      'interactive-active': '#7c2d12',
      'interactive-disabled': '#64748b',
      'border-primary': '#3c366b',
      'border-secondary': '#64748b',
      'border-accent': '#8b5cf6',
      'border-glow': '#c084fc80',
      'status-success': '#10b981',
      'status-warning': '#f59e0b',
      'status-error': '#f87171',
      'status-info': '#06b6d4'
    }
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>('deep-blue')

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    const themeConfig = themes[theme]
    
    // Clear any existing theme variables first
    const existingVars = Array.from(root.style).filter(prop => prop.startsWith('--'))
    existingVars.forEach(prop => {
      if (prop.includes('bg-') || prop.includes('text-') || prop.includes('border-') || prop.includes('interactive-') || prop.includes('status-')) {
        root.style.removeProperty(prop)
      }
    })
    
    // Set new theme variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    sessionStorage.setItem('atproto_theme', theme)
  }, [theme])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = sessionStorage.getItem('atproto_theme') as ThemeVariant
      if (storedTheme && themes[storedTheme]) {
        setThemeState(storedTheme)
      }
    }
  }, [])

  const setTheme = (newTheme: ThemeVariant) => {
    setThemeState(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    themes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
