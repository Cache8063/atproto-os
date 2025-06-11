'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell,
  Heart,
  Repeat,
  AtSign,
  UserPlus,
  MessageCircle,
  RefreshCw,
  Filter
} from 'lucide-react'
import { useAuth } from '@/contexts/hybrid-auth-context'

interface NotificationItem {
  id: string
  type: 'like' | 'repost' | 'mention' | 'reply' | 'follow'
  author: {
    did: string
    handle: string
    displayName: string
    avatar?: string
  }
  post?: {
    uri: string
    text: string
  }
  createdAt: string
  read: boolean
}

interface NotificationsViewProps {
  onOpenThread: (post: any) => void
}

export default function NotificationsView({ onOpenThread }: NotificationsViewProps) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mentions' | 'likes' | 'reposts' | 'follows'>('all')

  // Mock notifications for now - replace with real API call
  useEffect(() => {
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'like',
        author: {
          did: 'did:plc:example1',
          handle: 'alice.bsky.social',
          displayName: 'Alice Johnson',
          avatar: undefined
        },
        post: {
          uri: 'at://did:plc:example/app.bsky.feed.post/1',
          text: 'Just set up my AT Protocol dashboard! 🚀'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        read: false
      },
      {
        id: '2',
        type: 'mention',
        author: {
          did: 'did:plc:example2',
          handle: 'bob.arcnode.xyz',
          displayName: 'Bob Smith'
        },
        post: {
          uri: 'at://did:plc:example/app.bsky.feed.post/2',
          text: 'Hey @bkb.arcnode.xyz, how did you get the threading to work so smoothly?'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: '3',
        type: 'repost',
        author: {
          did: 'did:plc:example3',
          handle: 'charlie.bsky.social',
          displayName: 'Charlie Brown'
        },
        post: {
          uri: 'at://did:plc:example/app.bsky.feed.post/3',
          text: 'The new AT Protocol dashboard is looking incredible!'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        read: true
      },
      {
        id: '4',
        type: 'follow',
        author: {
          did: 'did:plc:example4',
          handle: 'diana.bsky.social',
          displayName: 'Diana Prince'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true
      }
    ]

    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 500)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4" style={{ color: 'var(--status-error)' }} />
      case 'repost': return <Repeat className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
      case 'mention': return <AtSign className="w-4 h-4" style={{ color: 'var(--interactive-primary)' }} />
      case 'reply': return <MessageCircle className="w-4 h-4" style={{ color: 'var(--interactive-primary)' }} />
      case 'follow': return <UserPlus className="w-4 h-4" style={{ color: 'var(--text-accent)' }} />
      default: return <Bell className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
    }
  }

  const getNotificationText = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'like':
        return `liked your post`
      case 'repost':
        return `reposted your post`
      case 'mention':
        return `mentioned you`
      case 'reply':
        return `replied to your post`
      case 'follow':
        return `started following you`
      default:
        return 'notification'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffMs = now.getTime() - posted.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 30) return `${diffDays}d`
    return posted.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'mentions') return notification.type === 'mention' || notification.type === 'reply'
    if (filter === 'likes') return notification.type === 'like'
    if (filter === 'reposts') return notification.type === 'repost'
    if (filter === 'follows') return notification.type === 'follow'
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6" style={{ color: 'var(--text-accent)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--status-error)', color: 'var(--text-primary)' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded hover:opacity-75" style={{ color: 'var(--text-secondary)' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'mentions', label: 'Mentions', count: notifications.filter(n => n.type === 'mention' || n.type === 'reply').length },
            { key: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
            { key: 'reposts', label: 'Reposts', count: notifications.filter(n => n.type === 'repost').length },
            { key: 'follows', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-2 rounded text-sm transition-all duration-200 ${
                filter === tab.key ? 'border' : 'hover:opacity-75'
              }`}
              style={{
                backgroundColor: filter === tab.key ? 'var(--interactive-primary)20' : 'transparent',
                borderColor: filter === tab.key ? 'var(--border-accent)' : 'transparent',
                color: filter === tab.key ? 'var(--text-accent)' : 'var(--text-secondary)'
              }}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--interactive-primary)' }}></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center p-6" style={{ color: 'var(--text-muted)' }}>
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">When people interact with your posts, you'll see it here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border-b hover:opacity-90 transition-colors ${
                  !notification.read ? 'border-l-4' : ''
                }`}
                style={{ 
                  borderColor: 'var(--border-primary)20',
                  borderLeftColor: !notification.read ? 'var(--interactive-primary)' : 'transparent',
                  backgroundColor: !notification.read ? 'var(--interactive-primary)05' : 'transparent'
                }}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {notification.author.avatar ? (
                        <img
                          src={notification.author.avatar}
                          alt={notification.author.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                          style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: 'var(--bg-tertiary)',
                            width: '32px', 
                            height: '32px', 
                            minWidth: '32px', 
                            minHeight: '32px' 
                          }}
                        >
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {notification.author.displayName[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {notification.author.displayName}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {getNotificationText(notification)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      
                      {notification.post && (
                        <div 
                          className="mt-2 text-sm p-2 rounded border cursor-pointer hover:opacity-75"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-secondary)'
                          }}
                          onClick={() => onOpenThread(notification.post)}
                        >
                          {notification.post.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
