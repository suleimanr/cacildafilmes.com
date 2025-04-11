/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vumbnail.com'],
  },
  experimental: {
    serverActions: true,
  },
  serverExternalPackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig
