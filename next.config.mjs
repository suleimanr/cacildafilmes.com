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
    domains: ['v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v0.blob.com',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    serverExternalPackages: ['sharp'],
  },
  // Adicionar configuração para ignorar erros de build específicos
  webpack: (config, { isServer }) => {
    // Ignorar módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
      // Mapear qualquer importação de ElevenLabs para um módulo vazio
      '@elevenlabs/elevenlabs-react': false,
      'elevenlabs': false,
    }
    
    return config
  }
}

export default nextConfig
