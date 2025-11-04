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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'd13552ljikd29j.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
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