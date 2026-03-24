import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      /* ── SOLVO Brand Colors ───────────────────────────────────────────── */
      colors: {
        brand: {
          primary:       '#1B4FFF',   // Deep electric blue — trust, intelligence
          'primary-dark':'#1440DD',   // Hover state
          secondary:     '#FF6B35',   // Energetic orange — action, ambition
          'secondary-dark':'#E85A24', // Hover state
          dark:          '#0A0F1E',   // Near-black background
          surface:       '#111827',   // Card/surface background
          muted:         '#6B7280',   // Secondary text
          success:       '#10B981',   // Green — positive outcomes
          warning:       '#F59E0B',   // Amber — alerts
          danger:        '#EF4444',   // Red — errors/danger
          'premium-gold':'#F7C948',   // Gold — premium tier indicator
        },

        /* Tier colours — used for badges and tier indicators */
        tier: {
          explorer:     '#6B7280',   // Gray — free
          achiever:     '#1B4FFF',   // Blue — paid
          accelerator:  '#F7C948',   // Gold — premium
        },
      },

      /* ── Typography ──────────────────────────────────────────────────── */
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
      },

      /* ── Font Sizes ──────────────────────────────────────────────────── */
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.5rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',     { lineHeight: '1.15' }],
        '6xl':  ['3.75rem',  { lineHeight: '1.1' }],
      },

      /* ── Spacing ─────────────────────────────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      /* ── Border Radius ───────────────────────────────────────────────── */
      borderRadius: {
        'sm': '0.375rem',
        DEFAULT: '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },

      /* ── Box Shadows ─────────────────────────────────────────────────── */
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        'premium': '0 0 0 2px #F7C948',
        'focus': '0 0 0 3px rgba(27,79,255,0.3)',
      },

      /* ── Animations ──────────────────────────────────────────────────── */
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-down':   'slideDown 0.2s ease-out',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      /* ── Screens (breakpoints) ───────────────────────────────────────── */
      screens: {
        'xs':  '375px',   // Small phones
        'sm':  '640px',   // Large phones / small tablets
        'md':  '768px',   // Tablets
        'lg':  '1024px',  // Laptops
        'xl':  '1280px',  // Desktops
        '2xl': '1536px',  // Large desktops
      },
    },
  },

  plugins: [],
}

export default config