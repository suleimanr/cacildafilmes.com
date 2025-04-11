/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Adiciona um loader para lidar com identificadores que começam com números
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: [
        {
          loader: 'string-replace-loader',
          options: {
            search: /(\s|\{|,)11labs:/g,
            replace: '$1"11labs":',
            flags: 'g'
          }
        }
      ]
    });

    return config;
  },
  // Outras configurações existentes
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
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
