import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ─── Images ───────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',   // Supabase Storage CDN
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub OAuth avatars
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',     // Google OAuth avatars
      },
    ],
  },

  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',             // Prevents clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Restrict API access to same origin only
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /home to / for any stray links
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Admin root redirects to promotions
      {
        source: '/admin',
        destination: '/admin/promotions',
        permanent: false,
      },
    ]
  },

  // ─── TypeScript & ESLint ──────────────────────────────────────────────────
  typescript: {
    // Set to false in production — catch all type errors before deploy
    ignoreBuildErrors: false,
  },

  // ─── Logging ──────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig