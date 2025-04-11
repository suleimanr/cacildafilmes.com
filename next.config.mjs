/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Resolver o problema com identificadores que começam com números
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      loader: 'string-replace-loader',
      options: {
        search: /\b11labs:/g,
        replace: '"11labs":',
        flags: 'g'
      }
    });
    
    return config;
  },
  // Outras configurações existentes
  experimental: {
    serverExternalPackages: ["@11labs/client"]
  },
  images: {
    domains: ['vumbnail.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
