import React from 'react'

interface TimelineProps {
  onOpenThread?: (post: any) => void
}

export function Timeline({ onOpenThread }: TimelineProps) {
  const [posts, setPosts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setPosts([
        {
          uri: 'at://example/post/1',
          cid: 'cid1',
          author: {
            did: 'did:plc:example',
            handle: 'example.bsky.social',
            displayName: 'Example User'
          },
          record: {
            text: 'Hello from AT Protocol!'
          },
          indexedAt: new Date().toISOString(),
          replyCount: 0,
          repostCount: 0,
          likeCount: 0
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading timeline...</div>
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div
          key={post.uri}
          onClick={() => onOpenThread?.(post)}
          className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="font-semibold">{post.author.displayName}</div>
            <div className="text-gray-500 text-sm">@{post.author.handle}</div>
          </div>
          <p className="text-gray-900">{post.record?.text}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>💬 {post.replyCount}</span>
            <span>🔄 {post.repostCount}</span>
            <span>❤️ {post.likeCount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
