export const dynamic = 'force-dynamic'

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function POST(request: NextRequest) {
  try {
    // Get auth info from headers
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      console.log('Edit API: Missing auth headers')
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
      console.log('Edit API: Invalid session header')
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { postUri, postCid, newText, originalCreatedAt } = body

    if (!postUri || !postCid || !newText) {
      return NextResponse.json(
        { error: 'postUri, postCid, and newText are required' },
        { status: 400 }
      )
    }

    console.log(`Edit API: Editing post ${postUri}`)

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

    // Extract rkey from URI (e.g., "at://did:plc:xxx/app.bsky.feed.post/rkey")
    const uriParts = postUri.split('/')
    const rkey = uriParts[uriParts.length - 1]

    console.log(`Edit API: Using rkey ${rkey} for putRecord`)

    // Use putRecord to replace the existing post
    const result = await agent.com.atproto.repo.putRecord({
      repo: sessionData.did,
      collection: 'app.bsky.feed.post',
      rkey: rkey,
      record: {
        text: newText.trim(),
        createdAt: originalCreatedAt || new Date().toISOString(),
        $type: 'app.bsky.feed.post'
      },
      swapRecord: postCid // For concurrency safety
    })

    console.log('Edit API: Post edited successfully:', result.uri)

    return NextResponse.json({
      success: true,
      uri: result.uri,
      cid: result.cid,
      originalUri: postUri,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Edit API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to edit post',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
