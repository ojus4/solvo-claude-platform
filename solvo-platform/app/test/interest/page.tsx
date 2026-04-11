'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { interestQuestions } from '@/lib/scoring/interest-questions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang   = 'en' | 'hi';
type RType  = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS_PER_PAGE = 7;
const RIASEC_ORDER: RType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const TOTAL_PAGES = RIASEC_ORDER.length; // 6

interface CategoryMeta {
  label:       string;
  description: string;
  color:       string;   // Tailwind bg class for badge
  textColor:   string;   // Tailwind text class for badge text
  hex:         string;   // raw hex for progress accent
}

const CATEGORY: Record<RType, CategoryMeta> = {
  R: {
    label:       'Realistic — The Doer',
    description: 'These questions are about working with tools, machines, or outdoors.',
    color:       'bg-orange-100',
    textColor:   'text-orange-700',
    hex:         '#F97316',
  },
  I: {
    label:       'Investigative — The Thinker',
    description: 'These questions are about research, analysis, and solving problems.',
    color:       'bg-blue-100',
    textColor:   'text-blue-700',
    hex:         '#007AFF',
  },
  A: {
    label:       'Artistic — The Creator',
    description: 'These questions are about creativity, art, and self-expression.',
    color:       'bg-purple-100',
    textColor:   'text-purple-700',
    hex:         '#A855F7',
  },
  S: {
    label:       'Social — The Helper',
    description: 'These questions are about helping, teaching, and working with people.',
    color:       'bg-green-100',
    textColor:   'text-green-700',
    hex:         '#34C759',
  },
  E: {
    label:       'Enterprising — The Persuader',
    description: 'These questions are about leading, persuading, and business.',
    color:       'bg-red-100',
    textColor:   'text-red-700',
    hex:         '#FF3B30',
  },
  C: {
    label:       'Conventional — The Organiser',
    description: 'These questions are about organising, data, and following processes.',
    color:       'bg-yellow-100',
    textColor:   'text-yellow-700',
    hex:         '#FFCC00',
  },
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InterestTestPage() {
  const [answers, setAnswers]               = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage]       = useState(0);
  const [lang, setLang]                     = useState<Lang>('en');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [isComplete, setIsComplete]         = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  const currentType      = RIASEC_ORDER[currentPage]!;
  const meta             = CATEGORY[currentType];
  const pageQuestions    = interestQuestions.filter((q) => q.type === currentType);
  const totalAnswered    = Object.keys(answers).length;
  const isLastPage       = currentPage === TOTAL_PAGES - 1;
  const pageComplete     = pageQuestions.every((q) => answers[q.id] !== undefined);
  const unansweredOnPage = showValidation
    ? pageQuestions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    : [];

  // Scroll to top on page change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnswer = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (showValidation) {
      const updated = { ...answers, [questionId]: value };
      if (pageQuestions.every((q) => updated[q.id] !== undefined)) setShowValidation(false);
    }
  };

  const handleNext = () => {
    if (!pageComplete) {
      setShowValidation(true);
      const firstUnanswered = pageQuestions.find((q) => answers[q.id] === undefined);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setShowValidation(false);
    if (!isLastPage) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    setShowValidation(false);
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleSubmit = async () => {
    const allAnswered = Object.keys(answers).length === interestQuestions.length;
    if (!allAnswered) { setShowValidation(true); return; }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/psychometric/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module:       'interest',
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
            <div className="flex justify-center mb-6"><CheckCircleIcon /></div>
            <div className="flex items-center justify-center gap-2 mb-5">
              <BrandMark />
              <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">SOLVO</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Interest Assessment Complete!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Your Holland Code has been calculated. Continue to discover your aptitude profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/test/aptitude"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 transition-colors shadow-md shadow-blue-100"
              >
                Continue to Aptitude Test <ArrowRightIcon />
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
  const progressPct = (currentPage / TOTAL_PAGES) * 100;

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
        .q-card:nth-child(1) { animation-delay: 0.02s; }
        .q-card:nth-child(2) { animation-delay: 0.06s; }
        .q-card:nth-child(3) { animation-delay: 0.10s; }
        .q-card:nth-child(4) { animation-delay: 0.14s; }
        .q-card:nth-child(5) { animation-delay: 0.18s; }
        .q-card:nth-child(6) { animation-delay: 0.22s; }
        .q-card:nth-child(7) { animation-delay: 0.26s; }

        .yn-btn:focus-visible { outline: 2px solid #007AFF; outline-offset: 2px; }
      `}</style>

      <div
        ref={topRef}
        className="min-h-screen bg-[#F2F2F7]"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >

        {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">

            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <BrandMark />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-[13px] tracking-tight leading-none">SOLVO</p>
                  <p className="text-[11px] font-semibold text-slate-500 leading-none mt-0.5">Interest Assessment</p>
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

            {/* Category + counter */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {/* Category letter badge */}
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-extrabold ${meta.color} ${meta.textColor}`}
                >
                  {currentType}
                </span>
                <span className="text-[12px] font-bold text-slate-700 truncate max-w-[180px] sm:max-w-none">
                  {meta.label}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums flex-shrink-0">
                Section <span className="text-slate-800">{currentPage + 1}</span> of {TOTAL_PAGES}
              </span>
            </div>

            {/* Segmented progress bar — 6 segments */}
            <div className="flex gap-1">
              {RIASEC_ORDER.map((type, i) => {
                const sectionQs  = interestQuestions.filter((q) => q.type === type);
                const answered   = sectionQs.filter((q) => answers[q.id] !== undefined).length;
                const fillPct    = sectionQs.length > 0 ? (answered / sectionQs.length) * 100 : 0;
                const isActive   = i === currentPage;
                return (
                  <div key={type} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${fillPct}%`,
                        backgroundColor: fillPct === 100 ? '#34C759' : isActive ? CATEGORY[type].hex : CATEGORY[type].hex,
                        opacity: isActive || fillPct > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">

          {/* Section intro card */}
          <div
            className="q-card rounded-2xl border border-slate-200 bg-white shadow-sm mb-5 overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: meta.hex }}
          >
            <div className="px-5 py-4 flex items-start gap-3">
              <span
                className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg font-extrabold ${meta.color} ${meta.textColor}`}
              >
                {currentType}
              </span>
              <div>
                <p className={`text-sm font-extrabold ${meta.textColor} mb-0.5`}>{meta.label}</p>
                <p className="text-slate-500 text-[13px] leading-relaxed">{meta.description}</p>
              </div>
            </div>
          </div>

          {/* Validation banner */}
          {showValidation && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">⚠️</span>
              <p className="text-red-700 text-sm font-semibold">
                Please answer all questions before continuing.
              </p>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">❌</span>
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

          {/* Question cards */}
          <div className="space-y-4">
            {pageQuestions.map((question, idx) => {
              const globalIdx    = currentPage * QUESTIONS_PER_PAGE + idx;
              const selected     = answers[question.id]; // true | false | undefined
              const hasError     = unansweredOnPage.includes(question.id);
              const questionText = lang === 'hi' && question.text_hi
                ? question.text_hi
                : question.text_en ?? (question as any).text ?? '';

              const yesSelected = selected === true;
              const noSelected  = selected === false;

              return (
                <div
                  key={question.id}
                  id={`q-${question.id}`}
                  className={[
                    'q-card bg-white rounded-2xl border shadow-sm transition-all duration-200',
                    hasError
                      ? 'border-red-300 ring-1 ring-red-200'
                      : 'border-slate-200 hover:shadow-md',
                  ].join(' ')}
                >
                  <div className="p-5 sm:p-6">

                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-5">
                      {/* Number badge */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold"
                        style={{
                          backgroundColor:
                            yesSelected ? '#34C759'
                            : noSelected  ? '#FF3B30'
                            : meta.hex,
                          color: 'white',
                        }}
                      >
                        {globalIdx + 1}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Would you enjoy…
                        </p>
                        <p className="text-slate-800 font-semibold text-[15px] leading-snug">
                          {questionText}
                        </p>
                      </div>
                    </div>

                    {/* YES / NO buttons */}
                    <div className="grid grid-cols-2 gap-3">

                      {/* YES */}
                      <button
                        onClick={() => handleAnswer(question.id, true)}
                        className={[
                          'yn-btn flex items-center justify-center gap-2 rounded-xl border-2',
                          'font-bold text-[15px] transition-all duration-150 min-h-[56px]',
                          yesSelected
                            ? 'border-[#34C759] bg-[#34C759] text-white shadow-md shadow-green-100'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-green-300 hover:bg-green-50 hover:text-green-700 active:bg-green-100',
                        ].join(' ')}
                      >
                        {/* Thumb-up tick */}
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 flex-shrink-0"
                          aria-hidden
                        >
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        Yes
                      </button>

                      {/* NO */}
                      <button
                        onClick={() => handleAnswer(question.id, false)}
                        className={[
                          'yn-btn flex items-center justify-center gap-2 rounded-xl border-2',
                          'font-bold text-[15px] transition-all duration-150 min-h-[56px]',
                          noSelected
                            ? 'border-[#FF3B30] bg-[#FF3B30] text-white shadow-md shadow-red-100'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:bg-red-100',
                        ].join(' ')}
                      >
                        {/* Thumb-down */}
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5 flex-shrink-0"
                          aria-hidden
                        >
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        No
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* ── STICKY BOTTOM NAV ────────────────────────────────────────────── */}
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
              <ArrowLeftIcon className="h-3.5 w-3.5" /> Previous
            </button>

            {/* Section dots */}
            <div className="flex items-center gap-1.5">
              {RIASEC_ORDER.map((type, i) => (
                <div
                  key={type}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:           i === currentPage ? 20 : 6,
                    height:          6,
                    backgroundColor:
                      i === currentPage
                        ? CATEGORY[type].hex
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
                  <>Submit Assessment <ArrowRightIcon className="h-3.5 w-3.5" /></>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold',
                  'transition-all duration-150 min-h-[48px] shadow-md',
                ].join(' ')}
                style={{ backgroundColor: meta.hex, color: currentType === 'C' ? '#1a1a1a' : 'white' }}
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