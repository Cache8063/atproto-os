import React from 'react'
import { PostItem } from './PostItem'

export function Timeline() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-gray-500">Loading timeline...</div>
      </div>
    )
  }

  const mockPost = {
    uri: 'test-post',
    text: 'Welcome to AT Protocol Dashboard!',
    author: {
      handle: 'demo.bsky.social',
      displayName: 'Demo User'
    },
    indexedAt: new Date().toISOString()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800 text-sm">
          🚀 Dashboard loaded successfully! This is a demo post.
        </p>
      </div>
      <PostItem post={mockPost} />
    </div>
  )
}
