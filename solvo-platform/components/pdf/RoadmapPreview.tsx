// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Roadmap Preview Page  (Page 7 of 8)
// components/pdf/RoadmapPreviewPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { BRAND_COLORS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoadmapPreviewPageProps {
  data: PdfReportData
}

// ─── Roadmap data ─────────────────────────────────────────────────────────────

interface RoadmapStep {
  step: number
  label: string
  duration: string
  free: boolean
}

interface RoadmapPreview {
  title: string
  duration: string
  steps: RoadmapStep[]
}

const ROADMAP_PREVIEWS: Record<string, RoadmapPreview> = {
  data_science: {
    title: 'Data Science Roadmap',
    duration: '6-12 months to job-ready',
    steps: [
      { step: 1, label: 'Learn Python basics',                      duration: 'Weeks 1-4',  free: true  },
      { step: 2, label: 'Master SQL and databases',                  duration: 'Weeks 5-8',  free: true  },
      { step: 3, label: 'Statistics and probability',               duration: 'Weeks 9-12', free: true  },
      { step: 4, label: 'Machine learning fundamentals',            duration: 'Months 4-6', free: false },
      { step: 5, label: 'Build 3 portfolio projects',               duration: 'Months 6-9', free: false },
      { step: 6, label: 'Interview prep and job applications',      duration: 'Month 10+',  free: false },
    ],
  },
  software_engineering: {
    title: 'Software Engineering Roadmap',
    duration: '6-12 months to job-ready',
    steps: [
      { step: 1, label: 'HTML, CSS, JavaScript fundamentals',       duration: 'Weeks 1-4',  free: true  },
      { step: 2, label: 'Learn a backend language (Python/Node)',   duration: 'Weeks 5-8',  free: true  },
      { step: 3, label: 'Databases and APIs',                       duration: 'Weeks 9-12', free: true  },
      { step: 4, label: 'System design basics',                     duration: 'Months 4-6', free: false },
      { step: 5, label: 'Build full-stack projects',                duration: 'Months 6-9', free: false },
      { step: 6, label: 'DSA and interview preparation',            duration: 'Month 10+',  free: false },
    ],
  },
  ui_ux: {
    title: 'UI/UX Design Roadmap',
    duration: '4-8 months to job-ready',
    steps: [
      { step: 1, label: 'Design principles and colour theory',      duration: 'Weeks 1-3',  free: true  },
      { step: 2, label: 'Learn Figma from scratch',                 duration: 'Weeks 4-7',  free: true  },
      { step: 3, label: 'User research methods',                    duration: 'Weeks 8-10', free: true  },
      { step: 4, label: 'Build a UX case study portfolio',          duration: 'Months 3-5', free: false },
      { step: 5, label: 'Usability testing and iteration',          duration: 'Month 5-6',  free: false },
      { step: 6, label: 'Portfolio review and job applications',    duration: 'Month 7+',   free: false },
    ],
  },
  digital_marketing: {
    title: 'Digital Marketing Roadmap',
    duration: '3-6 months to job-ready',
    steps: [
      { step: 1, label: 'Marketing fundamentals and strategy',      duration: 'Weeks 1-3',  free: true  },
      { step: 2, label: 'SEO and content marketing',                duration: 'Weeks 4-6',  free: true  },
      { step: 3, label: 'Google Ads and Meta Ads basics',           duration: 'Weeks 7-9',  free: true  },
      { step: 4, label: 'Social media and email marketing',         duration: 'Months 3-4', free: false },
      { step: 5, label: 'Analytics and performance tracking',       duration: 'Month 4-5',  free: false },
      { step: 6, label: 'Build a marketing portfolio',              duration: 'Month 5+',   free: false },
    ],
  },
  finance: {
    title: 'Finance & Accounting Roadmap',
    duration: '6-18 months to job-ready',
    steps: [
      { step: 1, label: 'Accounting fundamentals',                  duration: 'Weeks 1-4',  free: true  },
      { step: 2, label: 'Excel for financial analysis',             duration: 'Weeks 5-8',  free: true  },
      { step: 3, label: 'Financial statements and ratios',          duration: 'Weeks 9-12', free: true  },
      { step: 4, label: 'Financial modelling and valuation',        duration: 'Months 4-8', free: false },
      { step: 5, label: 'CFA Level 1 or CA Foundation prep',       duration: 'Months 8-14',free: false },
      { step: 6, label: 'Internships and job applications',         duration: 'Month 15+',  free: false },
    ],
  },
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

  // ── Career badge ──────────────────────────────────────────────────────────
  careerBadge: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 6,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },

  careerBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // ── Roadmap title / duration ──────────────────────────────────────────────
  roadmapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 4,
  },

  roadmapDuration: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    marginBottom: 24,
  },

  // ── Free preview label ────────────────────────────────────────────────────
  freeLabel: {
    fontSize: 9,
    color: '#059669',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // ── Step row ──────────────────────────────────────────────────────────────
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  stepContent: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  stepDuration: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginTop: 2,
  },

  // ── Locked overlay ────────────────────────────────────────────────────────
  lockedOverlay: {
    borderRadius: 8,
    padding: 20,
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  lockIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  lockedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 8,
  },

  lockedText: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 16,
  },

  unlockBox: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
  },

  unlockText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  unlockSubtext: {
    fontSize: 9,
    color: '#BFDBFE',
    textAlign: 'center',
    marginTop: 4,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 12,
  },

  priceMain: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLORS.primary,
  },

  priceSub: {
    fontSize: 12,
    color: BRAND_COLORS.muted,
    marginLeft: 4,
  },

  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },

  featureChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
  },

  featureText: {
    fontSize: 9,
    color: BRAND_COLORS.primary,
    fontWeight: 'bold',
  },

  // ── Premium banner ────────────────────────────────────────────────────────
  premiumBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    alignItems: 'center',
  },

  premiumBannerText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.6,
  },
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepRow({
  roadmapStep,
  circleColor,
}: {
  roadmapStep: RoadmapStep
  circleColor: string
}) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNumberCircle, { backgroundColor: circleColor }]}>
        <Text style={styles.stepNumber}>{roadmapStep.step}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepLabel}>{roadmapStep.label}</Text>
        <Text style={styles.stepDuration}>{roadmapStep.duration}</Text>
      </View>
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoadmapPreviewPage({ data }: RoadmapPreviewPageProps) {
  const topCareer = data.recommended_careers[0]
  const careerId  = topCareer?.id ?? 'data_science'
  const careerTitle = topCareer?.title ?? 'Your Top Career'

  // Fall back to data_science if id not in map
  const roadmap = ROADMAP_PREVIEWS[careerId] ?? ROADMAP_PREVIEWS['data_science']!

  const freeSteps   = roadmap.steps.filter((s) => s.free)
  const lockedSteps = roadmap.steps.filter((s) => !s.free)

  return (
    <Page size="A4" style={styles.page}>

      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Your Career Roadmap</Text>
        <Text style={styles.pageNumber}>Page 7 of 8</Text>
      </View>

      {/* Career badge */}
      <View style={styles.careerBadge}>
        <Text style={styles.careerBadgeText}>{careerTitle}</Text>
      </View>

      {/* Roadmap title + duration */}
      <Text style={styles.roadmapTitle}>{roadmap.title}</Text>
      <Text style={styles.roadmapDuration}>{roadmap.duration}</Text>

      {/* Premium — show all 6 steps */}
      {data.is_premium ? (
        <>
          <Text style={styles.freeLabel}>Full Roadmap — All Steps</Text>

          {roadmap.steps.map((s) => (
            <StepRow
              key={s.step}
              roadmapStep={s}
              circleColor='#059669'
            />
          ))}

          {/* Premium banner */}
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumBannerText}>
              You have Achiever access — view your full interactive roadmap at solvo.in/dashboard
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* Free preview — first 3 steps */}
          <Text style={styles.freeLabel}>
            Free Preview — First {freeSteps.length} Steps
          </Text>

          {freeSteps.map((s) => (
            <StepRow
              key={s.step}
              roadmapStep={s}
              circleColor='#059669'
            />
          ))}

          {/* Locked overlay for remaining steps */}
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockIcon}>[LOCKED]</Text>

            <Text style={styles.lockedTitle}>
              {lockedSteps.length} More Steps Locked
            </Text>

            <Text style={styles.lockedText}>
              Your complete step-by-step roadmap is available with the SOLVO
              Achiever Plan. Get your personalised path from where you are
              today to job-ready.
            </Text>

            {/* Unlock CTA box */}
            <View style={styles.unlockBox}>
              <Text style={styles.unlockText}>Unlock Full Roadmap</Text>
              <Text style={styles.unlockSubtext}>solvo.in/checkout</Text>
            </View>

            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.priceMain}>₹99</Text>
              <Text style={styles.priceSub}>one-time</Text>
            </View>

            {/* Feature chips */}
            <View style={styles.featuresRow}>
              {['Full roadmap', 'All 5 careers', '12 months job data', 'Private community'].map(
                (feature) => (
                  <View key={feature} style={styles.featureChip}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ),
              )}
            </View>
          </View>
        </>
      )}

    </Page>
  )
}

export default RoadmapPreviewPage