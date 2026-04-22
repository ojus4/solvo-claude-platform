// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF EQ Page  (Page 5 of 8)
// components/pdf/EqPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { BRAND_COLORS, EQ_LABELS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface EqPageProps {
  data: PdfReportData
}

// ─── Constants ────────────────────────────────────────────────────────────────

type DimensionKey =
  | 'selfAwareness'
  | 'emotionalRegulation'
  | 'communication'
  | 'empathy'
  | 'adaptability'

const DIMENSION_KEYS: DimensionKey[] = [
  'selfAwareness',
  'emotionalRegulation',
  'communication',
  'empathy',
  'adaptability',
]

const DIMENSION_COLORS: Record<DimensionKey, string> = {
  selfAwareness:       '#6366F1',
  emotionalRegulation: '#3B82F6',
  communication:       '#8B5CF6',
  empathy:             '#10B981',
  adaptability:        '#F59E0B',
}

const DIMENSION_DESCRIPTIONS: Record<DimensionKey, string> = {
  selfAwareness:
    'Understanding your own emotions, strengths, weaknesses, and how your mood affects others around you.',
  emotionalRegulation:
    'Managing your emotions effectively under pressure, bouncing back from setbacks, and staying calm.',
  communication:
    'Expressing ideas clearly, influencing others, and confidently engaging in difficult conversations.',
  empathy:
    'Reading social cues, understanding others feelings, actively listening, and building strong relationships.',
  adaptability:
    'Adjusting to change, resolving conflicts, finding solutions proactively, and thriving in new situations.',
}

const DIMENSION_CAREERS: Record<DimensionKey, string[]> = {
  selfAwareness:       ['Leadership', 'Coaching', 'Consulting', 'Entrepreneurship', 'Management'],
  emotionalRegulation: ['Medicine', 'Law', 'Finance', 'Teaching', 'Emergency Services'],
  communication:       ['Marketing', 'Sales', 'PR', 'Politics', 'Content Creation'],
  empathy:             ['HR', 'Counselling', 'Social Work', 'Healthcare', 'Customer Success'],
  adaptability:        ['Startups', 'Consulting', 'Project Management', 'Product', 'Operations'],
}

const DIMENSION_TIPS: Record<DimensionKey, string[]> = {
  selfAwareness: [
    'Keep a daily emotion journal for 5 minutes each evening',
    'Ask trusted colleagues for honest feedback monthly',
    'Practice naming your emotions precisely before reacting',
  ],
  emotionalRegulation: [
    'Use the 5-second pause before responding when stressed',
    'Practice box breathing: 4 counts in, hold, out, hold',
    'Identify your top 3 emotional triggers and plan responses',
  ],
  communication: [
    'Join a public speaking group like Toastmasters',
    'Practice the STAR method for structured storytelling',
    'Record yourself speaking and review once a week',
  ],
  empathy: [
    'Practice active listening — summarise before responding',
    'Ask one genuine question about someone else daily',
    'Read fiction — it builds perspective-taking ability',
  ],
  adaptability: [
    'Deliberately try one new approach to a familiar task weekly',
    'Reframe setbacks as data — ask what you can learn',
    'Volunteer for projects outside your comfort zone',
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInterpretation(score: number): { label: string; color: string } {
  if (score >= 75) return { label: 'Strong',      color: '#059669' }
  if (score >= 50) return { label: 'Developing',  color: '#D97706' }
  return              { label: 'Needs Focus',  color: '#DC2626' }
}

function getOverallLevel(score: number): string {
  if (score >= 75) return 'High EQ'
  if (score >= 50) return 'Moderate EQ'
  return 'Developing EQ'
}

function getOverallDesc(score: number): string {
  if (score >= 75)
    return 'High EQ — You demonstrate strong emotional intelligence across most dimensions. You are likely effective in team settings, leadership roles, and client-facing work.'
  if (score >= 50)
    return 'Moderate EQ — You have a solid emotional foundation with specific areas to develop. Targeted practice in your lower dimensions will significantly boost your career effectiveness.'
  return 'Developing EQ — Emotional intelligence is a learnable skill. Focused effort on self-awareness and regulation will create meaningful improvement in your professional and personal relationships.'
}

function getLowestDimension(
  scores: Record<DimensionKey, number>,
): DimensionKey {
  return DIMENSION_KEYS.reduce((lowest, key) =>
    scores[key] < scores[lowest] ? key : lowest,
  )
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
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#6366F1',
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

  // ── Overall box ───────────────────────────────────────────────────────────
  overallBox: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#EEF2FF',
  },

  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overallScoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  overallScoreText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  overallInfo: {
    flex: 1,
  },

  overallLabel: {
    fontSize: 9,
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  overallLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  overallDesc: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginTop: 6,
    lineHeight: 1.5,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 9,
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },

  // ── Dimension row ─────────────────────────────────────────────────────────
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  dimensionLeft: {
    width: 160,
  },

  dimensionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  dimensionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
    marginTop: 2,
  },

  dimensionName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  dimensionDesc: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    lineHeight: 1.4,
  },

  dimensionRight: {
    flex: 1,
    paddingLeft: 16,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    marginRight: 10,
  },

  barFill: {
    height: 10,
    borderRadius: 5,
  },

  scoreText: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 36,
    textAlign: 'right',
  },

  interpBadge: {
    borderRadius: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 8,
    paddingRight: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },

  interpText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  careerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  careerTag: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 4,
    marginBottom: 3,
  },

  careerTagText: {
    fontSize: 7,
    color: BRAND_COLORS.muted,
  },

  // ── Development tips box ──────────────────────────────────────────────────
  developmentBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    padding: 14,
    marginTop: 16,
  },

  developmentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },

  developmentItem: {
    fontSize: 9,
    color: BRAND_COLORS.dark,
    lineHeight: 1.5,
    marginBottom: 3,
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

export function EqPage({ data }: EqPageProps) {
  const { eq } = data

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Emotional Intelligence</Text>
        <Text style={styles.pageNumber}>Page 5 of 8</Text>
      </View>

      {/* Null state */}
      {eq === null ? (
        <View style={styles.nullContainer}>
          <Text style={styles.nullText}>
            Emotional intelligence assessment not completed.
          </Text>
        </View>
      ) : (
        <>
          {/* Overall EQ score box */}
          {(() => {
            const overall = Math.min(100, Math.max(0, eq.overall))
            const level   = getOverallLevel(overall)
            const desc    = getOverallDesc(overall)

            return (
              <View style={styles.overallBox}>
                <View style={styles.overallRow}>
                  {/* Score circle */}
                  <View style={styles.overallScoreCircle}>
                    <Text style={styles.overallScoreText}>{overall}</Text>
                  </View>

                  {/* Info */}
                  <View style={styles.overallInfo}>
                    <Text style={styles.overallLabel}>Your EQ Level</Text>
                    <Text style={styles.overallLevel}>{level}</Text>
                    <Text style={styles.overallDesc}>{desc}</Text>
                  </View>
                </View>
              </View>
            )
          })()}

          {/* Section label */}
          <Text style={styles.sectionLabel}>Five EQ Dimensions</Text>

          {/* Five dimension rows — sorted descending by score */}
          {(() => {
            const scores: Record<DimensionKey, number> = {
              selfAwareness:       eq.selfAwareness,
              emotionalRegulation: eq.emotionalRegulation,
              communication:       eq.communication,
              empathy:             eq.empathy,
              adaptability:        eq.adaptability,
            }

            const sorted = [...DIMENSION_KEYS].sort(
              (a, b) => scores[b] - scores[a],
            )

            return sorted.map((key) => {
              const score   = Math.min(100, Math.max(0, scores[key]))
              const color   = DIMENSION_COLORS[key]
              const interp  = getInterpretation(score)
              const careers = DIMENSION_CAREERS[key].slice(0, 4)

              return (
                <View key={key} style={styles.dimensionRow}>
                  {/* Left column */}
                  <View style={styles.dimensionLeft}>
                    <View style={styles.dimensionNameRow}>
                      <View
                        style={[styles.dimensionDot, { backgroundColor: color }]}
                      />
                      <Text style={styles.dimensionName}>
                        {EQ_LABELS[key] ?? key}
                      </Text>
                    </View>
                    <Text style={styles.dimensionDesc}>
                      {DIMENSION_DESCRIPTIONS[key]}
                    </Text>
                  </View>

                  {/* Right column */}
                  <View style={styles.dimensionRight}>
                    {/* Bar + score */}
                    <View style={styles.barRow}>
                      <View style={styles.barBg}>
                        <View
                          style={[
                            styles.barFill,
                            { width: score + '%', backgroundColor: color },
                          ]}
                        />
                      </View>
                      <Text style={[styles.scoreText, { color: BRAND_COLORS.dark }]}>
                        {score}%
                      </Text>
                    </View>

                    {/* Interpretation badge */}
                    <View
                      style={[
                        styles.interpBadge,
                        { backgroundColor: interp.color },
                      ]}
                    >
                      <Text style={styles.interpText}>{interp.label}</Text>
                    </View>

                    {/* Career relevance tags */}
                    <View style={styles.careerTagsRow}>
                      {careers.map((career) => (
                        <View key={career} style={styles.careerTag}>
                          <Text style={styles.careerTagText}>{career}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )
            })
          })()}

          {/* Development tips box — lowest dimension */}
          {(() => {
            const scores: Record<DimensionKey, number> = {
              selfAwareness:       eq.selfAwareness,
              emotionalRegulation: eq.emotionalRegulation,
              communication:       eq.communication,
              empathy:             eq.empathy,
              adaptability:        eq.adaptability,
            }
            const lowest = getLowestDimension(scores)
            const tips   = DIMENSION_TIPS[lowest]

            return (
              <View style={styles.developmentBox}>
                <Text style={styles.developmentTitle}>
                  {'Focus area: ' + (EQ_LABELS[lowest] ?? lowest)}
                </Text>
                {tips.map((tip) => (
                  <Text key={tip} style={styles.developmentItem}>
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

export default EqPage