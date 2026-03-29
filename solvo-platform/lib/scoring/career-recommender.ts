// =============================================================================
// SOLVO — Career Recommendation Engine
// File: career-recommender.ts
// Path: lib/scoring/career-recommender.ts
// Purpose: Matrix matching algorithm combining all 3 assessment results
// =============================================================================

import { BigFiveScores } from './calculate-big-five';
import { RiasecScores } from './calculate-riasec';
import { AptitudeScores } from './calculate-aptitude';

export interface RecommendedCareer {
  id: string; // Must match the slug for the roadmap JSON (e.g., 'data_science')
  title: string;
  matchPercentage: number;
  description: string;
}

// Define the ideal profiles for our supported careers
const careerMatrix = [
  {
    id: 'data_science',
    title: 'Data Scientist',
    description: 'Analyze complex data to help organizations make better decisions.',
    idealHolland: ['I', 'C', 'R'], // Investigative, Conventional, Realistic
    idealBigFive: ['C', 'O'],      // High Conscientiousness, Openness
    keyAptitude: 'Numerical' as const
  },
  {
    id: 'software_engineering',
    title: 'Software Engineer',
    description: 'Design, develop, and test software systems and applications.',
    idealHolland: ['I', 'R', 'C'],
    idealBigFive: ['C', 'O'],
    keyAptitude: 'Logical' as const
  },
  {
    id: 'ui_ux',
    title: 'UI/UX Designer',
    description: 'Design user-friendly interfaces and improve user experiences.',
    idealHolland: ['A', 'I', 'E'],
    idealBigFive: ['O', 'E'],
    keyAptitude: 'Logical' as const
  },
  {
    id: 'digital_marketing',
    title: 'Digital Marketer',
    description: 'Promote brands and products across digital channels.',
    idealHolland: ['E', 'A', 'S'],
    idealBigFive: ['E', 'O'],
    keyAptitude: 'Verbal' as const
  },
  {
    id: 'finance',
    title: 'Financial Analyst',
    description: 'Evaluate financial data and investment opportunities.',
    idealHolland: ['C', 'E', 'I'],
    idealBigFive: ['C'],
    keyAptitude: 'Numerical' as const
  }
];

export function generateRecommendations(
  bigFive: BigFiveScores,
  riasec: RiasecScores,
  aptitude: AptitudeScores
): RecommendedCareer[] {
  const userHollandArray = riasec.hollandCode.split('');
  const userPrimaryTrait = bigFive.primaryTrait;

  const scoredCareers = careerMatrix.map(career => {
    let score = 0;
    // FIX: Removed unused 'const maxScore = 100;' to pass strict TypeScript linting

    // 1. RIASEC Match (Weight: 40%)
    // Check how many of the career's ideal Holland types match the user's top 3
    let hollandMatches = 0;
    career.idealHolland.forEach(type => {
      if (userHollandArray.includes(type)) hollandMatches += 1;
    });
    score += (hollandMatches / 3) * 40;

    // 2. Aptitude Match (Weight: 40%)
    // Heavily weight the specific aptitude required for the role
    const keyAptitudeScore = aptitude.categories[career.keyAptitude].percentage;
    score += (keyAptitudeScore / 100) * 40;

    // 3. Big Five Match (Weight: 20%)
    // Check if user's primary trait aligns with the career's ideal traits
    if (career.idealBigFive.includes(userPrimaryTrait)) {
      score += 20;
    } else {
      // Partial credit based on the raw percentage of their highest ideal trait
      const highestIdealPercentage = Math.max(
        ...career.idealBigFive.map(trait => bigFive.percentage[trait as keyof typeof bigFive.percentage])
      );
      score += (highestIdealPercentage / 100) * 10;
    }

    return {
      id: career.id,
      title: career.title,
      description: career.description,
      matchPercentage: Math.round(score)
    };
  });

  // Sort by highest match percentage and return the top 3
  return scoredCareers
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
}