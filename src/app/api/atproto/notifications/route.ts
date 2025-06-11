import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function GET(request: NextRequest) {
  try {
    // Get auth headers (same pattern as timeline)
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor') || undefined

    console.log(`Notifications API: Fetching ${limit} notifications`)

    // Fetch notifications using AT Protocol
    const notificationsResponse = await agent.listNotifications({
      limit: Math.min(limit, 100),
      cursor
    })

    if (!notificationsResponse.success) {
      throw new Error('Failed to fetch notifications')
    }

    console.log(`Notifications API: Got ${notificationsResponse.data.notifications.length} notifications`)

    // Process notifications into our format
    const notifications = notificationsResponse.data.notifications.map(notif => {
      // Handle different notification types and their data structures
      let postData = null
      
      if (notif.record && typeof notif.record === 'object') {
        // For posts/replies, the record contains the text
        postData = {
          uri: notif.uri,
          text: (notif.record as any)?.text || ''
        }
      } else if (notif.reasonSubject) {
        // For likes/reposts, we need to look at the subject
        postData = {
          uri: notif.reasonSubject,
          text: 'Post interaction' // We'd need another API call to get the actual post text
        }
      }

      return {
        id: notif.uri || `${notif.reason}-${notif.author.did}-${notif.indexedAt}`,
        type: notif.reason, // 'like', 'repost', 'mention', 'reply', 'follow'
        author: {
          did: notif.author.did,
          handle: notif.author.handle,
          displayName: notif.author.displayName || notif.author.handle,
          avatar: notif.author.avatar
        },
        post: postData,
        createdAt: notif.indexedAt,
        read: notif.isRead || false
      }
    })

    return NextResponse.json({
      notifications,
      cursor: notificationsResponse.data.cursor || null,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    )
  }
}
