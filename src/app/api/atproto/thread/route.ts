import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function GET(request: NextRequest) {
  try {
    // Get auth headers
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse session and create agent
    const sessionData = JSON.parse(sessionHeader)
    const agent = new BskyAgent({ service: serviceHeader })
    
    await agent.resumeSession({
      accessJwt: sessionData.accessJwt,
      refreshJwt: sessionData.refreshJwt,
      handle: sessionData.handle,
      did: sessionData.did,
      active: true
    })

    // Get the post URI from query params
    const { searchParams } = new URL(request.url)
    const postUri = searchParams.get('uri')
    
    if (!postUri) {
      return NextResponse.json({ error: 'Post URI is required' }, { status: 400 })
    }

    console.log(`Thread API: Fetching thread for ${postUri}`)

    // Fetch the thread using AT Protocol
    const threadResponse = await agent.getPostThread({
      uri: postUri,
      depth: 10 // Get nested replies
    })

    if (!threadResponse.success) {
      throw new Error('Failed to fetch thread')
    }

    // Process the thread data
    const processPost = (threadPost: any) => {
      if (!threadPost || !threadPost.post) return null
      
      const post = threadPost.post
      return {
        uri: post.uri,
        cid: post.cid,
        author: {
          did: post.author.did,
          handle: post.author.handle,
          displayName: post.author.displayName || post.author.handle,
          avatar: post.author.avatar
        },
        text: post.record?.text || '',
        createdAt: post.record?.createdAt || post.indexedAt,
        replyCount: post.replyCount || 0,
        repostCount: post.repostCount || 0,
        likeCount: post.likeCount || 0,
        replies: threadPost.replies ? threadPost.replies.map(processPost).filter(Boolean) : []
      }
    }

    const thread = processPost(threadResponse.data.thread)

    return NextResponse.json({
      thread,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Thread API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread', details: error.message },
      { status: 500 }
    )
  }
}
