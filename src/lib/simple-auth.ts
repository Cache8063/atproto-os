export interface AuthSession {
  handle: string
  did: string
  active: boolean
}

export interface AuthCredentials {
  identifier: string
  password: string
}

class SimpleAuth {
  private session: AuthSession | null = null

  async login(credentials: AuthCredentials): Promise<AuthSession> {
    // Simulate AT Protocol login for now
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful login
    this.session = {
      handle: credentials.identifier,
      did: 'did:plc:mock123',
      active: true
    }

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('atproto_session', JSON.stringify(this.session))
    }

    return this.session
  }

  async logout(): Promise<void> {
    this.session = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('atproto_session')
    }
  }

  loadSession(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atproto_session')
      if (stored) {
        this.session = JSON.parse(stored)
      }
    }
  }

  isAuthenticated(): boolean {
    return this.session !== null
  }

  getSession(): AuthSession | null {
    return this.session
  }
}

export const simpleAuth = new SimpleAuth()
