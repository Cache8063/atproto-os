import React, { memo } from 'react'
import { ArrowLeft, Menu, MoreHorizontal } from 'lucide-react'

export const Outer = memo(function HeaderOuter({
  children,
  sticky = true,
  className = '',
}: React.PropsWithChildren<{sticky?: boolean; className?: string}>) {
  return (
    <header className={`w-full border-b border-gray-800 bg-black z-10 ${sticky ? 'sticky top-0' : ''} ${className}`}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between h-12 px-4">
          {children}
        </div>
      </div>
    </header>
  )
})

export const BackButton = memo(function HeaderBackButton({
  onPress,
  className = '',
}: {onPress?: () => void; className?: string}) {
  return (
    <button
      onClick={onPress || (() => window.history.back())}
      className={`p-2 hover:bg-gray-800 rounded-full transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
})

export const MenuButton = memo(function HeaderMenuButton({
  onPress,
  className = '',
}: {onPress?: () => void; className?: string}) {
  return (
    <button
      onClick={onPress}
      className={`p-2 hover:bg-gray-800 rounded-full transition-colors md:hidden ${className}`}
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  )
})

export const Content = memo(function HeaderContent({
  children,
  align = 'left',
  className = '',
}: React.PropsWithChildren<{align?: 'left' | 'center'; className?: string}>) {
  return (
    <div className={`flex-1 flex items-center min-h-0 ${align === 'center' ? 'justify-center' : 'justify-start'} ${className}`}>
      {children}
    </div>
  )
})

export const TitleText = memo(function HeaderTitleText({
  children,
  className = '',
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <h1 className={`text-lg font-bold text-white truncate ${className}`}>
      {children}
    </h1>
  )
})

export const Slot = memo(function HeaderSlot({
  children,
  className = '',
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <div className={`flex items-center justify-end min-w-0 ${className}`}>
      {children}
    </div>
  )
})
