// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Aptitude Page  (Page 4 of 8)
// components/pdf/AptitudePage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { BRAND_COLORS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AptitudePageProps {
  data: PdfReportData
}

// ─── Constants ────────────────────────────────────────────────────────────────

type CategoryKey = 'Numerical' | 'Verbal' | 'Logical'

const CATEGORY_KEYS: CategoryKey[] = ['Numerical', 'Verbal', 'Logical']

const CATEGORY_COLORS: Record<CategoryKey, string> = {
  Numerical: '#3B82F6',
  Verbal:    '#8B5CF6',
  Logical:   '#F59E0B',
}

const CATEGORY_ICONS: Record<CategoryKey, string> = {
  Numerical: '123',
  Verbal:    'ABC',
  Logical:   '◆◆◆',
}

const CATEGORY_DESCRIPTIONS: Record<CategoryKey, string> = {
  Numerical:
    'Ability to work with numbers, ratios, percentages, and financial calculations. Critical for data, finance, and engineering roles.',
  Verbal:
    'Ability to understand language, vocabulary, grammar, and written communication. Essential for management, law, and content roles.',
  Logical:
    'Ability to identify patterns, sequences, and draw logical conclusions. Valuable across all technical and analytical careers.',
}

const CATEGORY_CAREERS: Record<CategoryKey, string[]> = {
  Numerical: ['Data Analyst', 'Financial Analyst', 'Engineer', 'Accountant', 'Economist'],
  Verbal:    ['Content Writer', 'HR Manager', 'Lawyer', 'Teacher', 'Marketing Manager'],
  Logical:   ['Software Engineer', 'Product Manager', 'Consultant', 'Researcher', 'UI/UX Designer'],
}

const CATEGORY_TIPS: Record<CategoryKey, string[]> = {
  Numerical: [
    'Practice percentage and ratio problems daily',
    'Use free resources like Khan Academy for arithmetic',
    'Consider careers less dependent on numerical analysis',
  ],
  Verbal: [
    'Read one article or chapter daily to build vocabulary',
    'Practice grammar exercises on apps like Duolingo',
    'Focus on roles where technical skills outweigh verbal',
  ],
  Logical: [
    'Solve one logic puzzle or pattern question daily',
    'Practice coding challenges on platforms like HackerRank',
    'Build logical thinking through strategy games',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInterpretation(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent',          color: '#059669' }
  if (score >= 60) return { label: 'Good',               color: '#3B82F6' }
  if (score >= 40) return { label: 'Average',            color: '#D97706' }
  return              { label: 'Needs Improvement',  color: '#DC2626' }
}

function getOverallSubtext(score: number): string {
  if (score >= 80)
    return 'You scored in the top tier. Strong analytical ability across all three areas.'
  if (score >= 60)
    return 'You have solid reasoning skills with clear strengths in specific areas.'
  if (score >= 40)
    return 'You have foundational aptitude with room to grow through targeted practice.'
  return 'Focus on building core reasoning skills — consistent practice will improve your scores significantly.'
}

function getLowestCategory(
  numerical: number,
  verbal: number,
  logical: number,
): CategoryKey {
  if (numerical <= verbal && numerical <= logical) return 'Numerical'
  if (verbal <= numerical && verbal <= logical) return 'Verbal'
  return 'Logical'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: '#FFFFFF',
  },

  // ── Page header ───────────────────────────────────────────────────────────
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F59E0B',
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  pageNumber: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
  },

  // ── Overall score box ─────────────────────────────────────────────────────
  overallScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_COLORS.dark,
    borderRadius: 10,
    padding: 24,
    marginBottom: 28,
  },

  overallLeft: {
    flex: 1,
  },

  overallLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  overallScore: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  overallSuffix: {
    fontSize: 20,
    color: '#9CA3AF',
  },

  overallRight: {
    flex: 1,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: '#374151',
  },

  overallInterpLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  overallInterp: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  overallSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 8,
    lineHeight: 1.5,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 9,
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },

  // ── Category card ─────────────────────────────────────────────────────────
  categoryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 16,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  categoryIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  categoryTitleCol: {
    flex: 1,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  categoryInterp: {
    fontSize: 10,
    marginTop: 3,
  },

  // ── Score bar ─────────────────────────────────────────────────────────────
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  scoreBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginRight: 12,
  },

  scoreBarFill: {
    height: 12,
    borderRadius: 6,
  },

  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    width: 44,
    textAlign: 'right',
  },

  // ── Category description + careers ────────────────────────────────────────
  categoryDesc: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  relevantCareersLabel: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  careerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },

  careerTag: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 4,
    marginBottom: 4,
  },

  careerTagText: {
    fontSize: 8,
    color: BRAND_COLORS.dark,
  },

  // ── Tips box ──────────────────────────────────────────────────────────────
  tipsBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 16,
    marginTop: 8,
  },

  tipsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
    marginBottom: 8,
  },

  tipItem: {
    fontSize: 9,
    color: BRAND_COLORS.dark,
    lineHeight: 1.5,
    marginBottom: 4,
  },

  // ── Null state ────────────────────────────────────────────────────────────
  nullContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },

  nullText: {
    fontSize: 13,
    color: BRAND_COLORS.muted,
    textAlign: 'center',
  },
})

// ─── Component ────────────────────────────────────────────────────────────────

export function AptitudePage({ data }: AptitudePageProps) {
  const { aptitude } = data

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Aptitude Assessment</Text>
        <Text style={styles.pageNumber}>Page 4 of 8</Text>
      </View>

      {/* Null state */}
      {aptitude === null ? (
        <View style={styles.nullContainer}>
          <Text style={styles.nullText}>
            Aptitude assessment not completed.
          </Text>
        </View>
      ) : (
        <>
          {/* Overall score box */}
          {(() => {
            const overall = Math.min(100, Math.max(0, aptitude.overall))
            const interp = getInterpretation(overall)
            const subtext = getOverallSubtext(overall)

            return (
              <View style={styles.overallScoreBox}>
                {/* Left — big score */}
                <View style={styles.overallLeft}>
                  <Text style={styles.overallLabel}>Overall Score</Text>
                  <Text style={styles.overallScore}>
                    {overall}
                    <Text style={styles.overallSuffix}>%</Text>
                  </Text>
                </View>

                {/* Right — interpretation + subtext */}
                <View style={styles.overallRight}>
                  <Text style={styles.overallInterpLabel}>Performance</Text>
                  <Text style={[styles.overallInterp, { color: interp.color }]}>
                    {interp.label}
                  </Text>
                  <Text style={styles.overallSubtext}>{subtext}</Text>
                </View>
              </View>
            )
          })()}

          {/* Section label */}
          <Text style={styles.sectionLabel}>Breakdown by Category</Text>

          {/* Three category cards */}
          {CATEGORY_KEYS.map((key) => {
            const raw = aptitude[key]
            const score = Math.min(100, Math.max(0, raw))
            const interp = getInterpretation(score)
            const color = CATEGORY_COLORS[key]

            return (
              <View key={key} style={styles.categoryCard}>
                {/* Header row */}
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIconBox, { backgroundColor: color }]}>
                    <Text style={styles.categoryIcon}>
                      {CATEGORY_ICONS[key]}
                    </Text>
                  </View>
                  <View style={styles.categoryTitleCol}>
                    <Text style={styles.categoryName}>{key}</Text>
                    <Text style={[styles.categoryInterp, { color: interp.color }]}>
                      {interp.label}
                    </Text>
                  </View>
                </View>

                {/* Score bar */}
                <View style={styles.scoreBarRow}>
                  <View style={styles.scoreBarBg}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: score + '%', backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreText}>{score}%</Text>
                </View>

                {/* Description */}
                <Text style={styles.categoryDesc}>
                  {CATEGORY_DESCRIPTIONS[key]}
                </Text>

                {/* Relevant careers */}
                <Text style={styles.relevantCareersLabel}>
                  Relevant Careers:
                </Text>
                <View style={styles.careerTagsRow}>
                  {CATEGORY_CAREERS[key].map((career) => (
                    <View key={career} style={styles.careerTag}>
                      <Text style={styles.careerTagText}>{career}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })}

          {/* Tips box — based on lowest scoring category */}
          {(() => {
            const lowest = getLowestCategory(
              aptitude.Numerical,
              aptitude.Verbal,
              aptitude.Logical,
            )
            const tips = CATEGORY_TIPS[lowest]

            return (
              <View style={styles.tipsBox}>
                <Text style={styles.tipsTitle}>How to improve</Text>
                {tips.map((tip) => (
                  <Text key={tip} style={styles.tipItem}>
                    {'• ' + tip}
                  </Text>
                ))}
              </View>
            )
          })()}
        </>
      )}

    </Page>
  )
}

export default AptitudePage