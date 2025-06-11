import React, { memo } from 'react'

export const Screen = memo(function Screen({
  children,
  className = '',
  ...props
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <div className={`min-h-screen w-full bg-black text-white ${className}`} {...props}>
      {children}
    </div>
  )
})

export const Center = memo(function LayoutCenter({
  children,
  className = '',
  ...props
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <div className={`w-full mx-auto max-w-xl ${className}`} {...props}>
      {children}
    </div>
  )
})

export const Content = memo(function LayoutContent({
  children,
  className = '',
  ...props
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <div className={`w-full overflow-y-auto ${className}`} {...props}>
      <Center>
        {children}
      </Center>
    </div>
  )
})

export * as Header from './Header'
