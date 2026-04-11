'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { aptitudeQuestions } from '@/lib/scoring/aptitude-questions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang     = 'en' | 'hi';
type Category = 'Numerical' | 'Verbal' | 'Logical';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS_PER_PAGE   = 10;
const TIME_LIMIT_SECONDS   = 1800;
const CATEGORY_ORDER: Category[] = ['Numerical', 'Verbal', 'Logical'];
const TOTAL_PAGES          = CATEGORY_ORDER.length;
const OPTION_LABELS        = ['A', 'B', 'C', 'D'];

interface CategoryMeta {
  label:       string;
  description: string;
  hex:         string;
  lightBg:     string;
  textColor:   string;
  borderColor: string;
}

const CATEGORY_META: Record<Category, CategoryMeta> = {
  Numerical: {
    label:       'Numerical Reasoning',
    description: 'Test your ability to work with numbers, ratios, and calculations.',
    hex:         '#007AFF',
    lightBg:     'bg-blue-50',
    textColor:   'text-blue-700',
    borderColor: 'border-blue-400',
  },
  Verbal: {
    label:       'Verbal Reasoning',
    description: 'Test your understanding of language, vocabulary, and grammar.',
    hex:         '#A855F7',
    lightBg:     'bg-purple-50',
    textColor:   'text-purple-700',
    borderColor: 'border-purple-400',
  },
  Logical: {
    label:       'Logical Reasoning',
    description: 'Test your ability to identify patterns and draw conclusions.',
    hex:         '#F97316',
    lightBg:     'bg-orange-50',
    textColor:   'text-orange-700',
    borderColor: 'border-orange-400',
  },
};

// ─── Helper: format seconds → M:SS ───────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

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

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? 'h-4 w-4'}>
      <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 6v3.25L9.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 2h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 2v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AptitudeTestPage() {
  const [answers, setAnswers]               = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage]       = useState(0);
  const [lang, setLang]                     = useState<Lang>('en');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [isComplete, setIsComplete]         = useState(false);
  const [timeRemaining, setTimeRemaining]   = useState(TIME_LIMIT_SECONDS);
  const [timerActive, setTimerActive]       = useState(true);
  const [showFiveMinWarn, setShowFiveMinWarn] = useState(false);
  const [timeTaken, setTimeTaken]           = useState(0);

  const topRef         = useRef<HTMLDivElement>(null);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmit  = useRef(false);
  const fiveMinShown   = useRef(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentCategory  = CATEGORY_ORDER[currentPage]!;
  const meta             = CATEGORY_META[currentCategory];
  const pageQuestions    = aptitudeQuestions.filter((q) => q.category === currentCategory);
  const totalAnswered    = Object.keys(answers).length;
  const isLastPage       = currentPage === TOTAL_PAGES - 1;
  const unansweredOnPage = pageQuestions.filter((q) => answers[q.id] === undefined).length;

  // ── Timer colour ───────────────────────────────────────────────────────────
  const timerColor =
    timeRemaining > 600 ? '#34C759'   // > 10 min → green
    : timeRemaining > 300 ? '#FFCC00' // 5–10 min → amber
    : '#FF3B30';                       // < 5 min → red

  // ── Submit (used by button AND auto-submit) ────────────────────────────────
  const submitAssessment = useCallback(async (currentAnswers: Record<string, number>) => {
    if (hasAutoSubmit.current) return;
    hasAutoSubmit.current = true;
    setIsSubmitting(true);
    setTimerActive(false);
    setTimeTaken(TIME_LIMIT_SECONDS - timeRemaining);

    try {
      const res = await fetch('/api/psychometric/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module:       'aptitude',
          raw_answers:  currentAnswers,
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
      hasAutoSubmit.current = false;
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  // ── Timer effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || isComplete) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;

        // 5-minute warning
        if (next === 300 && !fiveMinShown.current) {
          fiveMinShown.current = true;
          setShowFiveMinWarn(true);
          setTimeout(() => setShowFiveMinWarn(false), 8000);
        }

        // Auto-submit on expiry
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          setTimeTaken(TIME_LIMIT_SECONDS);
          // Use functional updater to get latest answers snapshot
          setAnswers((latestAnswers) => {
            submitAssessment(latestAnswers);
            return latestAnswers;
          });
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, isComplete, submitAssessment]);

  // Scroll to top on page change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnswer = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleNext = () => {
    if (!isLastPage) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleSubmitClick = () => {
    submitAssessment(answers);
  };

  // ── Time taken display ─────────────────────────────────────────────────────
  const takenMins = Math.floor(timeTaken / 60);
  const takenSecs = timeTaken % 60;

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
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Aptitude Assessment Complete!</h2>
            <p className="text-slate-500 text-sm mb-1 leading-relaxed">Your scores have been saved.</p>
            <p className="text-[13px] font-semibold text-slate-400 mb-8">
              Completed in{' '}
              <span className="text-slate-700">{takenMins} min{takenMins !== 1 ? 's' : ''} {takenSecs} sec{takenSecs !== 1 ? 's' : ''}</span>
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/test/eq"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 transition-colors shadow-md shadow-blue-100"
              >
                Continue to EQ Test <ArrowRightIcon />
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
          to   { opacity: 1; transform: translateY(0); }
        }
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

        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }
        .timer-pulse { animation: timerPulse 1s ease-in-out infinite; }

        @keyframes warnSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .warn-slide { animation: warnSlide 0.3s ease-out; }

        .opt-btn:focus-visible { outline: 2px solid #007AFF; outline-offset: 2px; }
      `}</style>

      <div
        ref={topRef}
        className="min-h-screen bg-[#F2F2F7]"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >

        {/* ── 5-MINUTE WARNING TOAST ───────────────────────────────────────── */}
        {showFiveMinWarn && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 warn-slide">
            <div className="bg-[#FFCC00] border border-yellow-400 rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <p className="text-slate-900 text-sm font-bold">5 minutes remaining!</p>
            </div>
          </div>
        )}

        {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">

            {/* Top row: brand | category | timer */}
            <div className="flex items-center justify-between gap-3 mb-2">

              {/* Left: brand + title */}
              <div className="flex items-center gap-2 min-w-0">
                <BrandMark />
                <div className="min-w-0 hidden sm:block">
                  <p className="font-extrabold text-slate-900 text-[13px] tracking-tight leading-none">SOLVO</p>
                  <p className="text-[11px] font-semibold text-slate-500 leading-none mt-0.5">Aptitude Assessment</p>
                </div>
              </div>

              {/* Center: category name + section */}
              <div className="text-center flex-1 min-w-0 px-2">
                <p className="text-[13px] font-extrabold text-slate-800 truncate">{meta.label}</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Section <span className="text-slate-700">{currentPage + 1}</span> of {TOTAL_PAGES}
                </p>
              </div>

              {/* Right: timer */}
              <div
                className={[
                  'flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2',
                  'border font-mono font-extrabold text-sm tabular-nums',
                  timeRemaining < 300 ? 'timer-pulse' : '',
                ].join(' ')}
                style={{
                  borderColor:      timerColor,
                  color:            timerColor,
                  backgroundColor:  timerColor + '15',
                }}
              >
                <TimerIcon className="h-3.5 w-3.5 flex-shrink-0" />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Lang toggle row */}
            <div className="flex items-center justify-between mb-2">
              {/* Overall progress */}
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                <span style={{ color: '#007AFF' }} className="font-bold">{totalAnswered}</span>
                <span className="text-slate-400"> / 30 answered</span>
              </span>

              {/* Language toggle */}
              <button
                onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors"
                aria-label="Toggle language"
              >
                <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
                {lang === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>

            {/* Segmented progress bar — 3 categories */}
            <div className="flex gap-1">
              {CATEGORY_ORDER.map((cat, i) => {
                const catQs     = aptitudeQuestions.filter((q) => q.category === cat);
                const answered  = catQs.filter((q) => answers[q.id] !== undefined).length;
                const fillPct   = catQs.length > 0 ? (answered / catQs.length) * 100 : 0;
                const m         = CATEGORY_META[cat];
                return (
                  <div key={cat} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width:           `${fillPct}%`,
                        backgroundColor: fillPct === 100 ? '#34C759' : m.hex,
                        opacity:         i === currentPage || fillPct > 0 ? 1 : 0.3,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">

          {/* Section intro card */}
          <div
            className="q-card bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: meta.hex }}
          >
            <div className="px-5 py-4 flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold ${meta.lightBg} ${meta.textColor}`}
              >
                {currentCategory[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className={`text-sm font-extrabold ${meta.textColor}`}>{meta.label}</p>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    10 questions · No negative marking
                  </span>
                </div>
                <p className="text-slate-500 text-[13px] leading-relaxed">{meta.description}</p>
              </div>
            </div>
          </div>

          {/* Unanswered warning (non-blocking) */}
          {unansweredOnPage > 0 && (
            <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5 flex-shrink-0">💡</span>
              <p className="text-yellow-800 text-sm font-semibold">
                You have <span className="font-extrabold">{unansweredOnPage}</span> unanswered question{unansweredOnPage > 1 ? 's' : ''} on this page.
                You can still proceed — unanswered questions score 0.
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
                  onClick={handleSubmitClick}
                  className="mt-2 text-xs font-bold text-red-700 underline underline-offset-2 hover:text-red-900"
                >
                  Retry submission
                </button>
              </div>
            </div>
          )}

          {/* Question cards */}
          <div className="space-y-5">
            {pageQuestions.map((question, idx) => {
              const globalIdx    = currentPage * QUESTIONS_PER_PAGE + idx;
              const selected     = answers[question.id]; // number | undefined
              const isUnanswered = selected === undefined;
              const questionText = lang === 'hi' && question.text_hi
                ? question.text_hi
                : question.text_en ?? (question as any).text ?? '';
              const options: string[] = lang === 'hi' && question.options_hi?.length
                ? question.options_hi
                : question.options_en ?? [];

              return (
                <div
                  key={question.id}
                  id={`q-${question.id}`}
                  className={[
                    'q-card bg-white rounded-2xl border shadow-sm transition-shadow duration-200 hover:shadow-md overflow-hidden',
                    isUnanswered ? 'border-slate-200 border-l-[3px] border-l-yellow-300' : 'border-slate-200',
                  ].join(' ')}
                >
                  <div className="p-5 sm:p-6">

                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-5">
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white"
                        style={{ backgroundColor: selected !== undefined ? '#34C759' : meta.hex }}
                      >
                        Q{globalIdx + 1}
                      </div>
                      <p className="text-slate-800 font-semibold text-[15px] leading-snug pt-0.5">
                        {questionText}
                      </p>
                    </div>

                    {/* Options — vertical on mobile, 2×2 grid on desktop */}
                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2.5">
                      {options.map((optText, optIdx) => {
                        const isSelected = selected === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswer(question.id, optIdx)}
                            className={[
                              'opt-btn w-full min-h-[52px] rounded-xl border-2 flex items-center gap-3',
                              'px-4 py-3 text-left transition-all duration-150 text-sm font-semibold',
                              isSelected
                                ? 'text-white border-transparent shadow-md'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200',
                            ].join(' ')}
                            style={isSelected ? { backgroundColor: meta.hex } : {}}
                          >
                            {/* Letter badge */}
                            <span
                              className={[
                                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                                'text-xs font-extrabold transition-colors',
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-white border border-slate-200 text-slate-500',
                              ].join(' ')}
                            >
                              {OPTION_LABELS[optIdx]}
                            </span>
                            <span className="leading-snug">{optText}</span>
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

        {/* ── STICKY BOTTOM NAV ────────────────────────────────────────────── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">

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
              {CATEGORY_ORDER.map((cat, i) => (
                <div
                  key={cat}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:           i === currentPage ? 20 : 6,
                    height:          6,
                    backgroundColor:
                      i === currentPage
                        ? CATEGORY_META[cat].hex
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
                onClick={handleSubmitClick}
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
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-150 min-h-[48px] text-white shadow-md"
                style={{ backgroundColor: meta.hex }}
              >
                Next Section <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            )}

          </div>
        </nav>

      </div>
    </>
  );
}