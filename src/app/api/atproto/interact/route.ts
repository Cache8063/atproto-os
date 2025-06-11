import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function POST(request: NextRequest) {
  try {
    // Get auth info from headers
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      console.log('Interaction API: Missing auth headers')
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
      console.log('Interaction API: Invalid session header')
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    const { action, postUri, postCid, text } = body

    if (!action || !postUri) {
      return NextResponse.json(
        { error: 'Action and postUri are required' },
        { status: 400 }
      )
    }

    console.log(`Interaction API: ${action} on post ${postUri} with CID ${postCid}`)

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

    let result
    
    switch (action) {
      case 'like':
        if (!postCid) {
          return NextResponse.json(
            { error: 'postCid required for like' },
            { status: 400 }
          )
        }
        
        result = await agent.like(postUri, postCid)
        console.log(`Interaction API: Like successful:`, result.uri)
        break
        
      case 'repost':
        if (!postCid) {
          return NextResponse.json(
            { error: 'postCid required for repost' },
            { status: 400 }
          )
        }
        
        result = await agent.repost(postUri, postCid)
        console.log(`Interaction API: Repost successful:`, result.uri)
        break
        
      case 'reply':
        if (!text) {
          return NextResponse.json(
            { error: 'Text required for reply' },
            { status: 400 }
          )
        }
        
        if (!postCid) {
          return NextResponse.json(
            { error: 'postCid required for reply' },
            { status: 400 }
          )
        }
        
        // For replies, we need to create a post with a reply reference
        result = await agent.post({
          text: text,
          reply: {
            root: { uri: postUri, cid: postCid },
            parent: { uri: postUri, cid: postCid }
          },
          createdAt: new Date().toISOString()
        })
        console.log(`Interaction API: Reply successful:`, result.uri)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      uri: result.uri,
      cid: result.cid,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error(`Interaction API error:`, error)
    
    // Handle specific AT Protocol errors
    if (error.message?.includes('already exists') || error.message?.includes('DuplicateCreate')) {
      return NextResponse.json({
        success: true,
        message: 'Already performed this action',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to perform interaction',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
