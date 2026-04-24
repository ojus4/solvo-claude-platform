// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Career Page  (Page 6 of 8)
// components/pdf/CareerPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData, PdfCareer } from '@/lib/pdf/report-data'
import { BRAND_COLORS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CareerPageProps {
  data: PdfReportData
}

// ─── Career details map ───────────────────────────────────────────────────────

interface CareerDetail {
  avgSalary: string
  salaryRange: string
  growthOutlook: string
  growthColor: string
  timeToJobReady: string
  topSkills: string[]
  whyItFits: string
}

const CAREER_DETAILS: Record<string, CareerDetail> = {
  data_science: {
    avgSalary: '₹8.5 LPA',
    salaryRange: '₹4L – ₹25L',
    growthOutlook: 'Very High',
    growthColor: '#059669',
    timeToJobReady: '6-12 months',
    topSkills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Tableau'],
    whyItFits:
      'Combines analytical thinking with creative problem-solving. Ideal for people who enjoy finding patterns in complex data.',
  },
  software_engineering: {
    avgSalary: '₹9.2 LPA',
    salaryRange: '₹4L – ₹30L',
    growthOutlook: 'Very High',
    growthColor: '#059669',
    timeToJobReady: '6-12 months',
    topSkills: ['JavaScript', 'Python', 'System Design', 'Git', 'Problem Solving'],
    whyItFits:
      'Rewards logical thinking and attention to detail. Strong demand across every industry in India.',
  },
  ui_ux: {
    avgSalary: '₹6.8 LPA',
    salaryRange: '₹3L – ₹20L',
    growthOutlook: 'High',
    growthColor: '#3B82F6',
    timeToJobReady: '4-8 months',
    topSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    whyItFits:
      'Perfect for creative minds who also enjoy understanding human behaviour and solving usability problems.',
  },
  digital_marketing: {
    avgSalary: '₹5.5 LPA',
    salaryRange: '₹2.5L – ₹18L',
    growthOutlook: 'High',
    growthColor: '#3B82F6',
    timeToJobReady: '3-6 months',
    topSkills: ['SEO', 'Google Ads', 'Social Media', 'Content Strategy', 'Analytics'],
    whyItFits:
      'Suits people with strong communication skills who enjoy creativity and data-driven decision making.',
  },
  finance: {
    avgSalary: '₹7.2 LPA',
    salaryRange: '₹3.5L – ₹22L',
    growthOutlook: 'Moderate',
    growthColor: '#D97706',
    timeToJobReady: '6-18 months',
    topSkills: ['Excel', 'Financial Modelling', 'Accounting', 'Valuation', 'Bloomberg'],
    whyItFits:
      'Ideal for detail-oriented, numerically strong individuals who enjoy structured analytical work.',
  },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_HEADER_COLORS: Record<number, string> = {
  0: BRAND_COLORS.primary,
  1: '#2563EB',
  2: '#3B82F6',
}

const RANK_BADGES: Record<number, string> = {
  0: '🥇 Best Match',
  1: '🥈 Strong Match',
  2: '🥉 Good Match',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Unused: matchColor function kept for reference
// function matchColor(pct: number): string {
//   if (pct >= 75) return '#059669'
//   if (pct >= 50) return '#D97706'
//   return '#6B7280'
// }

function isHighGrowth(outlook: string): boolean {
  return outlook === 'Very High' || outlook === 'High'
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

  // ── Intro text ────────────────────────────────────────────────────────────
  introText: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    lineHeight: 1.6,
    marginBottom: 24,
  },

  // ── Career card ───────────────────────────────────────────────────────────
  careerCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },

  careerCardHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  careerCardHeaderLeft: {
    flexDirection: 'column',
  },

  rankBadge: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },

  careerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  matchBadge: {
    borderRadius: 12,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  matchText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // ── Card body ─────────────────────────────────────────────────────────────
  careerBody: {
    padding: 16,
  },

  careerBodyRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },

  statBlock: {
    flex: 1,
  },

  statLabel: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  statValueGreen: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },

  // ── Why it fits box ───────────────────────────────────────────────────────
  whyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },

  whyLabel: {
    fontSize: 8,
    color: BRAND_COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  whyText: {
    fontSize: 9,
    color: BRAND_COLORS.dark,
    lineHeight: 1.5,
  },

  // ── Skills row ────────────────────────────────────────────────────────────
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  skillTag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    marginRight: 4,
    marginBottom: 4,
  },

  skillText: {
    fontSize: 8,
    color: BRAND_COLORS.primary,
    fontWeight: 'bold',
  },

  // ── Minimal card (fallback for unknown career ids) ────────────────────────
  minimalCardHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },

  emptyText: {
    fontSize: 13,
    color: BRAND_COLORS.muted,
    textAlign: 'center',
    lineHeight: 1.6,
  },
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function CareerCard({
  career,
  index,
}: {
  career: PdfCareer
  index: number
}) {
  const details = CAREER_DETAILS[career.id] ?? null
  const headerBg = CARD_HEADER_COLORS[index] ?? BRAND_COLORS.primary
  const rankLabel = RANK_BADGES[index] ?? ''
  const clampedMatch = Math.min(100, Math.max(0, career.matchPercentage))

  return (
    <View style={styles.careerCard}>
      {/* Card header */}
      <View style={[styles.careerCardHeader, { backgroundColor: headerBg }]}>
        <View style={styles.careerCardHeaderLeft}>
          {rankLabel ? (
            <Text style={styles.rankBadge}>{rankLabel}</Text>
          ) : null}
          <Text style={styles.careerTitle}>{career.title}</Text>
        </View>

        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{clampedMatch}% Match</Text>
        </View>
      </View>

      {/* Card body */}
      {details !== null ? (
        <View style={styles.careerBody}>
          {/* Stat blocks row */}
          <View style={styles.careerBodyRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Avg Salary</Text>
              <Text style={styles.statValue}>{details.avgSalary}</Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Salary Range</Text>
              <Text style={styles.statValue}>{details.salaryRange}</Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Growth</Text>
              <Text
                style={
                  isHighGrowth(details.growthOutlook)
                    ? styles.statValueGreen
                    : styles.statValue
                }
              >
                {details.growthOutlook}
              </Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Time to Ready</Text>
              <Text style={styles.statValue}>{details.timeToJobReady}</Text>
            </View>
          </View>

          {/* Why it fits */}
          <View style={styles.whyBox}>
            <Text style={styles.whyLabel}>Why It Fits You</Text>
            <Text style={styles.whyText}>{details.whyItFits}</Text>
          </View>

          {/* Top skills */}
          <Text style={styles.statLabel}>Top Skills Needed</Text>
          <View style={styles.skillsRow}>
            {details.topSkills.map((skill) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        /* Minimal fallback for unknown career ids */
        <View style={styles.careerBody}>
          <Text style={styles.whyText}>{career.description}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CareerPage({ data }: CareerPageProps) {
  const careers = data.recommended_careers.slice(0, 3)

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Career Recommendations</Text>
        <Text style={styles.pageNumber}>Page 6 of 8</Text>
      </View>

      {/* Empty state */}
      {careers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Career recommendations not yet generated.{'\n'}
            Complete all assessment modules first.
          </Text>
        </View>
      ) : (
        <>
          {/* Intro text */}
          <Text style={styles.introText}>
            Based on your personality profile, interest inventory, aptitude
            scores, and emotional intelligence assessment, here are your top
            career matches ranked by compatibility.
          </Text>

          {/* Career cards */}
          {careers.map((career, index) => (
            <CareerCard key={career.id} career={career} index={index} />
          ))}
        </>
      )}

    </Page>
  )
}

export default CareerPage