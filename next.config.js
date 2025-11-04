/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Rewrite para capturar todas as rotas Django
  async rewrites() {
    return [
      {
        source: '/api/django/:path*',
        destination: '/api/django',
      },
    ]
  },
}

module.exports = nextConfig