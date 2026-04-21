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

/** Ordered display sequence for the five OCEAN traits */
const TRAIT_KEYS = ['O', 'C', 'E', 'A', 'N'] as const
type TraitKey = (typeof TRAIT_KEYS)[number]

/**
 * Score band labels and colours.
 * 0–39 → Low, 40–69 → Moderate, 70–100 → High
 */
function scoreBand(score: number): { label: string; color: string } {
  if (score >= 70) return { label: 'High', color: BRAND_COLORS.success }
  if (score >= 40) return { label: 'Moderate', color: BRAND_COLORS.warning }
  return { label: 'Low', color: BRAND_COLORS.secondary }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
  },

  // ── Header strip ──────────────────────────────────────────────────────────
  headerStrip: {
    width: '100%',
    height: 90,
    backgroundColor: BRAND_COLORS.primary,
    paddingTop: 28,
    paddingRight: 48,
    paddingBottom: 0,
    paddingLeft: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  headerLeft: {
    flexDirection: 'column',
  },

  pageLabel: {
    fontSize: 9,
    color: '#93C5FD',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  pageTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  pageNumber: {
    fontSize: 11,
    color: '#93C5FD',
    letterSpacing: 1,
  },

  // ── Content area ──────────────────────────────────────────────────────────
  contentArea: {
    padding: 48,
  },

  // ── Null / not-completed state ────────────────────────────────────────────
  notCompletedBox: {
    marginTop: 40,
    padding: 32,
    backgroundColor: BRAND_COLORS.lightBg,
    borderRadius: 6,
    alignItems: 'center',
  },

  notCompletedText: {
    fontSize: 13,
    color: BRAND_COLORS.muted,
    textAlign: 'center',
  },

  // ── Primary trait highlight card ──────────────────────────────────────────
  primaryCard: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 6,
    padding: 24,
    marginBottom: 32,
  },

  primaryCardLabel: {
    fontSize: 9,
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },

  primaryCardTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  primaryCardInitial: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 16,
  },

  primaryCardName: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  primaryCardDesc: {
    fontSize: 11,
    color: '#93C5FD',
    lineHeight: 1.5,
  },

  // ── Section heading ───────────────────────────────────────────────────────
  sectionHeading: {
    fontSize: 12,
    color: BRAND_COLORS.dark,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },

  // ── Trait bar row ─────────────────────────────────────────────────────────
  traitRow: {
    marginBottom: 22,
  },

  traitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 5,
  },

  traitNameBlock: {
    flexDirection: 'column',
  },

  traitInitialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  traitInitialBadge: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: BRAND_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  traitInitialText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  traitName: {
    fontSize: 12,
    color: BRAND_COLORS.dark,
    fontWeight: 'bold',
  },

  traitDesc: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginLeft: 24,
  },

  traitScoreBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  traitScoreValue: {
    fontSize: 18,
    color: BRAND_COLORS.dark,
    fontWeight: 'bold',
    lineHeight: 1,
  },

  traitScoreBand: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Bar track + fill
  barTrack: {
    height: 8,
    backgroundColor: BRAND_COLORS.lightBg,
    borderRadius: 4,
    width: '100%',
  },

  // barFill width is set inline via score
  barFill: {
    height: 8,
    borderRadius: 4,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 28,
  },

  // ── Score legend ──────────────────────────────────────────────────────────
  legendRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  legendLabel: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },

  // ── Footer strip ──────────────────────────────────────────────────────────
  footerStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: BRAND_COLORS.secondary,
  },
})

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single OCEAN trait row with name, description, score, and filled bar */
function TraitBar({
  traitKey,
  score,
  isPrimary,
}: {
  traitKey: TraitKey
  score: number
  isPrimary: boolean
}) {
  const band = scoreBand(score)
  const barColor = isPrimary ? BRAND_COLORS.primary : BRAND_COLORS.muted
  // Clamp score to 0–100 for bar width safety
  const clampedScore = Math.min(100, Math.max(0, score))

  return (
    <View style={styles.traitRow}>
      {/* Top row — name + score */}
      <View style={styles.traitTopRow}>
        <View style={styles.traitNameBlock}>
          {/* Initial badge + trait name */}
          <View style={styles.traitInitialRow}>
            <View
              style={[
                styles.traitInitialBadge,
                {
                  backgroundColor: isPrimary
                    ? BRAND_COLORS.primary
                    : BRAND_COLORS.muted,
                },
              ]}
            >
              <Text style={styles.traitInitialText}>{traitKey}</Text>
            </View>
            <Text style={styles.traitName}>{TRAIT_LABELS[traitKey]}</Text>
          </View>
          {/* Description below name */}
          <Text style={styles.traitDesc}>
            {TRAIT_DESCRIPTIONS[traitKey]}
          </Text>
        </View>

        {/* Score + band label */}
        <View style={styles.traitScoreBlock}>
          <Text style={styles.traitScoreValue}>{clampedScore}</Text>
          <Text style={[styles.traitScoreBand, { color: band.color }]}>
            {band.label}
          </Text>
        </View>
      </View>

      {/* Bar track + fill */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${clampedScore}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PersonalityPage({ data }: PersonalityPageProps) {
  const { personality } = data

  return (
    <Page size="A4" style={styles.page}>

      {/* 1 — Blue header strip */}
      <View style={styles.headerStrip}>
        <View style={styles.headerLeft}>
          <Text style={styles.pageLabel}>Section 01</Text>
          <Text style={styles.pageTitle}>Personality Profile</Text>
        </View>
        <Text style={styles.pageNumber}>2 / 8</Text>
      </View>

      {/* 2 — Content area */}
      <View style={styles.contentArea}>

        {/* Null state — module not completed */}
        {personality === null ? (
          <View style={styles.notCompletedBox}>
            <Text style={styles.notCompletedText}>
              The Personality assessment has not been completed yet.{'\n'}
              Complete the module on SOLVO to unlock this section.
            </Text>
          </View>
        ) : (
          <>
            {/* Primary trait highlight card */}
            <View style={styles.primaryCard}>
              <Text style={styles.primaryCardLabel}>Your Primary Trait</Text>
              <View style={styles.primaryCardTraitRow}>
                <Text style={styles.primaryCardInitial}>
                  {personality.primary_trait}
                </Text>
                <Text style={styles.primaryCardName}>
                  {TRAIT_LABELS[personality.primary_trait] ??
                    personality.primary_trait}
                </Text>
              </View>
              <Text style={styles.primaryCardDesc}>
                {TRAIT_DESCRIPTIONS[personality.primary_trait] ?? ''}
              </Text>
            </View>

            {/* Section heading */}
            <Text style={styles.sectionHeading}>Your OCEAN Scores</Text>

            {/* Five trait bars */}
            {TRAIT_KEYS.map((key, index) => (
              <View key={key}>
                <TraitBar
                  traitKey={key}
                  score={personality[key]}
                  isPrimary={key === personality.primary_trait}
                />
                {/* Divider between bars, not after the last one */}
                {index < TRAIT_KEYS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}

            {/* Score band legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: BRAND_COLORS.success },
                  ]}
                />
                <Text style={styles.legendLabel}>High (70–100)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: BRAND_COLORS.warning },
                  ]}
                />
                <Text style={styles.legendLabel}>Moderate (40–69)</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: BRAND_COLORS.secondary },
                  ]}
                />
                <Text style={styles.legendLabel}>Low (0–39)</Text>
              </View>
            </View>
          </>
        )}

      </View>

      {/* 3 — Orange footer strip (absolute) */}
      <View style={styles.footerStrip} />

    </Page>
  )
}

export default PersonalityPage