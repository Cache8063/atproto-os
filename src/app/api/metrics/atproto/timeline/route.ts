import { NextRequest, NextResponse } from 'next/server'
import { hybridATProtoAuth } from '@/lib/hybrid-atproto-auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!hybridATProtoAuth.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const agent = hybridATProtoAuth.getAgent()
    if (!agent) {
      return NextResponse.json(
        { error: 'No agent available' },
        { status: 500 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const cursor = searchParams.get('cursor') || undefined

    // Fetch timeline using the authenticated agent
    const timelineResponse = await agent.getTimeline({
      limit: Math.min(limit, 50), // Cap at 50 for performance
      cursor
    })

    if (!timelineResponse.success) {
      throw new Error('Failed to fetch timeline')
    }

    // Process the timeline data
    const posts = timelineResponse.data.feed.map(item => {
      const post = item.post
      const author = post.author
      
      return {
        uri: post.uri,
        cid: post.cid,
        author: {
          did: author.did,
          handle: author.handle,
          displayName: author.displayName || author.handle,
          avatar: author.avatar || null
        },
        text: (post.record as any)?.text || '',
        createdAt: (post.record as any)?.createdAt || post.indexedAt,
        replyCount: post.replyCount || 0,
        repostCount: post.repostCount || 0,
        likeCount: post.likeCount || 0,
        isRepost: !!item.reason?.['$type']?.includes('repost'),
        repostBy: (item.reason as any)?.by ? {
          did: (item.reason as any).by.did,
          handle: (item.reason as any).by.handle,
          displayName: (item.reason as any).by.displayName || (item.reason as any).by.handle
        } : null,
        // Extract embeds/images if present
        embed: post.embed ? {
          type: (post.embed as any).$type || 'unknown',
          images: (post.embed as any).images || [],
          external: (post.embed as any).external || null
        } : null
      }
    })

    return NextResponse.json({
      posts,
      cursor: timelineResponse.data.cursor || null,
      service: hybridATProtoAuth.getCurrentService(),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Timeline API error:', error)
    
    // Try to refresh session once if authentication failed
    if (error.message?.includes('auth') || error.message?.includes('token')) {
      try {
        const refreshed = await hybridATProtoAuth.refreshSession()
        if (refreshed) {
          // Retry the request once after refresh
          return GET(request)
        }
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError)
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch timeline',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    if (!hybridATProtoAuth.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const agent = hybridATProtoAuth.getAgent()
    if (!agent) {
      return NextResponse.json(
        { error: 'No agent available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Post to the timeline
    const postResponse = await agent.post({
      text: text.trim(),
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      uri: postResponse.uri,
      cid: postResponse.cid,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}