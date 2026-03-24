// =============================================================================
// SOLVO — Auth Error Page
// Route: /auth/auth-error
// =============================================================================
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-heading text-gray-900 mb-2">
            Authentication failed
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Something went wrong during sign-in. This can happen if the link expired or was already used.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark transition-colors"
            >
              Try logging in again
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Go to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}