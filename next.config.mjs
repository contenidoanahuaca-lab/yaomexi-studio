/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // deja localhost y añade tu dominio (opcional)
      allowedOrigins: ['localhost:3000', 'yaomexicatl.mx', 'www.yaomexicatl.mx'],
    },
  },
  reactStrictMode: true,
};

export default nextConfig;

