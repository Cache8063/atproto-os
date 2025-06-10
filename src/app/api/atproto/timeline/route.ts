import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function GET(request: NextRequest) {
  try {
    // Get auth info from headers
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    console.log('Timeline API: Received headers:', {
      hasAuth: !!authHeader,
      hasSession: !!sessionHeader,
      service: serviceHeader
    })
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      console.log('Timeline API: Missing required headers')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse session data
    let sessionData
    try {
      sessionData = JSON.parse(sessionHeader)
      console.log('Timeline API: Session data for handle:', sessionData.handle)
    } catch (error) {
      console.log('Timeline API: Invalid session header')
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    console.log('Timeline API: Creating agent for service:', serviceHeader)
    
    // Create agent with the correct service
    const agent = new BskyAgent({ 
      service: serviceHeader
    })
    
    await agent.resumeSession({
      accessJwt: sessionData.accessJwt,
      refreshJwt: sessionData.refreshJwt,
      handle: sessionData.handle,
      did: sessionData.did,
      active: true
    })

    console.log('Timeline API: Session resumed successfully')

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const cursor = searchParams.get('cursor') || undefined

    console.log(`Timeline API: Fetching timeline with limit=${limit}`)

    // Fetch timeline using the authenticated agent
    const timelineResponse = await agent.getTimeline({
      limit: Math.min(limit, 50), // Cap at 50 for performance
      cursor
    })

    if (!timelineResponse.success) {
      throw new Error('Failed to fetch timeline')
    }

    console.log(`Timeline API: Successfully fetched ${timelineResponse.data.feed.length} posts`)

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
      service: serviceHeader,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Timeline API error:', error)
    
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
    // Get auth info from headers
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    console.log('Timeline POST: Received headers for service:', serviceHeader)
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      console.log('Timeline POST: Missing required headers')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Parse session data
    let sessionData
    try {
      sessionData = JSON.parse(sessionHeader)
    } catch (error) {
      console.log('Timeline POST: Invalid session header')
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    console.log('Timeline POST: Creating agent for service:', serviceHeader)
    
    // Create agent with the correct service
    const agent = new BskyAgent({ 
      service: serviceHeader
    })
    
    await agent.resumeSession({
      accessJwt: sessionData.accessJwt,
      refreshJwt: sessionData.refreshJwt,
      handle: sessionData.handle,
      did: sessionData.did,
      active: true
    })

    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    console.log(`Timeline POST: Creating post with text length=${text.length}`)

    // Post to the timeline
    const postResponse = await agent.post({
      text: text.trim(),
      createdAt: new Date().toISOString()
    })

    console.log('Timeline POST: Post created successfully')

    return NextResponse.json({
      success: true,
      uri: postResponse.uri,
      cid: postResponse.cid,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Timeline POST error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
