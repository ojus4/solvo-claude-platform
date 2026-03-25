// =============================================================================
// SOLVO — Root Layout
// REPLACE the entire contents of app/layout.tsx with this file.
//
// KEY DIFFERENCES from the default Next.js version:
// 1. Uses Plus Jakarta Sans + Inter fonts (not Geist)
// 2. Wraps children with <Providers> — initialises Zustand auth + site config
// 3. Has full SOLVO SEO metadata (not "Create Next App")
// 4. Has Google Analytics script
// 5. Has correct viewport config
// =============================================================================
import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers'
import '@/app/globals.css'

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
  },
}

// ─── Viewport ────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
        {/* Providers wraps everything — initialises auth state and site config */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}