// Add this to your existing full-dashboard.tsx file

import { BskyAgent, AppBskyFeedDefs } from '@atproto/api'

// Add to your existing interfaces section
interface Post {
  uri: string
  cid: string
  author: {
    handle: string
    displayName?: string
    avatar?: string
  }
  record: {
    text: string
    createdAt: string
  }
  replyCount: number
  repostCount: number
  likeCount: number
  indexedAt: string
}

// Feed Widget Component - Add this with your other components
const FeedWidget = ({ agent }: { agent: BskyAgent | null }) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchFeed = async () => {
    if (!agent) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await agent.getTimeline({
        limit: 10
      })
      
      const formattedPosts = response.data.feed.map((item: any) => ({
        uri: item.post.uri,
        cid: item.post.cid,
        author: {
          handle: item.post.author.handle,
          displayName: item.post.author.displayName,
          avatar: item.post.author.avatar
        },
        record: {
          text: item.post.record.text,
          createdAt: item.post.record.createdAt
        },
        replyCount: item.post.replyCount || 0,
        repostCount: item.post.repostCount || 0,
        likeCount: item.post.likeCount || 0,
        indexedAt: item.post.indexedAt
      }))
      
      setPosts(formattedPosts)
    } catch (err) {
      console.error('Feed fetch error:', err)
      setError('Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (agent) {
      fetchFeed()
    }
  }, [agent])

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`
    return `${Math.floor(diffMins / 1440)}d`
  }

  return (
    <Widget title="Your Bluesky Feed" icon={MessageSquare} className="lg:col-span-2">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-400">Loading your timeline...</span>
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No posts in your timeline</p>
          </div>
        )}

        {posts.map((post) => (
          <div key={post.uri} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/20 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {post.author.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.handle}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-white truncate">
                    {post.author.displayName || post.author.handle}
                  </span>
                  <span className="text-gray-400 text-sm">
                    @{post.author.handle}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatRelativeTime(post.record.createdAt)}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {post.record.text}
                </p>
                
                <div className="flex items-center space-x-6 text-gray-400 text-xs">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replyCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.repostCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {!loading && posts.length > 0 && (
          <button
            onClick={fetchFeed}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Refresh Feed
          </button>
        )}
      </div>
    </Widget>
  )
}

// Update your Dashboard component to include the agent and FeedWidget
function Dashboard({ session, serviceEndpoint, onLogout }: { 
  session: AuthSession; 
  serviceEndpoint: string;
  onLogout: () => void 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)
  const [agent, setAgent] = useState<BskyAgent | null>(null)

  // Initialize agent when session is available
  useEffect(() => {
    if (session) {
      const newAgent = new BskyAgent({ service: serviceEndpoint })
      // Restore session to agent
      newAgent.session = session
      setAgent(newAgent)
    }
  }, [session, serviceEndpoint])

  // ... existing useEffect for time ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* ... existing header ... */}

      <div className="flex">
        {/* ... existing sidebar ... */}

        {/* Main Content - Updated grid */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feed Widget - spans 2 columns */}
            <FeedWidget agent={agent} />
            
            {/* Terminal Widget - now takes 1 column */}
            <TerminalWidget />
            
            {/* System Metrics */}
            <Widget title="System Metrics" icon={Activity}>
              {/* ... existing metrics ... */}
            </Widget>

            {/* AT Protocol Status */}
            <Widget title="AT Protocol Status" icon={Server}>
              {/* ... existing status ... */}
            </Widget>

            {/* Alerts */}
            <Widget title="Alerts" icon={AlertTriangle}>
              {/* ... existing alerts ... */}
            </Widget>
          </div>
        </main>
      </div>
    </div>
  )
}

// Update your main FullDashboard component to pass the agent
const FullDashboard = () => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [serviceEndpoint, setServiceEndpoint] = useState<string>('https://bsky.social')

  const handleLogin = async (credentials: AuthCredentials) => {
    setLoading(true)
    try {
      const endpoint = credentials.service || 'https://bsky.social'
      
      const agent = new BskyAgent({
        service: endpoint
      })

      const response = await agent.login({
        identifier: credentials.identifier,
        password: credentials.password
      })
      
      if (response.success && agent.session) {
        const newSession: AuthSession = {
          accessJwt: agent.session.accessJwt,
          refreshJwt: agent.session.refreshJwt,
          handle: agent.session.handle,
          did: agent.session.did,
          active: agent.session.active || true
        }

        setSession(newSession)
        setServiceEndpoint(endpoint)
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setSession(null)
    setServiceEndpoint('https://bsky.social')
  }

  if (!session) {
    return <LoginModal onLogin={handleLogin} loading={loading} />
  }

  return <Dashboard session={session} serviceEndpoint={serviceEndpoint} onLogout={handleLogout} />
}