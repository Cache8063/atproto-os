'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ColorTheme {
  name: string
  id: string
  colors: {
    // Primary background colors
    bg: {
      primary: string      // Main background
      secondary: string    // Card/widget backgrounds
      tertiary: string     // Input/button backgrounds
      accent: string       // Accent backgrounds
    }
    // Text colors
    text: {
      primary: string      // Main text
      secondary: string    // Secondary text
      muted: string        // Muted/disabled text
      accent: string       // Accent text
    }
    // Border colors
    border: {
      primary: string      // Main borders
      secondary: string    // Secondary borders
      accent: string       // Accent borders
      glow: string         // Hover glow effect
    }
    // Status colors
    status: {
      success: string
      warning: string
      error: string
      info: string
    }
    // Interactive elements
    interactive: {
      primary: string      // Primary buttons
      secondary: string    // Secondary buttons
      hover: string        // Hover states
      active: string       // Active states
    }
  }
}

const themes: ColorTheme[] = [
  {
    name: 'Deep Ocean',
    id: 'deep-ocean',
    colors: {
      bg: {
        primary: 'rgb(30, 41, 59)',      // slate-800 - bolder background
        secondary: 'rgba(51, 65, 85, 0.8)', // slate-700/80 - more visible
        tertiary: 'rgb(71, 85, 105)',     // slate-600 - lighter tertiary
        accent: 'rgba(234, 88, 12, 0.15)' // orange-600/15 - more visible accent
      },
      text: {
        primary: 'rgb(248, 250, 252)',   // slate-50
        secondary: 'rgb(226, 232, 240)', // slate-200 - brighter secondary
        muted: 'rgb(175, 187, 206)',     // slate-400 but brighter
        accent: 'rgb(251, 146, 60)'      // orange-400
      },
      border: {
        primary: 'rgba(100, 116, 139, 0.4)', // slate-500/40 - more visible
        secondary: 'rgba(148, 163, 184, 0.3)', // slate-400/30
        accent: 'rgba(234, 88, 12, 0.4)',   // orange-600/40
        glow: 'rgba(251, 146, 60, 0.5)'     // orange-400/50 - stronger glow
      },
      status: {
        success: 'rgb(34, 197, 94)',     // green-500
        warning: 'rgb(251, 146, 60)',    // orange-400
        error: 'rgb(239, 68, 68)',       // red-500
        info: 'rgb(59, 130, 246)'        // blue-500
      },
      interactive: {
        primary: 'rgb(37, 99, 235)',     // blue-600 - brighter
        secondary: 'rgb(234, 88, 12)',   // orange-600
        hover: 'rgb(59, 130, 246)',      // blue-500 - brighter hover
        active: 'rgb(219, 39, 119)'      // pink-600
      }
    }
  },
  {
    name: 'Midnight Steel',
    id: 'midnight-steel',
    colors: {
      bg: {
        primary: 'rgb(31, 41, 55)',      // gray-800 - bolder
        secondary: 'rgba(55, 65, 81, 0.8)', // gray-700/80
        tertiary: 'rgb(75, 85, 99)',     // gray-600
        accent: 'rgba(168, 85, 247, 0.15)' // purple-500/15
      },
      text: {
        primary: 'rgb(249, 250, 251)',   // gray-50
        secondary: 'rgb(229, 231, 235)', // gray-200
        muted: 'rgb(175, 180, 190)',     // brighter gray-400
        accent: 'rgb(196, 181, 253)'     // purple-300
      },
      border: {
        primary: 'rgba(107, 114, 128, 0.4)', // gray-500/40
        secondary: 'rgba(156, 163, 175, 0.3)', // gray-400/30
        accent: 'rgba(168, 85, 247, 0.4)',   // purple-500/40
        glow: 'rgba(196, 181, 253, 0.5)'     // purple-300/50
      },
      status: {
        success: 'rgb(16, 185, 129)',    // emerald-500
        warning: 'rgb(245, 158, 11)',    // amber-500
        error: 'rgb(239, 68, 68)',       // red-500
        info: 'rgb(59, 130, 246)'        // blue-500
      },
      interactive: {
        primary: 'rgb(99, 102, 241)',    // indigo-500 - brighter
        secondary: 'rgb(168, 85, 247)',  // purple-500
        hover: 'rgb(129, 140, 248)',     // indigo-400 - brighter hover
        active: 'rgb(147, 51, 234)'      // purple-600
      }
    }
  },
  {
    name: 'Carbon Dark',
    id: 'carbon-dark',
    colors: {
      bg: {
        primary: 'rgb(24, 24, 27)',      // zinc-900 - bolder
        secondary: 'rgba(39, 39, 42, 0.8)', // zinc-800/80
        tertiary: 'rgb(63, 63, 70)',     // zinc-700
        accent: 'rgba(34, 197, 94, 0.15)' // green-500/15
      },
      text: {
        primary: 'rgb(250, 250, 250)',   // zinc-50
        secondary: 'rgb(228, 228, 231)', // zinc-200
        muted: 'rgb(180, 180, 190)',     // brighter zinc-400
        accent: 'rgb(74, 222, 128)'      // green-400
      },
      border: {
        primary: 'rgba(113, 113, 122, 0.4)', // zinc-500/40
        secondary: 'rgba(161, 161, 170, 0.3)', // zinc-400/30
        accent: 'rgba(34, 197, 94, 0.4)',    // green-500/40
        glow: 'rgba(74, 222, 128, 0.5)'      // green-400/50
      },
      status: {
        success: 'rgb(34, 197, 94)',     // green-500
        warning: 'rgb(251, 191, 36)',    // amber-400
        error: 'rgb(248, 113, 113)',     // red-400
        info: 'rgb(96, 165, 250)'        // blue-400
      },
      interactive: {
        primary: 'rgb(39, 39, 42)',      // zinc-800
        secondary: 'rgb(34, 197, 94)',   // green-500
        hover: 'rgb(63, 63, 70)',        // zinc-700
        active: 'rgb(22, 163, 74)'       // green-600
      }
    }
  }
]

interface ThemeContextType {
  currentTheme: ColorTheme
  setTheme: (themeId: string) => void
  themes: ColorTheme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(themes[0])

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('atproto-theme', themeId)
      }
    }
  }

  useEffect(() => {
    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('atproto-theme')
      if (savedTheme) {
        const theme = themes.find(t => t.id === savedTheme)
        if (theme) {
          setCurrentTheme(theme)
        }
      }
    }
  }, [])

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes
  }

  return (
    <ThemeContext.Provider value={value}>
      <div 
        style={{
          '--bg-primary': currentTheme.colors.bg.primary,
          '--bg-secondary': currentTheme.colors.bg.secondary,
          '--bg-tertiary': currentTheme.colors.bg.tertiary,
          '--bg-accent': currentTheme.colors.bg.accent,
          '--text-primary': currentTheme.colors.text.primary,
          '--text-secondary': currentTheme.colors.text.secondary,
          '--text-muted': currentTheme.colors.text.muted,
          '--text-accent': currentTheme.colors.text.accent,
          '--border-primary': currentTheme.colors.border.primary,
          '--border-secondary': currentTheme.colors.border.secondary,
          '--border-accent': currentTheme.colors.border.accent,
          '--border-glow': currentTheme.colors.border.glow,
          '--status-success': currentTheme.colors.status.success,
          '--status-warning': currentTheme.colors.status.warning,
          '--status-error': currentTheme.colors.status.error,
          '--status-info': currentTheme.colors.status.info,
          '--interactive-primary': currentTheme.colors.interactive.primary,
          '--interactive-secondary': currentTheme.colors.interactive.secondary,
          '--interactive-hover': currentTheme.colors.interactive.hover,
          '--interactive-active': currentTheme.colors.interactive.active,
        } as React.CSSProperties}
      >
        {children}
      </div>
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
