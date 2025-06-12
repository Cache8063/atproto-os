import React from 'react'

interface SimplePost {
  uri?: string
  text?: string
  author?: {
    handle?: string
    displayName?: string
  }
  indexedAt?: string
}

interface PostItemProps {
  post: SimplePost
}

export function PostItem({ post }: PostItemProps) {
  if (!post) {
    return <div className="p-4 text-gray-500">No post data</div>
  }

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="mb-2">
        <span className="font-semibold">
          {post.author?.displayName || post.author?.handle || 'Unknown User'}
        </span>
      </div>
      <div className="text-gray-900">
        {post.text || 'No content'}
      </div>
      {post.indexedAt && (
        <div className="text-sm text-gray-500 mt-2">
          {new Date(post.indexedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
