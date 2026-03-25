// app/page.tsx
import Link from 'next/link'

export default function BootstrapPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-lg w-full text-center space-y-6">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">SOLVO</span>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-sm">Category A — Setup Complete</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Next.js, TypeScript, Tailwind, Supabase clients, middleware, and all dependencies are working.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-left space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-3">Category A checklist:</p>
          {[
            { done: true,  label: 'Next.js project initialised' },
            { done: true,  label: 'All npm dependencies installed' },
            { done: true,  label: 'TypeScript configured (strict mode)' },
            { done: true,  label: 'Tailwind CSS configured with SOLVO brand tokens' },
            { done: true,  label: 'Middleware protecting /dashboard and /admin routes' },
            { done: true,  label: 'Auth system (login, signup, OAuth callback)' },
            { done: true,  label: 'Hidden admin entry point (/access/[slug])' },
            { done: true,  label: 'Supabase SQL schema deployed' },
            { done: true,  label: '.env.local configured with Supabase keys' },
            { done: false, label: 'Connect Vercel to GitHub and deploy' },
            { done: false, label: 'Set yourself as super_admin in Supabase' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {item.done ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/login"
            className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Test Login
          </Link>
          <Link
            href="/signup"
            className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Test Signup
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          This placeholder will be replaced by the real landing page in Category K.
        </p>
      </div>
    </main>
  )
}
