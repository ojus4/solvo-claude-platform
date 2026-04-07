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

type ModuleKey = 'personality' | 'interest' | 'aptitude' | 'eq';

interface ModuleCard {
  key: ModuleKey;
  label: string;
  icon: string;
  description: string;
  time: string;
  questions: number;
  href: string;
  doneKey: keyof AssessmentProgress;
}

// ─── Module Config ─────────────────────────────────────────────────────────────

const MODULES: ModuleCard[] = [
  {
    key: 'personality',
    label: 'Personality',
    icon: '🧠',
    description: 'Discover your Big Five personality traits (OCEAN)',
    time: '~10 minutes',
    questions: 50,
    href: '/test/personality',
    doneKey: 'personality_done',
  },
  {
    key: 'interest',
    label: 'Interests',
    icon: '🎯',
    description: 'Find out which careers match your natural interests',
    time: '~7 minutes',
    questions: 42,
    href: '/test/interest',
    doneKey: 'interest_done',
  },
  {
    key: 'aptitude',
    label: 'Aptitude',
    icon: '📊',
    description: 'Test your numerical, verbal and logical reasoning',
    time: '~15 minutes',
    questions: 30,
    href: '/test/aptitude',
    doneKey: 'aptitude_done',
  },
  {
    key: 'eq',
    label: 'Emotional Intelligence',
    icon: '❤️',
    description: 'Measure your EQ across 5 key dimensions',
    time: '~8 minutes',
    questions: 30,
    href: '/test/eq',
    doneKey: 'eq_done',
  },
];

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-xl bg-slate-800" />
        <div className="h-6 w-20 rounded-full bg-slate-800" />
      </div>
      <div className="h-5 w-32 rounded bg-slate-800 mb-2" />
      <div className="h-4 w-full rounded bg-slate-800 mb-1" />
      <div className="h-4 w-3/4 rounded bg-slate-800 mb-5" />
      <div className="flex gap-3 mb-5">
        <div className="h-4 w-20 rounded bg-slate-800" />
        <div className="h-4 w-24 rounded bg-slate-800" />
      </div>
      <div className="h-10 w-full rounded-xl bg-slate-800" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#080c14] px-4 py-10 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="h-8 w-64 rounded bg-slate-800 animate-pulse mb-3" />
        <div className="h-5 w-80 rounded bg-slate-800 animate-pulse mb-6" />
        <div className="h-3 w-full rounded-full bg-slate-800 animate-pulse mb-1" />
        <div className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
      </div>
      {/* Cards skeleton */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
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

        if (!res.ok) {
          throw new Error(`Unexpected status: ${res.status}`);
        }

        const data = await res.json();

        // Map API response fields to local progress shape.
        // The API may return an `assessment_session` object or flat fields —
        // adapt as needed to match the real response shape.
        const session = data?.session ?? data?.assessment_session ?? data ?? {};

        setProgress({
          personality_done: Boolean(session.personality_done),
          interest_done: Boolean(session.interest_done),
          aptitude_done: Boolean(session.aptitude_done),
          eq_done: Boolean(session.eq_done),
        });
      } catch (err) {
        console.error('[TestPage] Failed to fetch assessment progress:', err);
        // Treat fetch errors as "no progress yet" so the page still renders
        setProgress({
          personality_done: false,
          interest_done: false,
          aptitude_done: false,
          eq_done: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          {/* Icon ring */}
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
            🔒
          </div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Sign in to continue
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Please sign in to take the assessment and track your progress.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-semibold text-sm px-6 py-3 transition-colors duration-150"
          >
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  // ── Compute stats ────────────────────────────────────────────────────────────
  const doneCount = progress
    ? [
        progress.personality_done,
        progress.interest_done,
        progress.aptitude_done,
        progress.eq_done,
      ].filter(Boolean).length
    : 0;

  const allDone = doneCount === 4;
  const pct = (doneCount / 4) * 100;

  // ── Full render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Font — DM Serif Display */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div
        className="min-h-screen bg-[#080c14] px-4 py-10 sm:px-6 lg:px-8"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="max-w-4xl mx-auto">

          {/* ── All-done banner ─────────────────────────────────────────────── */}
          {allDone && (
            <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-emerald-300 font-semibold text-sm sm:text-base leading-snug">
                    All modules complete! Your career report is ready.
                  </p>
                  <p className="text-emerald-500/70 text-xs mt-0.5">
                    View your personalised results and recommended careers.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 transition-colors duration-150"
              >
                View My Results →
              </Link>
            </div>
          )}

          {/* ── Page header ─────────────────────────────────────────────────── */}
          <header className="mb-8">
            <h1
              className="text-3xl sm:text-4xl text-white mb-1.5"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Your Career Assessment
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mb-5">
              Complete all 4 modules to get your personalised career report
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-400 tabular-nums">
                <span className="text-amber-400 font-semibold">{doneCount}</span> of 4 modules complete
              </span>
            </div>
          </header>

          {/* ── Module cards grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {MODULES.map((mod) => {
              const isDone = progress ? progress[mod.doneKey] : false;

              return (
                <div
                  key={mod.key}
                  className={[
                    'group relative rounded-2xl border p-6 flex flex-col transition-all duration-200',
                    isDone
                      ? 'border-emerald-700/40 bg-gradient-to-br from-emerald-950/30 to-slate-900/60 hover:border-emerald-600/50'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80',
                  ].join(' ')}
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Icon */}
                    <div
                      className={[
                        'h-12 w-12 rounded-xl flex items-center justify-center text-2xl',
                        isDone ? 'bg-emerald-900/50' : 'bg-slate-800',
                      ].join(' ')}
                    >
                      {mod.icon}
                    </div>

                    {/* Status badge */}
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/40 bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400">
                        Complete ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                        Not Started
                      </span>
                    )}
                  </div>

                  {/* Module name */}
                  <h2
                    className="text-white font-semibold text-lg mb-1.5 leading-snug"
                    style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
                  >
                    {mod.label}
                  </h2>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                    {mod.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3.5 w-3.5 text-slate-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5V3.75Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {mod.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3.5 w-3.5 text-slate-600"
                      >
                        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v.5h1A1.5 1.5 0 0 1 13 5.5v7A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5v-7A1.5 1.5 0 0 1 4.5 4h1v-.5Zm1.5 0v.5h2v-.5a.5.5 0 0 0-.5-.5H7.5a.5.5 0 0 0-.5.5ZM5 5.5H4.5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H5Z" />
                      </svg>
                      {mod.questions} questions
                    </span>
                  </div>

                  {/* CTA button */}
                  <Link
                    href={mod.href}
                    className={[
                      'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150',
                      isDone
                        ? 'border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900',
                    ].join(' ')}
                  >
                    {isDone ? 'Retake' : 'Start'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* ── Footer note ─────────────────────────────────────────────────── */}
          <p className="mt-10 text-center text-xs text-slate-600">
            Your answers are private and used only to generate your personalised report.
          </p>
        </div>
      </div>
    </>
  );
}