/** @type {import('next').NextConfig} */
const nextConfig = {
  // Core Next.js configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Disable ESLint during build (temporary fix)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during build (if needed)
  typescript: {
    ignoreBuildErrors: false,
  },
  
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
  }
}

module.exports = nextConfig
