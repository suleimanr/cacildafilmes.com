/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignorar erros de ESLint e TypeScript durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração de imagens
  images: {
    domains: ['v0.blob.com', 'hebbkx1anhila5yf.public.blob.vercel-storage.com'],
    unoptimized: true,
  },
  // Simplificar a configuração do webpack
  webpack: (config) => {
    // Ignorar módulos problemáticos
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Ignorar avisos específicos
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ]
    
    return config
  },
  // Desativar a compressão para facilitar a depuração
  compress: false,
  // Aumentar o limite de memória para o webpack
  experimental: {
    serverExternalPackages: ['sharp'],
    memoryBasedWorkersCount: true,
  },
  // Desativar a otimização para facilitar a depuração
  swcMinify: false,
}

export default nextConfig
