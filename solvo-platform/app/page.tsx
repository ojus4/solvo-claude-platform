// =============================================================================
// SOLVO — Root Layout
// This wraps every single page on the platform.
// =============================================================================
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import '@/app/globals.css'
import Link from "next/link";

// ─── Default SEO Metadata ────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    template: '%s | SOLVO',
    default: 'SOLVO — Find The Career You Were Built For',
  },
  description:
    'Free psychometric assessment, skill library, and job market analysis for Indian students. Get your personalised career roadmap in minutes.',
  keywords: [
    'career guidance India',
    'psychometric test free',
    'career assessment',
    'student career path',
    'job market India',
    'skill development',
    'career roadmap',
    'SOLVO',
  ],
  authors: [{ name: 'SOLVO' }],
  creator: 'SOLVO',
  publisher: 'SOLVO',

  // Open Graph — social sharing preview
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'SOLVO',
    title: 'SOLVO — Find The Career You Were Built For',
    description:
      'Free psychometric assessment + personalised career roadmap for Indian students.',
    images: [
      {
        url: '/images/og/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SOLVO — Career Guidance Platform',
      },
    ],
  },

  // Twitter / X card
  twitter: {
    card: 'summary_large_image',
    title: 'SOLVO — Career Guidance for Students',
    description: 'Free career assessment + personalised roadmap.',
    images: ['/images/og/og-default.png'],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Favicons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest for PWA
  manifest: '/site.webmanifest',
}

// ─── Viewport ────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,    // Allow zoom for accessibility
  themeColor: '#1B4FFF',
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics — only loads in production */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID &&
          process.env.NODE_ENV === 'production' && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}
      </head>
      <body className="min-h-screen bg-white antialiased">
        <Providers>
          <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">SOLVO</span>
            </div>

            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
              <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4 w-full">
                <p className="font-semibold text-green-700 text-sm">Category A — Setup Complete</p>
                <p className="text-green-600 text-sm mt-1">
                  Next.js, TypeScript, Tailwind, Supabase clients, middleware, and all dependencies are working.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left w-full">
                <p className="text-sm font-semibold text-gray-700 mb-3">Remaining steps:</p>
                <p className="text-sm text-gray-500">• Connect Vercel to GitHub and deploy</p>
                <p className="text-sm text-gray-500">• Set yourself as super_admin in Supabase</p>
                <p className="text-xs text-gray-400 mt-3">This page will be replaced in Category K.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:bg-black/[.04] md:w-[158px]"
                href="/login"
              >
                Test Login
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:bg-black/[.04] md:w-[158px]"
                href="/signup"
              >
                Test Signup
              </Link>
            </div>
          </main>

          {children}
        </Providers>
      </body>
    </html>
  )
}

