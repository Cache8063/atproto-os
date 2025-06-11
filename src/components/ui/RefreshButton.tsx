import React from 'react'
import { RefreshCw, ArrowUp } from 'lucide-react'

interface RefreshButtonProps {
  onClick: () => void
  showIndicator: boolean
  label: string
  className?: string
}

export function RefreshButton({ onClick, showIndicator, label, className = '' }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-full 
        shadow-lg transition-all duration-200 flex items-center space-x-2
        ${showIndicator ? 'animate-pulse' : ''}
        ${className}
      `}
      aria-label={label}
    >
      {showIndicator ? (
        <RefreshCw className="w-4 h-4" />
      ) : (
        <ArrowUp className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">{label}</span>
      {showIndicator && (
        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
      )}
    </button>
  )
}
