/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@11labs/react"],
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Usar aspas para a propriedade que começa com número
      "@11labs/client": "@11labs/client",
    };
    return config;
  },
}

export default nextConfig;
