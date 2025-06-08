import { BskyAgent } from '@atproto/api'

export interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  active: boolean
  email?: string
}

export interface AuthCredentials {
  identifier: string
  password: string
}

class RealATProtoAuth {
  private agent: BskyAgent
  private session: AuthSession | null = null

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social' // Real Bluesky server
    })
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      console.log('Attempting real AT Protocol login...')
      
      const response = await this.agent.login({
        identifier: credentials.identifier,
        password: credentials.password
      })
      
      if (response.success && this.agent.session) {
        this.session = {
          accessJwt: this.agent.session.accessJwt,
          refreshJwt: this.agent.session.refreshJwt,
          handle: this.agent.session.handle,
          did: this.agent.session.did,
          active: this.agent.session.active || true,
          email: response.data.email
        }

        // Store real session
        if (typeof window !== 'undefined') {
          localStorage.setItem('real_atproto_session', JSON.stringify(this.session))
        }

        console.log('Real AT Protocol login successful!', {
          handle: this.session.handle,
          did: this.session.did
        })

        return this.session
      } else {
        throw new Error('Login failed - invalid response')
      }
    } catch (error) {
      console.error('Real AT Protocol login failed:', error)
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getProfile(): Promise<any> {
    if (!this.session) throw new Error('Not authenticated')
    
    try {
      const response = await this.agent.getProfile({
        actor: this.session.handle
      })
      return response.data
    } catch (error) {
      console.error('Error fetching real profile:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.session = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('real_atproto_session')
    }
  }

  loadSession(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('real_atproto_session')
      if (stored) {
        try {
          this.session = JSON.parse(stored)
        } catch (error) {
          console.error('Failed to load stored session:', error)
          localStorage.removeItem('real_atproto_session')
        }
      }
    }
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  // Check connection to AT Protocol servers
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
}

export const realATProtoAuth = new RealATProtoAuth()
