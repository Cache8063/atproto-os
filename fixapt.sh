#!/bin/bash

# Quick fix for Next.js API routes - adds dynamic export to prevent build failures

echo "🔧 Fixing Next.js API routes..."

# Add dynamic export to thread route
cat > src/app/api/atproto/thread/route.ts << 'EOF'
export const dynamic = 'force-dynamic'

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
    const postUri = searchParams.get('uri')
    
    if (!postUri) {
      return NextResponse.json({ error: 'Post URI is required' }, { status: 400 })
    }

    console.log(`Thread API: Fetching thread for ${postUri}`)

    const threadResponse = await agent.getPostThread({
      uri: postUri,
      depth: 10
    })

    if (!threadResponse.success) {
      throw new Error('Failed to fetch thread')
    }

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
EOF

# Add dynamic export to notifications route
cat > src/app/api/atproto/notifications/route.ts << 'EOF'
export const dynamic = 'force-dynamic'

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
EOF

# Add dynamic export to timeline route
sed -i '1i export const dynamic = '\''force-dynamic'\''\n' src/app/api/atproto/timeline/route.ts

# Add dynamic export to interact route
sed -i '1i export const dynamic = '\''force-dynamic'\''\n' src/app/api/atproto/interact/route.ts

# Add dynamic export to edit route
sed -i '1i export const dynamic = '\''force-dynamic'\''\n' src/app/api/atproto/edit/route.ts

# Add dynamic export to metrics route
sed -i '1i export const dynamic = '\''force-dynamic'\''\n' src/app/api/metrics/route.ts

echo "✅ Fixed all API routes with dynamic exports"
echo ""
echo "🚀 Now run: npm run build"
echo ""
echo "The fix adds 'export const dynamic = \"force-dynamic\"' to each API route"
echo "This tells Next.js to render these routes server-side at runtime"
echo "instead of trying to pre-render them during build."
