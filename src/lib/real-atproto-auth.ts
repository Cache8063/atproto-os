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

class RealATProtoAuth {
  private agent: BskyAgent
  private session: AuthSession | null = null

  constructor() {
    // YOUR CUSTOM PDS!
    this.agent = new BskyAgent({
      service: 'https://arcnode.xyz'
    })
  }

  async login(credentials: AuthCredentials): Promise<{ success: boolean; session?: AuthSession; profile?: any }> {
    try {
      console.log('Connecting to PDS:', 'https://arcnode.xyz')
      const response = await this.agent.login(credentials)
      
      if (response.success && this.agent.session) {
        this.session = {
          accessJwt: this.agent.session.accessJwt,
          refreshJwt: this.agent.session.refreshJwt,
          handle: this.agent.session.handle,
          did: this.agent.session.did,
          active: this.agent.session.active || true
        }

        // Fetch user profile from YOUR PDS
        let profile = null
        try {
          const profileResponse = await this.agent.getProfile({
            actor: this.session.handle
          })
          profile = profileResponse.data
          console.log('Profile loaded from arcnode.xyz:', profile)
        } catch (error) {
          console.error('Error fetching profile from arcnode.xyz:', error)
        }

        return {
          success: true,
          session: this.session,
          profile
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('AT Protocol login error to arcnode.xyz:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.session = null
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  // Method to check PDS health
  async checkPDSHealth(): Promise<boolean> {
    try {
      // Basic health check - try to reach the service
      const response = await fetch('https://arcnode.xyz/.well-known/atproto-did')
      return response.ok
    } catch (error) {
      console.error('PDS health check failed:', error)
      return false
    }
  }
}

export const realATProtoAuth = new RealATProtoAuth()
