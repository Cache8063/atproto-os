import { BskyAgent } from '@atproto/api'

export interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  active: boolean
}

export interface AuthCredentials {
  identifier: string
  password: string
}

class ATProtoAuth {
  private agent: BskyAgent
  private session: AuthSession | null = null

  constructor() {
    this.agent = new BskyAgent({
      service: 'https://bsky.social'
    })
  }

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    try {
      const response = await this.agent.login(credentials)
      
      if (response.success && this.agent.session) {
        this.session = {
          accessJwt: this.agent.session.accessJwt,
          refreshJwt: this.agent.session.refreshJwt,
          handle: this.agent.session.handle,
          did: this.agent.session.did,
          active: this.agent.session.active || true
        }

        // Store in localStorage
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

  async logout(): Promise<void> {
    this.session = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atproto_session')
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
      console.error('Error fetching profile:', error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }
}

export const atprotoAuth = new ATProtoAuth()
