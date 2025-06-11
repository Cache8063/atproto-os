import './globals.css'
import { ThemeProvider } from '@/lib/themes'

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
