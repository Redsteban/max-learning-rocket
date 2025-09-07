/** @type {import('next').NextConfig} */

const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Basic configuration for Vercel
  compress: true,
  poweredByHeader: false,
  
  // Experimental features
  experimental: {
    scrollRestoration: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
};

module.exports = nextConfig;