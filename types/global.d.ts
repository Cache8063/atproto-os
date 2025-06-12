// Global type declarations to fix build issues
declare module '@atproto/api' {
  export interface ReasonRepost {
    $type: string
    by?: any
    indexedAt?: string
    [k: string]: unknown
  }
}

// Extend existing types to be more flexible
declare global {
  interface PostView {
    indexedAt?: string
    [key: string]: any
  }
}

export {}
