import './globals.css'
import { AuthProvider } from '@/contexts/hybrid-auth-context'
import { ThemeProvider } from '@/contexts/theme-context'

export const metadata = {
  title: 'AT Protocol Dashboard',
  description: 'Professional AT Protocol client',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg text-text">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
