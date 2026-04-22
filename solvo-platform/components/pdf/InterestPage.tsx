// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Interest Page  (Page 3 of 8)
// components/pdf/InterestPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import {
  BRAND_COLORS,
  RIASEC_LABELS,
  RIASEC_DESCRIPTIONS,
} from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface InterestPageProps {
  data: PdfReportData
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RIASEC_KEYS = ['R', 'I', 'A', 'S', 'E', 'C'] as const
type RiasecKey = (typeof RIASEC_KEYS)[number]

const RIASEC_COLORS: Record<RiasecKey, string> = {
  R: '#F97316',
  I: '#3B82F6',
  A: '#8B5CF6',
  S: '#10B981',
  E: '#EF4444',
  C: '#EAB308',
}

const RIASEC_CAREERS: Record<RiasecKey, string[]> = {
  R: ['Civil Engineer', 'Electrician', 'Mechanic', 'Pilot', 'Chef'],
  I: ['Data Scientist', 'Research Analyst', 'Doctor', 'Chemist', 'Economist'],
  A: ['UI/UX Designer', 'Content Writer', 'Filmmaker', 'Architect', 'Musician'],
  S: ['HR Manager', 'Teacher', 'Counsellor', 'Social Worker', 'Nurse'],
  E: ['Entrepreneur', 'Sales Manager', 'Marketing Head', 'Lawyer', 'CEO'],
  C: ['Financial Analyst', 'Accountant', 'Data Analyst', 'Auditor', 'Administrator'],
}

const RIASEC_ENVIRONMENT: Record<RiasecKey, string> = {
  R: 'Hands-on, outdoor, or technical work environments',
  I: 'Research labs, universities, or analytical workplaces',
  A: 'Creative studios, agencies, or flexible environments',
  S: 'Schools, hospitals, NGOs, or community organisations',
  E: 'Corporate offices, startups, or sales environments',
  C: 'Banks, finance firms, or structured corporate settings',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns first 6 words of a description string */
function shortDesc(desc: string): string {
  return desc.split(' ').slice(0, 6).join(' ') + '…'
}

/** Splits a Holland code into an array of letter strings */
function splitCode(code: string): string[] {
  return code.toUpperCase().split('')
}

/** Merges career arrays for top 2 types, deduplicates, caps at 8 */
function mergedCareers(top2: RiasecKey[]): string[] {
  const merged: string[] = []
  for (const key of top2) {
    for (const career of RIASEC_CAREERS[key]) {
      if (!merged.includes(career)) merged.push(career)
    }
  }
  return merged.slice(0, 8)
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
    borderBottomColor: BRAND_COLORS.secondary,
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

  // ── Holland code display ──────────────────────────────────────────────────
  hollandBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },

  hollandLetterBox: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hollandLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  hollandInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },

  hollandLabel: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  hollandCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  hollandSubtitle: {
    fontSize: 11,
    color: BRAND_COLORS.muted,
    marginTop: 4,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 9,
    color: BRAND_COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // ── Type grid ─────────────────────────────────────────────────────────────
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },

  typeCard: {
    width: '31%',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  typeLetterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  typeLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  typeName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 3,
  },

  typeScore: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
  },

  typeDesc: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginTop: 4,
    lineHeight: 1.4,
  },

  // ── Career match box ──────────────────────────────────────────────────────
  careerMatchBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },

  careerMatchTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 10,
  },

  careerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  careerTag: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  careerTagText: {
    fontSize: 9,
    color: BRAND_COLORS.dark,
  },

  // ── Work environment box ──────────────────────────────────────────────────
  environmentBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    padding: 14,
    marginTop: 8,
  },

  environmentLabel: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  environmentText: {
    fontSize: 10,
    color: BRAND_COLORS.dark,
    lineHeight: 1.5,
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

export function InterestPage({ data }: InterestPageProps) {
  const { interest } = data

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Interest Profile</Text>
        <Text style={styles.pageNumber}>Page 3 of 8</Text>
      </View>

      {/* Null state */}
      {interest === null ? (
        <View style={styles.nullContainer}>
          <Text style={styles.nullText}>
            Interest assessment not completed.
          </Text>
        </View>
      ) : (
        <>
          {/* Holland code display box */}
          {(() => {
            const letters = splitCode(interest.holland_code)
            const subtitle = letters
              .map((l): string => RIASEC_LABELS[l as RiasecKey] ?? l)
              .join(' · ')

            return (
              <View style={styles.hollandBox}>
                {/* One coloured letter box per code letter */}
                {letters.map((letter) => (
                  <View
                    key={letter}
                    style={[
                      styles.hollandLetterBox,
                      {
                        backgroundColor:
                          RIASEC_COLORS[letter as RiasecKey] ?? BRAND_COLORS.muted,
                      },
                    ]}
                  >
                    <Text style={styles.hollandLetter}>{letter}</Text>
                  </View>
                ))}

                {/* Info to the right of the letter boxes */}
                <View style={styles.hollandInfo}>
                  <Text style={styles.hollandLabel}>Your Holland Code</Text>
                  <Text style={styles.hollandCode}>{interest.holland_code}</Text>
                  <Text style={styles.hollandSubtitle}>{subtitle}</Text>
                </View>
              </View>
            )
          })()}

          {/* Section label */}
          <Text style={styles.sectionLabel}>All Six Interest Types</Text>

          {/* Type grid — sorted by score descending */}
          {(() => {
            const sorted = [...RIASEC_KEYS].sort(
              (a, b) => interest[b] - interest[a],
            )
            const top3 = sorted.slice(0, 3)

            return (
              <View style={styles.typeGrid}>
                {sorted.map((key) => {
                  const isActive = top3.includes(key)
                  const color = RIASEC_COLORS[key]

                  return (
                    <View
                      key={key}
                      style={[
                        styles.typeCard,
                        isActive
                          ? { borderWidth: 2, borderColor: color }
                          : {},
                      ]}
                    >
                      {/* Coloured circle badge */}
                      <View
                        style={[
                          styles.typeLetterBadge,
                          { backgroundColor: color },
                        ]}
                      >
                        <Text style={styles.typeLetter}>{key}</Text>
                      </View>

                      <Text style={styles.typeName}>{RIASEC_LABELS[key]}</Text>
                      <Text style={styles.typeScore}>
                        {interest[key]} / 7
                      </Text>
                      <Text style={styles.typeDesc}>
                        {shortDesc(RIASEC_DESCRIPTIONS[key] ?? '')}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )
          })()}

          {/* Career matches box */}
          {(() => {
            const sorted = [...RIASEC_KEYS].sort(
              (a, b) => interest[b] - interest[a],
            )
            const top2 = sorted.slice(0, 2) as RiasecKey[]
            const careers = mergedCareers(top2)

            return (
              <View style={styles.careerMatchBox}>
                <Text style={styles.careerMatchTitle}>
                  Careers that match your top interests
                </Text>
                <View style={styles.careerTagsRow}>
                  {careers.map((career) => (
                    <View key={career} style={styles.careerTag}>
                      <Text style={styles.careerTagText}>{career}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          })()}

          {/* Work environment box */}
          {(() => {
            const sorted = [...RIASEC_KEYS].sort(
              (a, b) => interest[b] - interest[a],
            )
            const top2 = sorted.slice(0, 2) as RiasecKey[]
            const envText =
              RIASEC_ENVIRONMENT[top2[0]!] +
              ' and ' +
              RIASEC_ENVIRONMENT[top2[1]!].charAt(0).toLowerCase() +
              RIASEC_ENVIRONMENT[top2[1]!].slice(1) +
              '.'

            return (
              <View style={styles.environmentBox}>
                <Text style={styles.environmentLabel}>
                  Your Ideal Work Environment
                </Text>
                <Text style={styles.environmentText}>{envText}</Text>
              </View>
            )
          })()}
        </>
      )}

    </Page>
  )
}

export default InterestPage