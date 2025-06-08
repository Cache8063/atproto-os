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
  service?: string
}

class HybridATProtoAuth {
  private agent: BskyAgent | null = null
  private session: AuthSession | null = null
  private currentService: string = 'https://bsky.social'

  // Detect service from handle
  private detectServiceFromHandle(identifier: string): string {
    if (identifier.includes('.arcnode.xyz')) {
      return 'https://arcnode.xyz'
    }
    if (identifier.includes('.')) {
      // Extract domain from handle like user.mydomain.com
      const parts = identifier.split('.')
      if (parts.length >= 2) {
        const domain = parts.slice(-2).join('.')
        if (domain !== 'bsky.social') {
          return `https://${domain}`
        }
      }
    }
    return 'https://bsky.social'
  }

  async login(credentials: AuthCredentials): Promise<{ success: boolean; session?: AuthSession; profile?: any; service?: string }> {
    try {
      // Determine service
      const service = credentials.service || this.detectServiceFromHandle(credentials.identifier)
      this.currentService = service
      
      // Create agent for the detected/specified service
      this.agent = new BskyAgent({ service })
      
      console.log(`Connecting to: ${service}`)
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
          active: this.agent.session.active || true
        }

        // Fetch user profile
        let profile = null
        try {
          const profileResponse = await this.agent.getProfile({
            actor: this.session.handle
          })
          profile = profileResponse.data
          console.log(`Profile loaded from ${service}:`, profile)
        } catch (error) {
          console.error(`Error fetching profile from ${service}:`, error)
        }

        return {
          success: true,
          session: this.session,
          profile,
          service
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error(`AT Protocol login error:`, error)
      throw error
    }
  }

  async logout(): Promise<void> {
    this.session = null
    this.agent = null
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }

  getCurrentService(): string {
    return this.currentService
  }

  // Method to check service health
  async checkServiceHealth(service: string): Promise<boolean> {
    try {
      const response = await fetch(`${service}/.well-known/atproto-did`)
      return response.ok
    } catch (error) {
      console.error(`Service health check failed for ${service}:`, error)
      return false
    }
  }
}

export const hybridATProtoAuth = new HybridATProtoAuth()
