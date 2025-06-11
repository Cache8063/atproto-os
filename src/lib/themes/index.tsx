'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

export const themes = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      bg: '#000000',
      bgContrast25: '#0a0a0a',
      bgContrast50: '#1a1a1a',
      text: '#ffffff',
      textMedium: '#a3a3a3',
      textLow: '#737373',
      border: '#262626',
      primary: '#1d4ed8',
      secondary: '#ea580c',
    }
  },
  dim: {
    id: 'dim',
    name: 'Dim',
    colors: {
      bg: '#0f1419',
      bgContrast25: '#16202a',
      bgContrast50: '#1e2d3a',
      text: '#ffffff',
      textMedium: '#8b98a5',
      textLow: '#657786',
      border: '#253341',
      primary: '#1d9bf0',
      secondary: '#f4900c',
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      bg: '#0a0a0f',
      bgContrast25: '#12121a',
      bgContrast50: '#1a1a26',
      text: '#e6e6ff',
      textMedium: '#9999b3',
      textLow: '#66667f',
      border: '#252533',
      primary: '#6366f1',
      secondary: '#f59e0b',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      bg: '#0f1419',
      bgContrast25: '#0a1419',
      bgContrast50: '#162026',
      text: '#f0f9ff',
      textMedium: '#7dd3fc',
      textLow: '#0369a1',
      border: '#1f2937',
      primary: '#0ea5e9',
      secondary: '#f97316',
    }
  }
}

const ThemeContext = createContext<{
  currentTheme: typeof themes.dark
  setTheme: (themeId: string) => void
  availableThemes: typeof themes
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState('dark')
  
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved && themes[saved as keyof typeof themes]) {
      setCurrentThemeId(saved)
    }
  }, [])
  
  useEffect(() => {
    const theme = themes[currentThemeId as keyof typeof themes]
    const root = document.documentElement
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${theme.id}`)
  }, [currentThemeId])
  
  const setTheme = (themeId: string) => {
    if (themes[themeId as keyof typeof themes]) {
      setCurrentThemeId(themeId)
      localStorage.setItem('theme', themeId)
    }
  }
  
  const value = {
    currentTheme: themes[currentThemeId as keyof typeof themes],
    setTheme,
    availableThemes: themes,
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
