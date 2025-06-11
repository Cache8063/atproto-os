// Basic AT Protocol types to match Bluesky's patterns
export interface ATUri {
  scheme: string
  authority: string
  path: string
  toString(): string
}

export interface PostRecord {
  text: string
  createdAt: string
  facets?: any[]
  reply?: {
    root: { uri: string; cid: string }
    parent: { uri: string; cid: string }
  }
  embed?: any
}

export interface ProfileView {
  did: string
  handle: string
  displayName?: string
  avatar?: string
  viewer?: {
    muted?: boolean
    blockedBy?: boolean
    blocking?: string
    following?: string
    followedBy?: string
  }
}

export interface PostView {
  uri: string
  cid: string
  author: ProfileView
  record: PostRecord
  embed?: any
  replyCount?: number
  repostCount?: number
  likeCount?: number
  indexedAt: string
  viewer?: {
    repost?: string
    like?: string
  }
  labels?: any[]
}

export interface ReasonRepost {
  $type: 'app.bsky.feed.defs#reasonRepost'
  by: ProfileView
  indexedAt: string
}

export interface ReasonPin {
  $type: 'app.bsky.feed.defs#reasonPin'
}

export interface FeedViewPost {
  post: PostView
  reason?: ReasonRepost | ReasonPin
  feedContext?: string
}
