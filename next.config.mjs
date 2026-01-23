/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    isrMemoryCacheSize: 0, // Disable ISR
  },
  onDemandEntries: {
    maxInactiveAge: 0,
  },
}

export default nextConfig
