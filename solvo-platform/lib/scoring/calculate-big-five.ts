// =============================================================================
// SOLVO — Big Five Scoring Algorithm
// File: calculate-big-five.ts
// Path: lib/scoring/calculate-big-five.ts
// Purpose: Server-side calculation of OCEAN traits with polarity reversal
// =============================================================================

import { personalityQuestions, BigFiveTrait } from './personality-questions';

// Answers should be 1-5 (Strongly Disagree to Strongly Agree)
export type BigFiveAnswers = Record<string, number>;

export interface BigFiveScores {
  raw: Record<BigFiveTrait, number>;
  percentage: Record<BigFiveTrait, number>;
  primaryTrait: BigFiveTrait;
}

export function calculateBigFive(answers: BigFiveAnswers): BigFiveScores {
  const rawScores: Record<BigFiveTrait, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  const maxRawPerTrait = 50; // 10 questions * 5 max points
  
  personalityQuestions.forEach((q) => {
    const answer = answers[q.id];
    // Default to neutral (3) if missing, though client validation should prevent this
    const safeAnswer = answer !== undefined ? answer : 3; 

    // Polarity handling: If -1, reverse the score (e.g., 5 becomes 1, 4 becomes 2)
    const score = q.polarity === 1 ? safeAnswer : (6 - safeAnswer);
    rawScores[q.trait] += score;
  });

  const percentage: Record<BigFiveTrait, number> = {
    O: Math.round((rawScores.O / maxRawPerTrait) * 100),
    C: Math.round((rawScores.C / maxRawPerTrait) * 100),
    E: Math.round((rawScores.E / maxRawPerTrait) * 100),
    A: Math.round((rawScores.A / maxRawPerTrait) * 100),
    N: Math.round((rawScores.N / maxRawPerTrait) * 100),
  };

  // Identify primary trait (highest score)
  let primaryTrait: BigFiveTrait = 'O';
  let maxScore = -1;
  
  (Object.keys(rawScores) as BigFiveTrait[]).forEach((trait) => {
    if (rawScores[trait] > maxScore) {
      maxScore = rawScores[trait];
      primaryTrait = trait;
    }
  });

  return { raw: rawScores, percentage, primaryTrait };
}