// =============================================================================
// SOLVO — RIASEC Scoring Algorithm
// File: calculate-riasec.ts
// Path: lib/scoring/calculate-riasec.ts
// Purpose: Server-side calculation of Holland Code from agree/disagree inputs
// =============================================================================

import { interestQuestions, RiasecType } from './interest-questions';

// Answers should be true (Agree) or false (Disagree)
export type RiasecAnswers = Record<string, boolean>;

export interface RiasecScores {
  counts: Record<RiasecType, number>;
  hollandCode: string; // Top 3 letters, e.g., "AES"
}

export function calculateRiasec(answers: RiasecAnswers): RiasecScores {
  const counts: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  interestQuestions.forEach((q) => {
    if (answers[q.id] === true) {
      counts[q.type] += 1;
    }
  });

  // Sort types by count descending to generate the 3-letter Holland Code
  const sortedTypes = (Object.keys(counts) as RiasecType[]).sort((a, b) => {
    // Primary sort: count descending
    if (counts[b] !== counts[a]) {
      return counts[b] - counts[a];
    }
    // Secondary sort: alphabetical to ensure stable sorting on ties
    return a.localeCompare(b);
  });

  // Extract the top 3 types
  const hollandCode = sortedTypes.slice(0, 3).join('');

  return { counts, hollandCode };
}