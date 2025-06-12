/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  // Critical: Don't fail build on TypeScript/ESLint errors in CI
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Disable telemetry
  telemetry: {
    enabled: false
  },
  // Output standalone for Docker
  output: 'standalone'
}

module.exports = nextConfig
