// =============================================================================
// SOLVO — Aptitude Scoring Algorithm
// File: calculate-aptitude.ts
// Path: lib/scoring/calculate-aptitude.ts
// Purpose: Server-side calculation of aptitude scores by category
// =============================================================================

import { aptitudeQuestions, AptitudeCategory } from './aptitude-questions';

// Answers should be the index of the selected option (0, 1, 2, or 3)
export type AptitudeAnswers = Record<string, number>;

export interface CategoryScore {
  score: number;
  total: number;
  percentage: number;
}

export interface AptitudeScores {
  categories: Record<AptitudeCategory, CategoryScore>;
  totalScore: number;
  maxPossible: number;
  overallPercentage: number;
}

export function calculateAptitude(answers: AptitudeAnswers): AptitudeScores {
  const categories: Record<AptitudeCategory, CategoryScore> = {
    Numerical: { score: 0, total: 10, percentage: 0 },
    Verbal: { score: 0, total: 10, percentage: 0 },
    Logical: { score: 0, total: 10, percentage: 0 }
  };

  let totalScore = 0;
  const maxPossible = aptitudeQuestions.length; // 30

  aptitudeQuestions.forEach((q) => {
    const userAnswer = answers[q.id];
    
    // Only score if the user provided an answer and it matches the correct index
    if (userAnswer !== undefined && userAnswer === q.correctIndex) {
      categories[q.category].score += 1;
      totalScore += 1;
    }
  });

  // Calculate percentages
  categories.Numerical.percentage = Math.round((categories.Numerical.score / categories.Numerical.total) * 100);
  categories.Verbal.percentage = Math.round((categories.Verbal.score / categories.Verbal.total) * 100);
  categories.Logical.percentage = Math.round((categories.Logical.score / categories.Logical.total) * 100);

  const overallPercentage = Math.round((totalScore / maxPossible) * 100);

  return {
    categories,
    totalScore,
    maxPossible,
    overallPercentage
  };
}