/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'yaomexicatl.mx', 'www.yaomexicatl.mx'],
    },
  },
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://api:8000/:path*',
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/videos/crear',
        destination: '/studio',
        permanent: true, // 308
      },
    ]
  },
}

export default nextConfig

