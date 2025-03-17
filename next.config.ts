/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['image.tmdb.org'], // Allow TMDB image domain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig