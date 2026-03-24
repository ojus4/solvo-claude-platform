// =============================================================================
// SOLVO — Shared Utility Functions
// =============================================================================
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'


// ─── Class Name Merger ────────────────────────────────────────────────────────
// Combines clsx (conditional classes) + tailwind-merge (deduplication)
// Usage: cn('px-4 py-2', isActive && 'bg-blue-500', 'text-white')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// ─── Price Formatting ─────────────────────────────────────────────────────────
// Converts paise to rupees with formatting
// Usage: formatPrice(9900) → "₹99"
export function formatPrice(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}


// ─── Date Formatting ──────────────────────────────────────────────────────────
// Usage: formatDate('2025-01-12T14:32:00Z') → "12 Jan 2025"
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

// Usage: formatDateTime('2025-01-12T14:32:00Z') → "12 Jan 2025, 8:02 PM"
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
}

// Time ago — returns "2 hours ago", "3 days ago" etc.
export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  return formatDate(dateString)
}


// ─── String Utilities ─────────────────────────────────────────────────────────

// Convert a blog post title to a URL slug
// Usage: slugify("Best Careers for Introverts!") → "best-careers-for-introverts"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove special chars except hyphens
    .replace(/[\s_-]+/g, '-')  // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
}

// Capitalise first letter of each word
// Usage: capitalize('data science') → 'Data Science'
export function capitalize(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Truncate text to a max length with ellipsis
// Usage: truncate('A very long string...', 50) → 'A very long...'
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}


// ─── Number Utilities ─────────────────────────────────────────────────────────

// Format a number with commas (Indian number system)
// Usage: formatNumber(12500) → "12,500"
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

// Calculate percentage
// Usage: percentage(45, 100) → 45
export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}


// ─── Blog Utilities ───────────────────────────────────────────────────────────

// Estimate reading time in minutes
// Usage: estimateReadTime('Long article content here...') → 3
export function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}


// ─── Assessment Utilities ─────────────────────────────────────────────────────

// Get a human-readable label for a personality trait score
// Usage: getTraitLabel(78) → "High"
export function getTraitLabel(score: number): 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High' {
  if (score < 20) return 'Very Low'
  if (score < 40) return 'Low'
  if (score < 60) return 'Moderate'
  if (score < 80) return 'High'
  return 'Very High'
}

// Get the match colour class for a career recommendation percentage
export function getMatchColour(matchPercent: number): string {
  if (matchPercent >= 80) return 'text-green-600 bg-green-50'
  if (matchPercent >= 60) return 'text-blue-600 bg-blue-50'
  if (matchPercent >= 40) return 'text-amber-600 bg-amber-50'
  return 'text-gray-600 bg-gray-50'
}


// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Indian phone: 10 digits, optionally starting with +91 or 0
  return /^(\+91|0)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))
}


// ─── Tier Utilities ───────────────────────────────────────────────────────────

import type { UserTier } from '@/types'

export function getTierLabel(tier: UserTier): string {
  const labels: Record<UserTier, string> = {
    explorer: 'Explorer',
    achiever: 'Achiever',
    accelerator: 'Accelerator',
  }
  return labels[tier]
}

export function getTierColour(tier: UserTier): string {
  const colours: Record<UserTier, string> = {
    explorer: 'text-gray-600 bg-gray-100',
    achiever: 'text-blue-700 bg-blue-50',
    accelerator: 'text-amber-700 bg-amber-50',
  }
  return colours[tier]
}