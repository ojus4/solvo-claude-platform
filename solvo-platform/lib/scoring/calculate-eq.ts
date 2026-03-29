// =============================================================================
// SOLVO — EQ & Soft Skills Scoring Algorithm
// File: calculate-eq.ts
// Path: lib/scoring/calculate-eq.ts
// Purpose: Server-side calculation of EQ sub-dimensions and overall score
// =============================================================================

import { eqQuestions, EqCategory } from './eq-questions';

// Answers must be 1-5 (Strongly Disagree to Strongly Agree)
export type EqAnswers = Record<string, number>;

export interface EqScores {
  overallEqScore: number; // 0-100
  categories: {
    selfAwareness: number; // 0-100
    emotionalRegulation: number; // 0-100
    communication: number; // 0-100
    empathy: number; // 0-100
    adaptability: number; // 0-100
  };
}

export function calculateEq(answers: EqAnswers): EqScores {
  const rawScores: Record<EqCategory, number> = { SA: 0, ER: 0, CI: 0, EI: 0, AD: 0 };

  // 1 & 2. Standardize Inputs & Apply Reverse Scoring
  eqQuestions.forEach((q) => {
    const answer = answers[q.id];
    const safeAnswer = answer !== undefined ? answer : 3; // Default to neutral if missing

    // Reverse scoring for negative items (e.g., 5 becomes 1)
    const score = q.polarity === 1 ? safeAnswer : (6 - safeAnswer);
    rawScores[q.category] += score;
  });

  // 3 & 4. Calculate Category Raw Scores & Convert to Percentages
  // Formula: ((Raw - Min) / Range) * 100 --> ((Raw - 6) / 24) * 100
  const calcPercentage = (raw: number) => Math.round(((raw - 6) / 24) * 100);

  const selfAwareness = calcPercentage(rawScores.SA);
  const emotionalRegulation = calcPercentage(rawScores.ER);
  const communication = calcPercentage(rawScores.CI);
  const empathy = calcPercentage(rawScores.EI);
  const adaptability = calcPercentage(rawScores.AD);

  // 5. Calculate Overall EQ Score
  const overallEqScore = Math.round(
    (selfAwareness + emotionalRegulation + communication + empathy + adaptability) / 5
  );

  return {
    overallEqScore,
    categories: {
      selfAwareness,
      emotionalRegulation,
      communication,
      empathy,
      adaptability
    }
  };
}