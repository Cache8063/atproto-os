'use client'
import React from 'react'
import { VERSION, BUILD_TIME_LOCAL, BUILD_ID } from '@/lib/version'

export default function VersionFooter() {
  return (
    <footer className="fixed bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-l border-gray-700/30 px-3 py-1 text-xs text-gray-400 rounded-tl-lg">
      <div className="flex items-center space-x-3">
        <span className="font-mono text-blue-400">{VERSION}</span>
        <span className="text-gray-500">•</span>
        <span>Build: {BUILD_TIME_LOCAL}</span>
        <span className="text-gray-500">•</span>
        <span className="font-mono text-gray-500">{BUILD_ID}</span>
      </div>
    </footer>
  )
}
