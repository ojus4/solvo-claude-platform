// =============================================================================
// SOLVO — Account Suspended Page
// Route: /suspended
// Shown when a suspended user tries to access protected content
// =============================================================================

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-heading text-gray-900 mb-2">
            Account suspended
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your account has been temporarily suspended. If you believe this is a mistake,
            please contact our support team.
          </p>
          <a
            href="mailto:support@solvo.in"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark transition-colors"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  )
}