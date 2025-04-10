/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Remove appDir as it's no longer experimental in Next.js 15
    serverComponentsExternalPackages: ["@11labs/client"],
  },
  // Remove swcMinify as it's the default in Next.js 15
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
