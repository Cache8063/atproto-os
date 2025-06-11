import { NextRequest, NextResponse } from 'next/server'
import { BskyAgent } from '@atproto/api'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionHeader = request.headers.get('x-at-session')
    const serviceHeader = request.headers.get('x-at-service')
    
    if (!authHeader || !sessionHeader || !serviceHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionHeader)
    const agent = new BskyAgent({ service: serviceHeader })
    
    await agent.resumeSession({
      accessJwt: sessionData.accessJwt,
      refreshJwt: sessionData.refreshJwt,
      handle: sessionData.handle,
      did: sessionData.did,
      active: true
    })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor') || undefined

    console.log(`Notifications API: Fetching ${limit} notifications`)

    const notificationsResponse = await agent.listNotifications({
      limit: Math.min(limit, 100),
      cursor
    })

    if (!notificationsResponse.success) {
      throw new Error('Failed to fetch notifications')
    }

    console.log(`Notifications API: Got ${notificationsResponse.data.notifications.length} notifications`)

    const notifications = notificationsResponse.data.notifications.map(notif => {
      let postData = null
      
      if (notif.record && typeof notif.record === 'object') {
        postData = {
          uri: notif.uri,
          text: (notif.record as any)?.text || ''
        }
      } else if (notif.reasonSubject) {
        postData = {
          uri: notif.reasonSubject,
          text: 'Post interaction'
        }
      }

      return {
        id: notif.uri || `${notif.reason}-${notif.author.did}-${notif.indexedAt}`,
        type: notif.reason,
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
