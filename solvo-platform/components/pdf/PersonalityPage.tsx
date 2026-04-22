// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Personality Page  (Page 2 of 8)
// components/pdf/PersonalityPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import {
  BRAND_COLORS,
  TRAIT_LABELS,
  TRAIT_DESCRIPTIONS,
} from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PersonalityPageProps {
  data: PdfReportData
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRAIT_KEYS = ['O', 'C', 'E', 'A', 'N'] as const
type TraitKey = (typeof TRAIT_KEYS)[number]

/** Per-trait bar fill colours */
const TRAIT_BAR_COLORS: Record<TraitKey, string> = {
  O: '#8B5CF6',
  C: '#3B82F6',
  E: '#F59E0B',
  A: '#10B981',
  N: '#EF4444',
}

// ─── Interpretation helpers ───────────────────────────────────────────────────

function getInterpretation(key: TraitKey, score: number): string {
  const high = score >= 60
  const map: Record<TraitKey, { high: string; low: string }> = {
    O: {
      high: 'You are intellectually curious and open to new ideas. You enjoy exploring abstract concepts and creative thinking.',
      low: 'You prefer familiar routines and practical approaches. You value stability and concrete problem-solving.',
    },
    C: {
      high: 'You are highly organised, reliable, and goal-oriented. You follow through on commitments and plan ahead effectively.',
      low: 'You tend to be flexible and spontaneous. You adapt well to changing situations but may benefit from structure.',
    },
    E: {
      high: 'You are energised by social interaction and tend to be outgoing and assertive. You thrive in collaborative environments.',
      low: 'You recharge through solitude and tend to be reflective. You work well independently and think deeply before speaking.',
    },
    A: {
      high: 'You are empathetic, cooperative, and considerate of others. You build strong relationships and work well in teams.',
      low: 'You are direct, competitive, and prioritise results. You are not afraid to challenge others when you disagree.',
    },
    N: {
      high: 'You experience emotions intensely and may be sensitive to stress. You are self-aware and empathetic to others\' struggles.',
      low: 'You are emotionally stable and resilient under pressure. You remain calm in difficult situations and recover quickly.',
    },
  }
  return high ? map[key].high : map[key].low
}

/** Returns up to 2 strength strings derived from the top-scoring traits */
function getStrengths(scores: Record<TraitKey, number>): string[] {
  const strengths: string[] = []
  if (scores.O >= 60) strengths.push('Creative problem-solving', 'Intellectual curiosity')
  if (scores.C >= 60) strengths.push('Strong work ethic', 'Attention to detail')
  if (scores.E >= 60) strengths.push('Natural leadership', 'Team collaboration')
  if (scores.A >= 60) strengths.push('Conflict resolution', 'Building trust')
  if (scores.N < 60)  strengths.push('Performs well under pressure', 'Consistent and reliable')
  return strengths.slice(0, 3)
}

/** Returns up to 2 growth area strings derived from the lowest-scoring traits */
function getGrowthAreas(scores: Record<TraitKey, number>): string[] {
  const growth: string[] = []
  if (scores.O < 60) growth.push('Embracing new approaches', 'Creative thinking')
  if (scores.C < 60) growth.push('Time management', 'Goal setting')
  if (scores.E < 60) growth.push('Networking skills', 'Public speaking')
  if (scores.A < 60) growth.push('Active listening', 'Empathy building')
  if (scores.N >= 60) growth.push('Stress management', 'Emotional regulation')
  return growth.slice(0, 3)
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
    borderBottomColor: BRAND_COLORS.primary,
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

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 9,
    color: BRAND_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },

  // ── Primary trait box ─────────────────────────────────────────────────────
  primaryTraitBox: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
  },

  primaryTraitLabel: {
    fontSize: 10,
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  primaryTraitName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  primaryTraitDesc: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 8,
    lineHeight: 1.5,
  },

  // ── Trait bar rows ────────────────────────────────────────────────────────
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  traitLabelCol: {
    width: 140,
  },

  traitName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  traitDesc: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginTop: 2,
  },

  traitBarCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },

  traitBarBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
  },

  traitBarFill: {
    height: 10,
    borderRadius: 5,
  },

  traitScore: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    width: 36,
    textAlign: 'right',
  },

  // ── Interpretation box ────────────────────────────────────────────────────
  interpretationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 16,
    marginTop: 24,
  },

  interpretationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 8,
  },

  interpretationText: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    lineHeight: 1.6,
  },

  // ── Strengths + growth row ────────────────────────────────────────────────
  strengthsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  strengthBox: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    padding: 12,
  },

  strengthLabel: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  strengthItem: {
    fontSize: 10,
    color: BRAND_COLORS.dark,
    marginBottom: 3,
  },

  growthBox: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    padding: 12,
  },

  growthLabel: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  growthItem: {
    fontSize: 10,
    color: BRAND_COLORS.dark,
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

export function PersonalityPage({ data }: PersonalityPageProps) {
  const { personality } = data

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Personality Profile</Text>
        <Text style={styles.pageNumber}>Page 2 of 8</Text>
      </View>

      {/* Null state */}
      {personality === null ? (
        <View style={styles.nullContainer}>
          <Text style={styles.nullText}>
            Personality assessment not completed.
          </Text>
        </View>
      ) : (
        <>
          {/* Primary trait highlight box */}
          <View style={styles.primaryTraitBox}>
            <Text style={styles.primaryTraitLabel}>Your Dominant Trait</Text>
            <Text style={styles.primaryTraitName}>
              {TRAIT_LABELS[personality.primary_trait] ?? personality.primary_trait}
            </Text>
            <Text style={styles.primaryTraitDesc}>
              {TRAIT_DESCRIPTIONS[personality.primary_trait] ?? ''}
            </Text>
          </View>

          {/* Section label */}
          <Text style={styles.sectionLabel}>All Five Traits</Text>

          {/* Five trait bars */}
          {TRAIT_KEYS.map((key) => {
            const score = personality[key]
            const clampedScore = Math.min(100, Math.max(0, score))
            return (
              <View key={key} style={styles.traitRow}>
                {/* Label column */}
                <View style={styles.traitLabelCol}>
                  <Text style={styles.traitName}>{TRAIT_LABELS[key]}</Text>
                  <Text style={styles.traitDesc}>{TRAIT_DESCRIPTIONS[key]}</Text>
                </View>

                {/* Bar column */}
                <View style={styles.traitBarCol}>
                  <View style={styles.traitBarBg}>
                    <View
                      style={[
                        styles.traitBarFill,
                        {
                          width: clampedScore + '%',
                          backgroundColor: TRAIT_BAR_COLORS[key],
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Score */}
                <Text style={styles.traitScore}>{clampedScore}%</Text>
              </View>
            )
          })}

          {/* Interpretation box */}
          {(() => {
            // Find primary + secondary trait keys by score
            const sorted = [...TRAIT_KEYS].sort(
              (a, b) => personality[b] - personality[a],
            )
            const primary = sorted[0]!
            const secondary = sorted[1]!
            const text =
              getInterpretation(primary, personality[primary]) +
              ' ' +
              getInterpretation(secondary, personality[secondary])

            return (
              <View style={styles.interpretationBox}>
                <Text style={styles.interpretationTitle}>
                  What this means for your career
                </Text>
                <Text style={styles.interpretationText}>{text}</Text>
              </View>
            )
          })()}

          {/* Strengths + growth row */}
          {(() => {
            const scores = {
              O: personality.O,
              C: personality.C,
              E: personality.E,
              A: personality.A,
              N: personality.N,
            }
            const strengths = getStrengths(scores)
            const growth = getGrowthAreas(scores)

            return (
              <View style={styles.strengthsRow}>
                {/* Strengths */}
                <View style={styles.strengthBox}>
                  <Text style={styles.strengthLabel}>Key Strengths</Text>
                  {strengths.map((item) => (
                    <Text key={item} style={styles.strengthItem}>
                      {'• ' + item}
                    </Text>
                  ))}
                </View>

                {/* Growth areas */}
                <View style={styles.growthBox}>
                  <Text style={styles.growthLabel}>Growth Areas</Text>
                  {growth.map((item) => (
                    <Text key={item} style={styles.growthItem}>
                      {'• ' + item}
                    </Text>
                  ))}
                </View>
              </View>
            )
          })()}
        </>
      )}

    </Page>
  )
}

export default PersonalityPage