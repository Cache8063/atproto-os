'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw,
  Send,
  Heart,
  Repeat,
  Reply,
  MessageCircle,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/hybrid-auth-context';

interface TimelinePost {
  uri: string
  cid: string
  author: {
    did: string
    handle: string
    displayName: string
    avatar?: string | null
  }
  text: string
  createdAt: string
  replyCount: number
  repostCount: number
  likeCount: number
  isRepost: boolean
  repostBy?: {
    did: string
    handle: string
    displayName: string
  } | null
}

interface TimelineViewProps {
  onOpenThread: (post: TimelinePost) => void
}

export default function TimelineView({ onOpenThread }: TimelineViewProps) {
  const { isAuthenticated, session, service } = useAuth();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(25);
  const [interactionFeedback, setInteractionFeedback] = useState<{[key: string]: string}>({});
  const [interactionLoading, setInteractionLoading] = useState<{[key: string]: boolean}>({});

  const getAuthHeaders = () => {
    if (!session || !service) return {};
    
    return {
      'Authorization': `Bearer ${session.accessJwt}`,
      'X-AT-Session': JSON.stringify({
        handle: session.handle,
        did: session.did,
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt
      }),
      'X-AT-Service': service
    };
  };

  const fetchTimeline = async () => {
    if (!isAuthenticated || !session || !service) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/atproto/timeline?limit=10', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.status === 401) {
        setError('Not authenticated');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch timeline');
      }
      
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error('Timeline fetch error:', error);
      setError(error.message || 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || posting || !isAuthenticated) return;

    setPosting(true);
    try {
      const response = await fetch('/api/atproto/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ text: newPost.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post');
      }

      setNewPost('');
      // Only refresh timeline after posting, not interactions
      await fetchTimeline();
    } catch (error: any) {
      console.error('Post error:', error);
      setError(error.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleInteraction = async (action: 'like' | 'repost', post: TimelinePost) => {
    if (!isAuthenticated || !session || !service) return;

    // Prevent multiple simultaneous interactions on same post
    const interactionKey = `${post.uri}-${action}`;
    if (interactionLoading[interactionKey]) return;

    setInteractionLoading(prev => ({ ...prev, [interactionKey]: true }));

    try {
      const response = await fetch('/api/atproto/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ 
          action, 
          postUri: post.uri,
          postCid: post.cid
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action}`);
      }

      // Update post counts immediately in local state
      setPosts(prevPosts => 
        prevPosts.map(p => {
          if (p.uri === post.uri) {
            return {
              ...p,
              likeCount: action === 'like' ? p.likeCount + 1 : p.likeCount,
              repostCount: action === 'repost' ? p.repostCount + 1 : p.repostCount
            };
          }
          return p;
        })
      );

      // Show feedback
      setInteractionFeedback(prev => ({
        ...prev,
        [post.uri]: `${action === 'like' ? 'Liked' : 'Reposted'}!`
      }));

      // Clear feedback after 2 seconds
      setTimeout(() => {
        setInteractionFeedback(prev => {
          const updated = { ...prev };
          delete updated[post.uri];
          return updated;
        });
      }, 2000);

      // DO NOT refresh timeline here - this was causing the page refresh feeling

    } catch (error: any) {
      console.error(`${action} error:`, error);
    } finally {
      setInteractionLoading(prev => {
        const updated = { ...prev };
        delete updated[interactionKey];
        return updated;
      });
    }
  };

  const handleThreadOpen = (post: TimelinePost) => {
    console.log('Opening thread for post:', post.uri);
    onOpenThread(post);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    return posted.toLocaleDateString();
  };

  useEffect(() => {
    if (isAuthenticated && session && service) {
      fetchTimeline();
    }
  }, [isAuthenticated, session, service]);

  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || !session || !service) return;
    
    const interval = setInterval(() => {
      fetchTimeline();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isAuthenticated, session, service]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Timeline</h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Auto-refresh:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="p-1 rounded"
                style={{ color: autoRefresh ? 'var(--status-success)' : 'var(--text-muted)' }}
              >
                {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="text-xs">{refreshInterval}s</span>
            </div>
            <button
              onClick={fetchTimeline}
              disabled={loading}
              className="p-2 rounded hover:opacity-75"
              style={{ color: 'var(--text-secondary)' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Compose */}
        {isAuthenticated && (
          <form onSubmit={handlePost} className="mt-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening?"
                className="flex-1 px-3 py-2 rounded border focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': 'var(--interactive-primary)'
                }}
                maxLength={300}
                disabled={posting}
              />
              <button
                type="submit"
                disabled={!newPost.trim() || posting}
                className="px-4 py-2 rounded flex items-center space-x-2 disabled:opacity-50"
                style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-primary)' }}
              >
                {posting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Post</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--interactive-primary)' }}></div>
          </div>
        ) : error ? (
          <div className="text-center p-6">
            <div className="mb-4" style={{ color: 'var(--status-error)' }}>{error}</div>
            <button 
              onClick={fetchTimeline}
              className="hover:opacity-75"
              style={{ color: 'var(--interactive-primary)' }}
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-6" style={{ color: 'var(--text-muted)' }}>
            No posts in timeline
          </div>
        ) : (
          <div className="space-y-1">
            {posts.map((post) => (
              <motion.div
                key={post.uri}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 border-b hover:opacity-90 transition-colors relative"
                style={{ borderColor: 'var(--border-primary)20' }}
              >
                {interactionFeedback[post.uri] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-2 right-2 px-2 py-1 rounded text-xs flex items-center space-x-1"
                    style={{ backgroundColor: 'var(--status-success)', color: 'var(--text-primary)' }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>{interactionFeedback[post.uri]}</span>
                  </motion.div>
                )}

                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                        style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'var(--bg-tertiary)',
                          width: '40px', 
                          height: '40px', 
                          minWidth: '40px', 
                          minHeight: '40px' 
                        }}
                      >
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {post.author.displayName[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {post.author.displayName}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>@{post.author.handle}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    
                    <div className="mt-1 break-words" style={{ color: 'var(--text-primary)' }}>
                      {post.text}
                    </div>
                    
                    <div className="flex items-center space-x-6 mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <button
                        onClick={() => handleThreadOpen(post)}
                        className="flex items-center space-x-1 hover:opacity-75 transition-colors hover:text-blue-400"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.replyCount}</span>
                      </button>
                      
                      <button
                        onClick={() => handleInteraction('repost', post)}
                        disabled={interactionLoading[`${post.uri}-repost`]}
                        className="flex items-center space-x-1 hover:opacity-75 transition-colors hover:text-green-400 disabled:opacity-50"
                      >
                        <Repeat className={`w-4 h-4 ${interactionLoading[`${post.uri}-repost`] ? 'animate-spin' : ''}`} />
                        <span>{post.repostCount}</span>
                      </button>
                      
                      <button
                        onClick={() => handleInteraction('like', post)}
                        disabled={interactionLoading[`${post.uri}-like`]}
                        className="flex items-center space-x-1 hover:opacity-75 transition-colors hover:text-red-400 disabled:opacity-50"
                      >
                        <Heart className={`w-4 h-4 ${interactionLoading[`${post.uri}-like`] ? 'animate-spin' : ''}`} />
                        <span>{post.likeCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
