/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      // Production Railway domain
      {
        protocol: 'https',
        hostname: 'izabels-production.up.railway.app',
        pathname: '/uploads/**',
      },
      // Railway subdomains
      {
        protocol: 'https',
        hostname: '**.railway.app',
        pathname: '/uploads/**',
      },
      // Если используете Cloudinary для uploads
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Включаем standalone для оптимизации деплоя
  output: 'standalone',
}

module.exports = nextConfig

