/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration for AT Protocol dependencies
  webpack: (config, { isServer }) => {
    // Handle node modules properly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    
    return config
  },
  
  // Environment variables available to the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Disable telemetry (moved from deprecated location)
  // This is now handled via NEXT_TELEMETRY_DISABLED=1 environment variable
}

module.exports = nextConfig
