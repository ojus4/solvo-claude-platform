// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Next Steps Page  (Page 8 of 8)
// components/pdf/NextStepsPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { BRAND_COLORS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface NextStepsPageProps {
  data: PdfReportData
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACHIEVER_FEATURES = [
  'Complete step-by-step career roadmap',
  'All 5 career path roadmaps unlocked',
  'Full personality, interest and aptitude analysis',
  '12 months of Indian job market data',
  'Private SOLVO student community',
  'Lifetime access — pay once, use forever',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()
  } catch {
    return iso
  }
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
    borderBottomColor: BRAND_COLORS.success,
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

  // ── Congratulations box ───────────────────────────────────────────────────
  congratsBox: {
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 10,
    padding: 24,
    marginBottom: 28,
  },

  congratsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },

  congratsText: {
    fontSize: 11,
    color: '#BFDBFE',
    lineHeight: 1.6,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 9,
    color: BRAND_COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    fontWeight: 'bold',
  },

  sectionLabelOrange: {
    fontSize: 9,
    color: BRAND_COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    fontWeight: 'bold',
  },

  // ── Steps grid ────────────────────────────────────────────────────────────
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },

  stepCard: {
    width: '47%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },

  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  stepCardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 6,
  },

  stepCardText: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    lineHeight: 1.5,
  },

  // ── Achiever plan box ─────────────────────────────────────────────────────
  planBox: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 28,
  },

  planHeader: {
    backgroundColor: BRAND_COLORS.secondary,
    padding: 16,
  },

  planHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  planHeaderSubtitle: {
    fontSize: 10,
    color: '#FED7AA',
    marginTop: 4,
  },

  planBody: {
    backgroundColor: '#FFF7ED',
    padding: 16,
  },

  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  planFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND_COLORS.secondary,
    marginRight: 10,
  },

  planFeatureText: {
    fontSize: 10,
    color: BRAND_COLORS.dark,
  },

  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },

  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BRAND_COLORS.secondary,
  },

  planPriceSub: {
    fontSize: 11,
    color: BRAND_COLORS.muted,
    marginLeft: 6,
  },

  planUrl: {
    fontSize: 10,
    color: BRAND_COLORS.primary,
    marginTop: 8,
    fontWeight: 'bold',
  },

  // ── Premium confirmation box ──────────────────────────────────────────────
  premiumConfirmBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 28,
  },

  premiumConfirmTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },

  premiumConfirmText: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    lineHeight: 1.6,
  },

  // ── Contact box ───────────────────────────────────────────────────────────
  contactBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },

  contactTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
    marginBottom: 12,
  },

  contactRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  contactLabel: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    width: 80,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  contactValue: {
    fontSize: 9,
    color: BRAND_COLORS.primary,
    fontWeight: 'bold',
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLeft: {
    flex: 1,
  },

  footerBrand: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BRAND_COLORS.dark,
  },

  footerTagline: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    marginTop: 2,
  },

  footerRight: {
    alignItems: 'flex-end',
  },

  footerReportId: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },

  footerDate: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    marginTop: 2,
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

// ─── Component ────────────────────────────────────────────────────────────────

export function NextStepsPage({ data }: NextStepsPageProps) {
  const { is_premium, user } = data

  // Step 2 text varies by tier
  const step2Text = is_premium
    ? 'Your Achiever plan is active. Visit solvo.in/dashboard to view your complete step-by-step career roadmap.'
    : 'Unlock your complete career roadmap with the Achiever Plan. Get your personalised path to your first job.'

  const STEP_CARDS = [
    {
      number: 1,
      title: 'Access Your Dashboard',
      text: 'Log in to solvo.in to view your interactive results, track your progress, and access all your assessment data in one place.',
    },
    {
      number: 2,
      title: 'Explore Your Roadmap',
      text: step2Text,
    },
    {
      number: 3,
      title: 'Build Your Skills',
      text: 'Visit the SOLVO Skill Library at solvo.in/skills to find the exact courses and certifications employers in your target field are looking for.',
    },
    {
      number: 4,
      title: 'Track the Job Market',
      text: 'Use the Job Market Analyzer at solvo.in/jobs to monitor hiring trends, salary data, and in-demand skills for your target career.',
    },
  ]

  return (
    <Page size="A4" style={styles.page}>

      {/* 1 — Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Next Steps</Text>
        <Text style={styles.pageNumber}>Page 8 of 8</Text>
      </View>

      {/* 2 — Congratulations box */}
      <View style={styles.congratsBox}>
        <Text style={styles.congratsTitle}>
          Your Career Intelligence Report is Complete
        </Text>
        <Text style={styles.congratsText}>
          You have taken a significant step toward understanding yourself and
          your career path. Here is what to do next to turn these insights into
          action.
        </Text>
      </View>

      {/* 3 — Section label */}
      <Text style={styles.sectionLabel}>Your Action Plan</Text>

      {/* 4 — Steps grid (2 × 2) */}
      <View style={styles.stepsGrid}>
        {STEP_CARDS.map((card) => (
          <View key={card.number} style={styles.stepCard}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>{card.number}</Text>
            </View>
            <Text style={styles.stepCardTitle}>{card.title}</Text>
            <Text style={styles.stepCardText}>{card.text}</Text>
          </View>
        ))}
      </View>

      {/* 5 — Section label (varies by tier) */}
      <Text style={styles.sectionLabelOrange}>
        {is_premium ? 'Your Plan Is Active' : 'Unlock Your Full Potential'}
      </Text>

      {/* 6 — Achiever plan box OR premium confirmation */}
      {is_premium ? (
        <View style={styles.premiumConfirmBox}>
          <Text style={styles.premiumConfirmTitle}>
            You have Achiever Access
          </Text>
          <Text style={styles.premiumConfirmText}>
            Your premium features are active. Visit your dashboard to access
            your full roadmap and all career reports.
          </Text>
        </View>
      ) : (
        <View style={styles.planBox}>
          {/* Header */}
          <View style={styles.planHeader}>
            <Text style={styles.planHeaderTitle}>SOLVO Achiever Plan</Text>
            <Text style={styles.planHeaderSubtitle}>
              Everything you need to go from assessment to employed
            </Text>
          </View>

          {/* Body */}
          <View style={styles.planBody}>
            {ACHIEVER_FEATURES.map((feature) => (
              <View key={feature} style={styles.planFeatureRow}>
                <View style={styles.planFeatureDot} />
                <Text style={styles.planFeatureText}>{feature}</Text>
              </View>
            ))}

            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>₹99</Text>
              <Text style={styles.planPriceSub}>one-time</Text>
            </View>

            <Text style={styles.planUrl}>solvo.in/checkout</Text>
          </View>
        </View>
      )}

      {/* 7 — Contact support box */}
      <View style={styles.contactBox}>
        <Text style={styles.contactTitle}>Questions? We are here to help.</Text>

        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>solvo.in</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>hello@solvo.in</Text>
        </View>

        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Instagram</Text>
          <Text style={styles.contactValue}>@solvo.in</Text>
        </View>
      </View>

      {/* 8 — Footer */}
      <View style={styles.footerDivider} />
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerBrand}>SOLVO</Text>
          <Text style={styles.footerTagline}>Career Intelligence Platform</Text>
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.footerReportId}>
            {'Report ID: ' + user.report_id}
          </Text>
          <Text style={styles.footerDate}>
            {'Generated: ' + formatDate(user.generated_at)}
          </Text>
        </View>
      </View>

      {/* 9 — Orange footer strip (absolute) */}
      <View style={styles.footerStrip} />

    </Page>
  )
}

export default NextStepsPage