'use client'
import { Timeline } from '@/components/Timeline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            AT Protocol Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Multi-service AT Protocol interface
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Timeline />
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          AT Protocol Dashboard v0.05a
        </div>
      </footer>
    </div>
  )
}
