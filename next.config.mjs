/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com', 'vumbnail.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    return config
  },
  compress: false,
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'pdf-parse'],
    memoryBasedWorkersCount: true,
  }
}

export default nextConfig
