'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { personalityQuestions } from '@/lib/scoring/personality-questions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'hi';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS_PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(50 / QUESTIONS_PER_PAGE); // 5

const LIKERT: { value: number; en: string; hi: string }[] = [
  { value: 1, en: 'Strongly Disagree', hi: 'पूर्णतः असहमत' },
  { value: 2, en: 'Disagree',          hi: 'असहमत'         },
  { value: 3, en: 'Neutral',           hi: 'तटस्थ'          },
  { value: 4, en: 'Agree',             hi: 'सहमत'           },
  { value: 5, en: 'Strongly Agree',    hi: 'पूर्णतः सहमत'   },
];

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
      <circle cx="32" cy="32" r="30" fill="#34C759" />
      <path d="M18 33l10 10 18-18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-4 w-4'}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-4 w-4'}>
      <path d="M13 8H3M7 12l-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="grid grid-cols-2 gap-[3px] flex-shrink-0" style={{ width: 22, height: 22 }}>
      <div className="rounded-[2px]" style={{ backgroundColor: '#FF3B30', width: 9, height: 9 }} />
      <div className="rounded-tr-[4px] rounded-[2px]" style={{ backgroundColor: '#007AFF', width: 9, height: 9 }} />
      <div className="rounded-bl-[4px] rounded-[2px]" style={{ backgroundColor: '#FFCC00', width: 9, height: 9 }} />
      <div className="rounded-[2px]" style={{ backgroundColor: '#34C759', width: 9, height: 9 }} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PersonalityTestPage() {
  const [answers, setAnswers]           = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage]   = useState(0);
  const [lang, setLang]                 = useState<Lang>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [isComplete, setIsComplete]     = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // Questions for the current page
  const pageQuestions = personalityQuestions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE,
  );

  // Total answered across all questions
  const totalAnswered = Object.keys(answers).length;

  // IDs of unanswered questions on current page (for validation highlight)
  const unansweredOnPage = showValidation
    ? pageQuestions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    : [];

  // All questions on current page answered?
  const pageComplete = pageQuestions.every((q) => answers[q.id] !== undefined);

  // ── Scroll to top of assessment when page changes ──────────────────────────
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  // ── Answer selection ───────────────────────────────────────────────────────
  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear validation highlight once all page Qs are answered
    if (showValidation) {
      const updated = { ...answers, [questionId]: value };
      const stillMissing = pageQuestions.some((q) => updated[q.id] === undefined);
      if (!stillMissing) setShowValidation(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!pageComplete) {
      setShowValidation(true);
      // Scroll to first unanswered question
      const firstUnanswered = pageQuestions.find((q) => answers[q.id] === undefined);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setShowValidation(false);
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    setShowValidation(false);
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!pageComplete) {
      setShowValidation(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/psychometric/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module:       'personality',
          raw_answers:  answers,
          scores:       {},
          primary_type: '',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `Server error: ${res.status}`);
      }

      setIsComplete(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETION SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
        <div
          className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-4 py-16"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-sm w-full">
            <div className="flex justify-center mb-6">
              <CheckCircleIcon />
            </div>
            <div className="flex items-center justify-center gap-2 mb-5">
              <BrandMark />
              <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">SOLVO</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Personality Assessment Complete!
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Your results have been saved. Continue with the next module to build your full career profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/test/interest"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 transition-colors shadow-md shadow-blue-100"
              >
                Continue to Interests Test <ArrowRightIcon />
              </Link>
              <Link
                href="/test"
                className="inline-flex items-center justify-center w-full rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm px-6 py-3.5 transition-colors"
              >
                Back to Assessment Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN TEST UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .q-card {
          animation: qFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes qFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Stagger each question card */
        .q-card:nth-child(1)  { animation-delay: 0.02s; }
        .q-card:nth-child(2)  { animation-delay: 0.05s; }
        .q-card:nth-child(3)  { animation-delay: 0.08s; }
        .q-card:nth-child(4)  { animation-delay: 0.11s; }
        .q-card:nth-child(5)  { animation-delay: 0.14s; }
        .q-card:nth-child(6)  { animation-delay: 0.17s; }
        .q-card:nth-child(7)  { animation-delay: 0.20s; }
        .q-card:nth-child(8)  { animation-delay: 0.23s; }
        .q-card:nth-child(9)  { animation-delay: 0.26s; }
        .q-card:nth-child(10) { animation-delay: 0.29s; }

        /* Likert button active state ring */
        .likert-btn:focus-visible {
          outline: 2px solid #007AFF;
          outline-offset: 2px;
        }
      `}</style>

      <div
        ref={topRef}
        className="min-h-screen bg-[#F2F2F7]"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >

        {/* ── STICKY PROGRESS HEADER ─────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">

            {/* Top row: brand + title + lang toggle */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <BrandMark />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-[13px] tracking-tight leading-none">SOLVO</p>
                  <p className="text-[11px] font-semibold text-slate-500 leading-none mt-0.5">Personality Assessment</p>
                </div>
              </div>

              {/* Language toggle */}
              <button
                onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors"
                aria-label="Toggle language"
              >
                <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
                {lang === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>

            {/* Progress info row */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                Page <span className="text-slate-800">{currentPage + 1}</span> of {TOTAL_PAGES}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                <span className="text-[#007AFF] font-bold">{totalAnswered}</span> / 50 answered
              </span>
            </div>

            {/* Segmented progress bar — 5 segments, one per page */}
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
                const segAnswered = Array.from({ length: QUESTIONS_PER_PAGE }, (__, j) => {
                  const q = personalityQuestions[i * QUESTIONS_PER_PAGE + j];
                  return q && answers[q.id] !== undefined;
                });
                const segCount  = segAnswered.filter(Boolean).length;
                const segFill   = (segCount / QUESTIONS_PER_PAGE) * 100;
                const isActive  = i === currentPage;
                return (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${segFill}%`,
                        backgroundColor: isActive ? '#007AFF' : segFill === 100 ? '#34C759' : '#007AFF',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── QUESTION CARDS ────────────────────────────────────────────────── */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">

          {/* Validation banner */}
          {showValidation && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">⚠️</span>
              <p className="text-red-700 text-sm font-semibold">
                Please answer all questions before continuing.
              </p>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">❌</span>
              <div>
                <p className="text-red-700 text-sm font-semibold">{submitError}</p>
                <button
                  onClick={handleSubmit}
                  className="mt-2 text-xs font-bold text-red-700 underline underline-offset-2 hover:text-red-900"
                >
                  Retry submission
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {pageQuestions.map((question, idx) => {
              const globalIdx   = currentPage * QUESTIONS_PER_PAGE + idx;
              const selected    = answers[question.id];
              const hasError    = unansweredOnPage.includes(question.id);
              const questionText = lang === 'hi' && question.text_hi
                ? question.text_hi
                : question.text_en ?? (question as any).text ?? '';

              return (
                <div
                  key={question.id}
                  id={`q-${question.id}`}
                  className={[
                    'q-card bg-white rounded-2xl border shadow-sm transition-all duration-200',
                    hasError
                      ? 'border-red-300 ring-1 ring-red-200'
                      : selected !== undefined
                      ? 'border-slate-200'
                      : 'border-slate-200',
                  ].join(' ')}
                >
                  <div className="p-5 sm:p-6">

                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-5">
                      {/* Number badge — blue for current page, green if answered */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                        style={{
                          backgroundColor: selected !== undefined ? '#34C759' : '#007AFF',
                          color: 'white',
                        }}
                      >
                        {globalIdx + 1}
                      </div>
                      <p className="text-slate-800 font-semibold text-[15px] leading-snug pt-0.5">
                        {questionText}
                      </p>
                    </div>

                    {/* ── Likert Options ──────────────────────────────────── */}

                    {/* Mobile: vertical stacked buttons */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      {LIKERT.map((opt) => {
                        const isSelected = selected === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleAnswer(question.id, opt.value)}
                            className={[
                              'likert-btn w-full min-h-[48px] rounded-xl border px-4 py-3',
                              'flex items-center gap-3 text-left transition-all duration-150',
                              isSelected
                                ? 'border-[#007AFF] bg-[#007AFF] text-white shadow-md shadow-blue-100'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200',
                            ].join(' ')}
                          >
                            {/* Value dot */}
                            <span
                              className={[
                                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold',
                                isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-500',
                              ].join(' ')}
                            >
                              {opt.value}
                            </span>
                            <span className="text-sm font-semibold">
                              {lang === 'hi' ? opt.hi : opt.en}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Desktop: horizontal row */}
                    <div className="hidden sm:grid grid-cols-5 gap-2">
                      {LIKERT.map((opt) => {
                        const isSelected = selected === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleAnswer(question.id, opt.value)}
                            className={[
                              'likert-btn min-h-[80px] rounded-xl border flex flex-col items-center',
                              'justify-center gap-1.5 px-1.5 py-3 text-center transition-all duration-150',
                              isSelected
                                ? 'border-[#007AFF] bg-[#007AFF] text-white shadow-md shadow-blue-100'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200',
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold',
                                isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-600',
                              ].join(' ')}
                            >
                              {opt.value}
                            </span>
                            <span className="text-[11px] font-semibold leading-tight">
                              {lang === 'hi' ? opt.hi : opt.en}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── STICKY BOTTOM NAVIGATION ─────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

            {/* Previous */}
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold',
                'transition-all duration-150 min-h-[48px]',
                currentPage === 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700',
              ].join(' ')}
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Previous
            </button>

            {/* Page dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:           i === currentPage ? 20 : 6,
                    height:          6,
                    backgroundColor: i === currentPage
                      ? '#007AFF'
                      : i < currentPage
                      ? '#34C759'
                      : '#E2E8F0',
                  }}
                />
              ))}
            </div>

            {/* Next / Submit */}
            {isLastPage ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold',
                  'transition-all duration-150 min-h-[48px] shadow-md shadow-green-100',
                  isSubmitting
                    ? 'bg-green-300 text-white cursor-not-allowed'
                    : 'bg-[#34C759] hover:bg-green-600 active:bg-green-700 text-white',
                ].join(' ')}
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Assessment <ArrowRightIcon className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold',
                  'transition-all duration-150 min-h-[48px] shadow-md shadow-blue-100',
                  'bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white',
                ].join(' ')}
              >
                Next <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </nav>

      </div>
    </>
  );
}