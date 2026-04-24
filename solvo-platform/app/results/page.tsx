// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — Results Page
// app/results/page.tsx
// Client component — fetches PDF data, assembles + downloads report
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { PdfReportData, PdfCareer } from '@/lib/pdf/report-data'

// ─── Dynamic imports (SSR disabled — react-pdf is browser-only) ───────────────

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <div className="text-sm text-gray-500">Loading...</div> },
)

const ReportDocument = dynamic(
  () =>
    import('@/components/pdf/ReportDocument').then((mod) => mod.ReportDocument),
  { ssr: false },
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps a snake_case career id to a human-readable title */
function formatCareerTitle(id: string): string {
  const known: Record<string, string> = {
    data_science:         'Data Scientist',
    software_engineering: 'Software Engineer',
    ui_ux:                'UI/UX Designer',
    digital_marketing:    'Digital Marketer',
    finance:              'Financial Analyst',
  }
  if (known[id]) return known[id]
  return id
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/** Formats an ISO string to DD MMM YYYY */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
  } catch {
    return iso
  }
}

/** Builds a PdfReportData object from the /api/pdf/generate JSON response */
function buildReportData(json: any): PdfReportData {
  const { pdf_data } = json
  const { user, results } = pdf_data

  // ── Personality ────────────────────────────────────────────────────────────
  const personalityRaw = results?.personality ?? null
  const personality = personalityRaw
    ? {
        O: personalityRaw.scores?.O ?? 0,
        C: personalityRaw.scores?.C ?? 0,
        E: personalityRaw.scores?.E ?? 0,
        A: personalityRaw.scores?.A ?? 0,
        N: personalityRaw.scores?.N ?? 0,
        primary_trait: personalityRaw.primary_type ?? 'O',
      }
    : null

  // ── Interest ───────────────────────────────────────────────────────────────
  const interestRaw = results?.interest ?? null
  const interest = interestRaw
    ? {
        R: interestRaw.scores?.R ?? 0,
        I: interestRaw.scores?.I ?? 0,
        A: interestRaw.scores?.A ?? 0,
        S: interestRaw.scores?.S ?? 0,
        E: interestRaw.scores?.E ?? 0,
        C: interestRaw.scores?.C ?? 0,
        holland_code: interestRaw.primary_type ?? 'RIA',
      }
    : null

  // ── Aptitude ───────────────────────────────────────────────────────────────
  const aptitudeRaw = results?.aptitude ?? null
  const aptitude = aptitudeRaw
    ? {
        Numerical: aptitudeRaw.scores?.Numerical ?? 0,
        Verbal:    aptitudeRaw.scores?.Verbal    ?? 0,
        Logical:   aptitudeRaw.scores?.Logical   ?? 0,
        overall:   parseFloat(aptitudeRaw.primary_type ?? '0'),
      }
    : null

  // ── EQ ─────────────────────────────────────────────────────────────────────
  const eqRaw = results?.eq ?? null
  const eq = eqRaw
    ? {
        selfAwareness:       eqRaw.scores?.selfAwareness       ?? 0,
        emotionalRegulation: eqRaw.scores?.emotionalRegulation ?? 0,
        communication:       eqRaw.scores?.communication       ?? 0,
        empathy:             eqRaw.scores?.empathy             ?? 0,
        adaptability:        eqRaw.scores?.adaptability        ?? 0,
        overall:             parseFloat(eqRaw.primary_type     ?? '0'),
      }
    : null

  // ── Recommended careers ────────────────────────────────────────────────────
  const rawCareers: string[] = pdf_data.recommended_careers ?? []
  const recommended_careers: PdfCareer[] = rawCareers.map((career) => ({
    id:              career,
    title:           formatCareerTitle(career),
    matchPercentage: 0,
    description:     '',
  }))

  return {
    user,
    personality,
    interest,
    aptitude,
    eq,
    recommended_careers,
    is_premium: user.tier !== 'explorer',
  }
}

// ─── Module chip config ───────────────────────────────────────────────────────

const MODULE_CHIPS = [
  { key: 'personality' as const, label: 'Personality' },
  { key: 'interest'    as const, label: 'Interests'   },
  { key: 'aptitude'    as const, label: 'Aptitude'    },
  { key: 'eq'          as const, label: 'EQ'          },
]

// ─── Page component ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [reportData, setReportData] = useState<PdfReportData | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [pdfReady,   setPdfReady]   = useState(false)

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/pdf/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({}),
        })

        if (res.status === 401) {
          window.location.href = '/login'
          return
        }

        if (res.status === 400) {
          const json = await res.json()
          setError(json.error ?? 'Invalid request.')
          setLoading(false)
          return
        }

        if (!res.ok) {
          setError('Failed to load report data.')
          setLoading(false)
          return
        }

        const json = await res.json()
        const data = buildReportData(json)

        setReportData(data)
        setPdfReady(true)
        setLoading(false)
      } catch {
        setError('Something went wrong. Please try again.')
        setLoading(false)
      }
    }

    fetchReport()
  }, [])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-6" />
        <p className="text-lg font-semibold text-gray-800">
          Preparing your career report...
        </p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment.</p>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors text-center"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!pdfReady || !reportData) return null

  const completedCount = [
    reportData.personality,
    reportData.interest,
    reportData.aptitude,
    reportData.eq,
  ].filter(Boolean).length

  const allComplete = completedCount === 4

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Career Intelligence Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated on {formatDate(reportData.user.generated_at)}
          </p>
        </div>

        {/* ── Success banner ─────────────────────────────────────────── */}
        {allComplete && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-green-600 text-lg font-bold">✓</span>
            <p className="text-green-800 text-sm font-semibold">
              All 4 assessments complete — your report is ready
            </p>
          </div>
        )}

        {/* ── Report preview card ────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col sm:flex-row">

            {/* Left — report identity */}
            <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-gray-100">
              <p className="text-2xl font-black text-blue-600 tracking-widest mb-1">
                SOLVO
              </p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                Career Intelligence Report
              </p>
              <p className="text-lg font-bold text-gray-900 mb-1">
                {reportData.user.full_name}
              </p>
              <p className="text-xs text-gray-400 font-mono mb-5">
                ID: {reportData.user.report_id}
              </p>

              {/* 8 page indicators */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Cover',       color: 'bg-blue-600'   },
                  { label: 'Personality', color: 'bg-purple-500' },
                  { label: 'Interests',   color: 'bg-orange-500' },
                  { label: 'Aptitude',    color: 'bg-amber-500'  },
                  { label: 'EQ',          color: 'bg-indigo-500' },
                  { label: 'Careers',     color: 'bg-blue-500'   },
                  { label: 'Roadmap',     color: 'bg-orange-400' },
                  { label: 'Next Steps',  color: 'bg-green-500'  },
                ].map((page) => (
                  <span
                    key={page.label}
                    className={`inline-flex items-center gap-1 text-xs text-white font-medium px-2 py-0.5 rounded-full ${page.color}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
                    {page.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — download area */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  Download Your PDF Report
                </h2>
                <p className="text-xs text-gray-400 mb-5">
                  ~2-4 MB · PDF format
                </p>
              </div>

              {/* PDFDownloadLink — browser-only via dynamic import */}
              {pdfReady && (
                <PDFDownloadLink
                  document={<ReportDocument data={reportData} />}
                  fileName={`SOLVO-Report-${reportData.user.report_id}.pdf`}
                >
                  {({ loading: pdfLoading }: { loading: boolean }) => (
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors disabled:opacity-50"
                      disabled={pdfLoading}
                    >
                      {pdfLoading
                        ? 'Generating PDF...'
                        : 'Download Report (PDF)'}
                    </button>
                  )}
                </PDFDownloadLink>
              )}

              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-500">
                  ✓ Free users get the full 8-page report
                </p>
                <p className="text-xs text-gray-500">
                  ✓ Premium users also get dashboard access and the interactive
                  roadmap
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Upgrade CTA (non-premium only) ────────────────────────── */}
        {!reportData.is_premium && (
          <div className="border-2 border-orange-300 bg-orange-50 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-gray-900">
                Want the full interactive roadmap?
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Unlock step-by-step guidance with the Achiever Plan
              </p>
            </div>
            <a
              href="/checkout"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl text-sm transition-colors whitespace-nowrap text-center"
            >
              Apply for Achiever Plan →
            </a>
          </div>
        )}

        {/* ── Module completion chips ────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
            Assessment modules
          </p>
          <div className="flex flex-wrap gap-2">
            {MODULE_CHIPS.map(({ key, label }) => {
              const done = reportData[key] !== null
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                    done
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  {done ? '✓' : '○'} {label}
                </span>
              )
            })}
          </div>
        </div>

        {/* ── Bottom navigation ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <a
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            ← Back to Dashboard
          </a>
          <a
            href="/test"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Retake Assessment
          </a>
        </div>

      </div>
    </div>
  )
}