'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentProgress {
  personality_done: boolean;
  interest_done: boolean;
  aptitude_done: boolean;
  eq_done: boolean;
}

type BrandColor = 'yellow' | 'red' | 'blue' | 'green';

interface ModuleCard {
  key: string;
  label: string;
  icon: string;
  description: string;
  time: string;
  questions: number;
  href: string;
  doneKey: keyof AssessmentProgress;
  color: BrandColor;
}

// ─── Brand Color Map ──────────────────────────────────────────────────────────
// Each module is assigned one of SOLVO's four brand colors,
// mirroring the quad-logo used across the platform.

const COLOR_MAP: Record<
  BrandColor,
  {
    iconBg: string;
    badge: string;
    badgeText: string;
    btn: string;
    btnText: string;
    borderLeft: string;
    tagBg: string;
    tagText: string;
    dotHex: string;
  }
> = {
  yellow: {
    iconBg: 'bg-yellow-50',
    badge: 'bg-yellow-50 border-yellow-200',
    badgeText: 'text-yellow-700',
    btn: 'bg-[#FFCC00] hover:bg-yellow-400 active:bg-yellow-500 shadow-yellow-100',
    btnText: 'text-slate-900',
    borderLeft: 'border-l-[#FFCC00]',
    tagBg: 'bg-yellow-50',
    tagText: 'text-yellow-700',
    dotHex: '#FFCC00',
  },
  red: {
    iconBg: 'bg-red-50',
    badge: 'bg-red-50 border-red-200',
    badgeText: 'text-red-700',
    btn: 'bg-[#FF3B30] hover:bg-red-600 active:bg-red-700 shadow-red-100',
    btnText: 'text-white',
    borderLeft: 'border-l-[#FF3B30]',
    tagBg: 'bg-red-50',
    tagText: 'text-red-700',
    dotHex: '#FF3B30',
  },
  blue: {
    iconBg: 'bg-blue-50',
    badge: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700',
    btn: 'bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 shadow-blue-100',
    btnText: 'text-white',
    borderLeft: 'border-l-[#007AFF]',
    tagBg: 'bg-blue-50',
    tagText: 'text-blue-700',
    dotHex: '#007AFF',
  },
  green: {
    iconBg: 'bg-green-50',
    badge: 'bg-green-50 border-green-200',
    badgeText: 'text-green-700',
    btn: 'bg-[#34C759] hover:bg-green-600 active:bg-green-700 shadow-green-100',
    btnText: 'text-white',
    borderLeft: 'border-l-[#34C759]',
    tagBg: 'bg-green-50',
    tagText: 'text-green-700',
    dotHex: '#34C759',
  },
};

// ─── Module Config ─────────────────────────────────────────────────────────────

const MODULES: ModuleCard[] = [
  {
    key: 'personality',
    label: 'Personality',
    icon: '🧠',
    description: 'Discover your Big Five personality traits (OCEAN)',
    time: '~10 min',
    questions: 50,
    href: '/test/personality',
    doneKey: 'personality_done',
    color: 'yellow',
  },
  {
    key: 'interest',
    label: 'Interests',
    icon: '🎯',
    description: 'Find out which careers match your natural interests',
    time: '~7 min',
    questions: 42,
    href: '/test/interest',
    doneKey: 'interest_done',
    color: 'red',
  },
  {
    key: 'aptitude',
    label: 'Aptitude',
    icon: '📊',
    description: 'Test your numerical, verbal and logical reasoning',
    time: '~15 min',
    questions: 30,
    href: '/test/aptitude',
    doneKey: 'aptitude_done',
    color: 'blue',
  },
  {
    key: 'eq',
    label: 'Emotional Intelligence',
    icon: '❤️',
    description: 'Measure your EQ across 5 key dimensions',
    time: '~8 min',
    questions: 30,
    href: '/test/eq',
    doneKey: 'eq_done',
    color: 'green',
  },
];

// ─── Micro-icons (inline SVG, zero deps) ─────────────────────────────────────

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0">
      <path d="M3 5h10M3 8h7M3 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightSmall() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckSmall() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0">
      <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SOLVO Brand Mark (2×2 quad color squares) ───────────────────────────────

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

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="h-12 w-12 rounded-xl bg-slate-100" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="h-5 w-32 rounded bg-slate-100 mb-2" />
      <div className="h-4 w-full rounded bg-slate-100 mb-1" />
      <div className="h-4 w-3/4 rounded bg-slate-100 mb-5" />
      <div className="flex gap-2 mb-5">
        <div className="h-6 w-20 rounded-full bg-slate-100" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="h-10 w-full rounded-xl bg-slate-100" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 animate-pulse">
          <div className="h-5 w-5 rounded bg-slate-200" />
          <div className="h-4 w-28 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-72 rounded-lg bg-slate-200 animate-pulse mb-2" />
        <div className="h-5 w-80 rounded bg-slate-200 animate-pulse mb-6" />
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse mb-8">
          <div className="h-2 w-full rounded-full bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TestPage() {
  const [progress, setProgress] = useState<AssessmentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/psychometric/results', {
          method: 'GET',
          credentials: 'include',
        });

        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();
        const session = data?.session ?? data?.assessment_session ?? data ?? {};

        setProgress({
          personality_done: Boolean(session.personality_done),
          interest_done:    Boolean(session.interest_done),
          aptitude_done:    Boolean(session.aptitude_done),
          eq_done:          Boolean(session.eq_done),
        });
      } catch (err) {
        console.error('[TestPage] fetch error:', err);
        setProgress({ personality_done: false, interest_done: false, aptitude_done: false, eq_done: false });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) return <PageSkeleton />;

  // ── Unauthorized ─────────────────────────────────────────────────────────────
  if (unauthorized) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
        <div
          className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-6"
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-sm w-full">
            <div className="mx-auto mb-5 w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
              🔒
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <BrandMark />
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">SOLVO</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Please sign in to take the assessment and track your progress.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#007AFF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-sm px-6 py-3 transition-colors shadow-md shadow-blue-100"
            >
              Sign In <ArrowRightSmall />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const doneCount = progress
    ? [progress.personality_done, progress.interest_done, progress.aptitude_done, progress.eq_done].filter(Boolean).length
    : 0;

  const allDone  = doneCount === 4;
  const pct      = (doneCount / 4) * 100;
  const brandDots: string[] = ['#FF3B30', '#007AFF', '#FFCC00', '#34C759'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* Staggered card entrance — pure CSS, works perfectly on mobile */
        .solvo-fade {
          animation: solvoUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .solvo-fade-0 { animation-delay: 0.00s; }
        .solvo-fade-1 { animation-delay: 0.07s; }
        .solvo-fade-2 { animation-delay: 0.14s; }
        .solvo-fade-3 { animation-delay: 0.21s; }
        .solvo-fade-4 { animation-delay: 0.28s; }
        .solvo-fade-5 { animation-delay: 0.35s; }

        @keyframes solvoUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div
        className="min-h-screen bg-[#F2F2F7] px-4 py-10 sm:px-6 lg:px-8"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <div className="max-w-4xl mx-auto">

          {/* ── Brand breadcrumb ─────────────────────────────────────────────── */}
          <div className="solvo-fade solvo-fade-0 flex items-center gap-2 mb-7">
            <BrandMark />
            <span className="font-extrabold text-slate-900 text-[15px] tracking-tight">SOLVO</span>
            <span className="text-slate-300 text-sm select-none">/</span>
            <span className="text-sm font-medium text-slate-500">Assessment</span>
          </div>

          {/* ── All-done banner ──────────────────────────────────────────────── */}
          {allDone && (
            <div className="solvo-fade solvo-fade-1 mb-6 bg-white border border-green-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                  🎉
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    All modules complete! Your career report is ready.
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    View your personalised results and recommended careers.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#34C759] hover:bg-green-600 active:bg-green-700 text-white font-bold text-sm px-5 py-2.5 transition-colors shadow-sm shadow-green-100"
              >
                View My Results <ArrowRightSmall />
              </Link>
            </div>
          )}

          {/* ── Page header ──────────────────────────────────────────────────── */}
          <header className="solvo-fade solvo-fade-1 mb-7">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1.5">
              Your Career Assessment
            </h1>
            <p className="text-slate-500 text-sm sm:text-[15px] mb-6">
              Complete all 4 modules to get your personalised career report
            </p>

            {/* Progress tracker card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-4 flex items-center gap-4">
              {/* Quad dots — fill in as modules complete */}
              <div className="grid grid-cols-2 gap-[3px] flex-shrink-0">
                {brandDots.map((hex, i) => (
                  <div
                    key={i}
                    className="rounded-[2px] transition-opacity duration-500"
                    style={{ width: 9, height: 9, backgroundColor: hex, opacity: i < doneCount ? 1 : 0.18 }}
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    <span style={{ color: '#007AFF' }}>{doneCount}</span>{' '}
                    <span className="text-slate-400 font-medium">of 4 modules complete</span>
                  </span>
                </div>
                {/* Segmented bar matching brand colors */}
                <div className="flex gap-1 h-2">
                  {brandDots.map((hex, i) => (
                    <div key={i} className="flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: i < doneCount ? '100%' : '0%', backgroundColor: hex }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>

          {/* ── Module cards grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map((mod, idx) => {
              const isDone = progress ? progress[mod.doneKey] : false;
              const c      = COLOR_MAP[mod.color];

              return (
                <div
                  key={mod.key}
                  className={[
                    `solvo-fade solvo-fade-${idx + 2}`,
                    'bg-white rounded-2xl border border-slate-200 border-l-[3px] shadow-sm',
                    'transition-shadow duration-200 hover:shadow-md',
                    c.borderLeft,
                  ].join(' ')}
                >
                  <div className="p-6">

                    {/* Icon + badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${c.iconBg}`}>
                        {mod.icon}
                      </div>

                      {isDone ? (
                        <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-bold ${c.badge} ${c.badgeText}`}>
                          <CheckSmall /> Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                          Not Started
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-[15px] font-bold text-slate-900 mb-1 leading-snug">
                      {mod.label}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      {mod.description}
                    </p>

                    {/* Meta tags */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.tagBg} ${c.tagText}`}>
                        <ClockIcon /> {mod.time}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${c.tagBg} ${c.tagText}`}>
                        <ListIcon /> {mod.questions} questions
                      </span>
                    </div>

                    {/* Action button */}
                    <Link
                      href={mod.href}
                      className={[
                        'inline-flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5',
                        'text-sm font-bold transition-all duration-150',
                        isDone
                          ? 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700'
                          : `${c.btn} ${c.btnText} shadow-md`,
                      ].join(' ')}
                    >
                      {isDone ? 'Retake' : 'Start'} <ArrowRightSmall />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer note ──────────────────────────────────────────────────── */}
          <p className="mt-10 text-center text-xs text-slate-400">
            Your answers are private and only used to generate your personalised career report.
          </p>

        </div>
      </div>
    </>
  );
}