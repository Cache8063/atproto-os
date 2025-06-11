import React from 'react'
import { useTheme } from '@/lib/themes'
import { Check } from 'lucide-react'

export function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme()
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Theme</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.values(availableThemes).map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${currentTheme.id === theme.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 hover:border-gray-600'
              }
            `}
          >
            <div 
              className="w-full h-16 rounded-md mb-2 border border-gray-600"
              style={{ backgroundColor: theme.colors.bg }}
            >
              <div className="p-2 space-y-1">
                <div 
                  className="h-2 w-3/4 rounded"
                  style={{ backgroundColor: theme.colors.text }}
                />
                <div 
                  className="h-2 w-1/2 rounded"
                  style={{ backgroundColor: theme.colors.textMedium }}
                />
                <div 
                  className="h-2 w-1/4 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              </div>
            </div>
            
            <div className="text-sm font-medium text-white">{theme.name}</div>
            
            {currentTheme.id === theme.id && (
              <div className="absolute top-2 right-2 text-blue-400">
                <Check className="w-4 h-4" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
