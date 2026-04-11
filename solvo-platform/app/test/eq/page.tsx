'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { eqQuestions } from '@/lib/scoring/eq-questions';

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang     = 'en' | 'hi';
type EQCat    = 'SA' | 'ER' | 'CI' | 'EI' | 'AD';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUESTIONS_PER_PAGE               = 6;
const CATEGORY_ORDER: EQCat[]          = ['SA', 'ER', 'CI', 'EI', 'AD'];
const TOTAL_PAGES                      = CATEGORY_ORDER.length; // 5

const LIKERT_LABELS: Record<number, { en: string; hi: string }> = {
  1: { en: 'Strongly Disagree', hi: 'पूर्णतः असहमत' },
  2: { en: 'Disagree',          hi: 'असहमत'          },
  3: { en: 'Neutral',           hi: 'तटस्थ'           },
  4: { en: 'Agree',             hi: 'सहमत'            },
  5: { en: 'Strongly Agree',    hi: 'पूर्णतः सहमत'    },
};

interface DimensionMeta {
  label:       string;
  description: string;
  hex:         string;
  lightBg:     string;
  textColor:   string;
  ringColor:   string; // for the icon circle ring
}

const DIMENSION: Record<EQCat, DimensionMeta> = {
  SA: {
    label:       'Self-Awareness',
    description: 'How well do you understand your own emotions and their impact?',
    hex:         '#6366F1',
    lightBg:     'bg-indigo-50',
    textColor:   'text-indigo-700',
    ringColor:   'ring-indigo-200',
  },
  ER: {
    label:       'Emotional Regulation',
    description: 'How effectively do you manage your emotions under pressure?',
    hex:         '#3B82F6',
    lightBg:     'bg-blue-50',
    textColor:   'text-blue-700',
    ringColor:   'ring-blue-200',
  },
  CI: {
    label:       'Communication & Influence',
    description: 'How well do you express yourself and connect with others?',
    hex:         '#8B5CF6',
    lightBg:     'bg-violet-50',
    textColor:   'text-violet-700',
    ringColor:   'ring-violet-200',
  },
  EI: {
    label:       'Empathy & Interpersonal Skills',
    description: 'How well do you understand and relate to other people?',
    hex:         '#10B981',
    lightBg:     'bg-emerald-50',
    textColor:   'text-emerald-700',
    ringColor:   'ring-emerald-200',
  },
  AD: {
    label:       'Adaptability',
    description: 'How well do you adjust to change and unexpected challenges?',
    hex:         '#F59E0B',
    lightBg:     'bg-amber-50',
    textColor:   'text-amber-700',
    ringColor:   'ring-amber-200',
  },
};

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

// Dimension icon glyphs — each EQ category gets a distinct SVG path
function DimensionIcon({ cat, className }: { cat: EQCat; className?: string }) {
  const paths: Record<EQCat, React.ReactNode> = {
    SA: <><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M6 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M17 11l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
    ER: <><path d="M12 3C7.029 3 3 7.029 3 12s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9Z" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
    CI: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
    EI: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
    AD: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? 'w-5 h-5'}>
      {paths[cat]}
    </svg>
  );
}

// ─── Agreement Scale Legend ───────────────────────────────────────────────────

function ScaleLegend({ lang, accentHex }: { lang: Lang; accentHex: string }) {
  const items = [1, 2, 3, 4, 5];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 mb-5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
        Rating Scale Reference
      </p>
      <div className="flex items-stretch gap-1.5">
        {items.map((v) => (
          <div key={v} className="flex-1 flex flex-col items-center gap-1">
            {/* Number dot */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
              style={{ backgroundColor: accentHex, opacity: 0.2 + (v / 5) * 0.8 }}
            >
              <span style={{ color: v >= 3 ? 'white' : '#374151' }}>{v}</span>
            </div>
            {/* Label */}
            <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight hidden sm:block">
              {LIKERT_LABELS[v]![lang]}
            </span>
          </div>
        ))}
      </div>
      {/* Mobile compact label row */}
      <div className="flex items-center justify-between mt-2 sm:hidden">
        <span className="text-[10px] font-semibold text-slate-400">{LIKERT_LABELS[1]![lang]}</span>
        <span className="text-[10px] font-semibold text-slate-400">{LIKERT_LABELS[5]![lang]}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EQTestPage() {
  const [answers, setAnswers]               = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage]       = useState(0);
  const [lang, setLang]                     = useState<Lang>('en');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);
  const [isComplete, setIsComplete]         = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentCat    = CATEGORY_ORDER[currentPage]!;
  const meta          = DIMENSION[currentCat];
  const pageQuestions = eqQuestions.filter((q) => q.category === currentCat);
  const totalAnswered = Object.keys(answers).length;
  const isLastPage    = currentPage === TOTAL_PAGES - 1;
  const pageAnswered  = pageQuestions.filter((q) => answers[q.id] !== undefined).length;
  const pageComplete  = pageAnswered === QUESTIONS_PER_PAGE;

  const unansweredOnPage = showValidation
    ? pageQuestions.filter((q) => answers[q.id] === undefined).map((q) => q.id)
    : [];

  // ── Scroll top on page change ──────────────────────────────────────────────
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentPage]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (showValidation) {
      const updated = { ...answers, [questionId]: value };
      if (pageQuestions.every((q) => updated[q.id] !== undefined)) setShowValidation(false);
    }
  };

  const handleNext = () => {
    if (!pageComplete) {
      setShowValidation(true);
      const first = pageQuestions.find((q) => answers[q.id] === undefined);
      if (first) document.getElementById(`q-${first.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const allAnswered = Object.keys(answers).length === eqQuestions.length;
    if (!allAnswered) { setShowValidation(true); return; }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/psychometric/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module:       'eq',
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center max-w-sm w-full">

            {/* Checkmark */}
            <div className="flex justify-center mb-5"><CheckCircleIcon /></div>

            {/* Brand */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <BrandMark />
              <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">SOLVO</span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">EQ Assessment Complete!</h2>
            <p className="text-slate-500 text-sm mb-2 leading-relaxed">
              Your emotional intelligence profile has been saved.
            </p>
            <p className="text-[13px] text-slate-400 mb-6 leading-relaxed">
              Your full EQ breakdown will appear in your career report.
            </p>

            {/* All-4-done celebration banner */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="font-extrabold text-slate-900 text-base mb-1">All 4 assessments complete!</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                You can now generate your personalised career report.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm px-6 py-3.5 transition-colors shadow-md shadow-blue-100"
              >
                View My Results <ArrowRightIcon />
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
        .q-card:nth-child(1) { animation-delay: 0.02s; }
        .q-card:nth-child(2) { animation-delay: 0.06s; }
        .q-card:nth-child(3) { animation-delay: 0.10s; }
        .q-card:nth-child(4) { animation-delay: 0.14s; }
        .q-card:nth-child(5) { animation-delay: 0.18s; }
        .q-card:nth-child(6) { animation-delay: 0.22s; }

        .rating-btn:focus-visible { outline: 2px solid #007AFF; outline-offset: 2px; }
      `}</style>

      <div
        ref={topRef}
        className="min-h-screen bg-[#F2F2F7]"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >

        {/* ── STICKY HEADER ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">

            {/* Top row: brand | lang toggle */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <BrandMark />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 text-[13px] tracking-tight leading-none">SOLVO</p>
                  <p className="text-[11px] font-semibold text-slate-500 leading-none mt-0.5">
                    Emotional Intelligence Assessment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors"
                aria-label="Toggle language"
              >
                <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
                {lang === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>

            {/* Dimension name + section counter */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-extrabold"
                  style={{ backgroundColor: meta.hex + '22', color: meta.hex }}
                >
                  {currentCat}
                </span>
                <span className="text-[12px] font-bold text-slate-700 truncate max-w-[200px] sm:max-w-none">
                  {meta.label}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums flex-shrink-0">
                Dimension <span className="text-slate-800">{currentPage + 1}</span> of {TOTAL_PAGES}
              </span>
            </div>

            {/* Segmented progress bar — 5 dimensions */}
            <div className="flex gap-1">
              {CATEGORY_ORDER.map((cat, i) => {
                const catQs   = eqQuestions.filter((q) => q.category === cat);
                const ans     = catQs.filter((q) => answers[q.id] !== undefined).length;
                const fillPct = catQs.length > 0 ? (ans / catQs.length) * 100 : 0;
                const dm      = DIMENSION[cat];
                return (
                  <div key={cat} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width:           `${fillPct}%`,
                        backgroundColor: fillPct === 100 ? '#34C759' : dm.hex,
                        opacity:         i === currentPage || fillPct > 0 ? 1 : 0.25,
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

          {/* Dimension intro card */}
          <div
            className="q-card bg-white rounded-2xl border border-slate-200 shadow-sm mb-5 overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: meta.hex }}
          >
            <div className="px-5 py-4 flex items-start gap-4">
              {/* Icon circle */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ring-2"
                style={{ backgroundColor: meta.hex + '18', color: meta.hex }}
              >
                <DimensionIcon cat={currentCat} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="text-sm font-extrabold" style={{ color: meta.hex }}>{meta.label}</p>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    6 questions · Rate your agreement
                  </span>
                </div>
                <p className="text-slate-500 text-[13px] leading-relaxed">{meta.description}</p>
              </div>
            </div>
          </div>

          {/* Scale legend */}
          <ScaleLegend lang={lang} accentHex={meta.hex} />

          {/* Answered count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Questions
            </span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: meta.hex }}>
              {pageAnswered} of {QUESTIONS_PER_PAGE} answered
            </span>
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
              const selected     = answers[question.id];
              const hasError     = unansweredOnPage.includes(question.id);
              const isReverse    = (question as any).polarity === -1 || (question as any).reverse === true;
              const questionText = lang === 'hi' && question.text_hi
                ? question.text_hi
                : question.text_en ?? (question as any).text ?? '';

              return (
                <div
                  key={question.id}
                  id={`q-${question.id}`}
                  className={[
                    'q-card bg-white rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md',
                    hasError
                      ? 'border-red-300 ring-1 ring-red-200'
                      : 'border-slate-200',
                  ].join(' ')}
                >
                  <div className="p-5 sm:p-6">

                    {/* Card header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Question number badge */}
                        <div
                          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold text-white"
                          style={{
                            backgroundColor: selected !== undefined ? '#34C759' : meta.hex,
                          }}
                        >
                          Q{globalIdx + 1}
                        </div>
                        <div className="min-w-0">
                          {/* Dimension badge */}
                          <span
                            className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1.5"
                            style={{ backgroundColor: meta.hex + '18', color: meta.hex }}
                          >
                            {meta.label}
                          </span>
                          {/* Question text */}
                          <p className="text-slate-800 font-semibold text-[15px] leading-snug">
                            {questionText}
                          </p>
                          {/* Reverse score indicator */}
                          {isReverse && (
                            <p className="mt-1.5 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                              <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0">
                                <path d="M6 1v10M2 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Reverse item
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating buttons — horizontal row */}
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((val) => {
                        const isSelected = selected === val;
                        return (
                          <button
                            key={val}
                            onClick={() => handleAnswer(question.id, val)}
                            className={[
                              'rating-btn flex-1 min-h-[48px] rounded-xl border-2 flex items-center',
                              'justify-center font-extrabold text-base transition-all duration-150',
                              isSelected
                                ? 'border-transparent text-white shadow-md'
                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 active:bg-slate-200',
                            ].join(' ')}
                            style={isSelected ? { backgroundColor: meta.hex } : {}}
                            aria-label={`Rate ${val}: ${LIKERT_LABELS[val]![lang]}`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected value confirmation label */}
                    <div className="min-h-[20px] text-center">
                      {selected !== undefined && (
                        <p
                          className="text-[12px] font-bold transition-all"
                          style={{ color: meta.hex }}
                        >
                          {LIKERT_LABELS[selected]![lang]}
                        </p>
                      )}
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

            {/* Dimension dots */}
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
                        ? DIMENSION[cat].hex
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
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-150 min-h-[48px] text-white shadow-md"
                style={{ backgroundColor: meta.hex }}
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