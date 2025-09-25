/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://api:8000/:path*',
      },
    ]
  },
}

export default nextConfig
