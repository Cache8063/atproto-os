// src/lib/atproto-client.ts
import { BskyAgent } from '@atproto/api'

interface AuthCredentials {
  identifier: string
  password: string
  service?: string
}

interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  email?: string
}

class ATProtoClient {
  private agent: BskyAgent
  private session: AuthSession | null = null

  constructor(serviceUrl?: string) {
    this.agent = new BskyAgent({
      service: serviceUrl || 'https://bsky.social'
    })
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const response = await this.agent.login({
        identifier: credentials.identifier,
        password: credentials.password
      })

      if (response.success) {
        this.session = {
          accessJwt: response.data.accessJwt,
          refreshJwt: response.data.refreshJwt,
          handle: response.data.handle,
          did: response.data.did,
          email: response.data.email
        }

        // Store session in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('atproto_session', JSON.stringify(this.session))
        }

        return this.session
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('AT Protocol login error:', error)
      throw error
    }
  }

  async resumeSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null

    try {
      const storedSession = localStorage.getItem('atproto_session')
      if (!storedSession) return null

      const session = JSON.parse(storedSession) as AuthSession
      
      // Attempt to resume session with stored tokens
      await this.agent.resumeSession({
        accessJwt: session.accessJwt,
        refreshJwt: session.refreshJwt,
        handle: session.handle,
        did: session.did
      })

      this.session = session
      return session
    } catch (error) {
      console.error('Failed to resume session:', error)
      this.clearSession()
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.session) {
        // Attempt to revoke session on server
        await this.agent.com.atproto.server.deleteSession()
      }
    } catch (error) {
      console.warn('Error during server logout:', error)
    } finally {
      this.clearSession()
    }
  }

  private clearSession(): void {
    this.session = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atproto_session')
    }
  }

  async getProfile(actor?: string): Promise<any> {
    if (!this.session) throw new Error('Not authenticated')

    try {
      const response = await this.agent.getProfile({
        actor: actor || this.session.handle
      })
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  async getPosts(actor?: string, limit = 30): Promise<any[]> {
    if (!this.session) throw new Error('Not authenticated')

    try {
      const response = await this.agent.getAuthorFeed({
        actor: actor || this.session.handle,
        limit
      })
      return response.data.feed
    } catch (error) {
      console.error('Error fetching posts:', error)
      throw error
    }
  }

  async createPost(text: string): Promise<any> {
    if (!this.session) throw new Error('Not authenticated')

    try {
      const response = await this.agent.post({
        text,
        createdAt: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  // Method to check server health/connectivity
  async checkServerHealth(): Promise<{ status: string; latency: number }> {
    const startTime = Date.now()
    
    try {
      await this.agent.com.atproto.server.describeServer()
      const latency = Date.now() - startTime
      return { status: 'online', latency }
    } catch (error) {
      const latency = Date.now() - startTime
      return { status: 'offline', latency }
    }
  }

  // Get federation status and peer connections
  async getFederationStatus(): Promise<any> {
    if (!this.session) throw new Error('Not authenticated')

    try {
      // This would depend on your PDS implementation
      // For now, return mock data structure
      return {
        connectedPeers: 42,
        syncStatus: 'synced',
        lastSync: new Date().toISOString(),
        networkHealth: 'good'
      }
    } catch (error) {
      console.error('Error fetching federation status:', error)
      throw error
    }
  }
}

// Singleton instance
export const atprotoClient = new ATProtoClient()
export type { AuthCredentials, AuthSession }