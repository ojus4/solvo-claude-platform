// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Cover Page  (Page 1 of 8)
// components/pdf/CoverPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { BRAND_COLORS } from '@/lib/pdf/report-data'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CoverPageProps {
  data: PdfReportData
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
  },

  // ── Header strip ──────────────────────────────────────────────────────────
  headerStrip: {
    width: '100%',
    height: 220,
    backgroundColor: BRAND_COLORS.primary,
  },

  logoArea: {
    paddingTop: 48,
    paddingRight: 48,
    paddingBottom: 0,
    paddingLeft: 48,
  },

  logoText: {
    fontSize: 42,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 4,
  },

  logoTagline: {
    fontSize: 13,
    color: '#93C5FD',
    marginTop: 8,
    letterSpacing: 1,
  },

  reportTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 40,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ── Content area ──────────────────────────────────────────────────────────
  contentArea: {
    padding: 48,
  },

  studentSection: {
    marginTop: 32,
  },

  labelText: {
    fontSize: 10,
    color: BRAND_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },

  nameText: {
    fontSize: 28,
    color: BRAND_COLORS.dark,
    fontWeight: 'bold',
  },

  emailText: {
    fontSize: 13,
    color: BRAND_COLORS.muted,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 40,
    marginBottom: 40,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 40,
  },

  metaBlock: {
    flex: 1,
  },

  metaLabel: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },

  metaValue: {
    fontSize: 13,
    color: BRAND_COLORS.dark,
    fontWeight: 'bold',
  },

  reportIdText: {
    fontSize: 9,
    color: BRAND_COLORS.muted,
    marginTop: 48,
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

export function CoverPage({ data }: CoverPageProps) {
  // ── Date formatting ──────────────────────────────────────────────────────
  const d = new Date(data.user.generated_at)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  const formattedDate =
    d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()

  // ── Tier capitalisation ──────────────────────────────────────────────────
  const tierDisplay =
    data.user.tier.charAt(0).toUpperCase() + data.user.tier.slice(1)

  return (
    <Page size="A4" style={styles.page}>

      {/* 1 — Blue header strip */}
      <View style={styles.headerStrip}>
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>SOLVO</Text>
          <Text style={styles.logoTagline}>Career Intelligence Platform</Text>
          <Text style={styles.reportTitle}>
            Your Personalised Career Intelligence Report
          </Text>
        </View>
      </View>

      {/* 2 — Content area */}
      <View style={styles.contentArea}>

        {/* Student section */}
        <View style={styles.studentSection}>
          <Text style={styles.labelText}>Prepared For</Text>
          <Text style={styles.nameText}>{data.user.full_name}</Text>
          <Text style={styles.emailText}>{data.user.email}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Meta row — three blocks side by side */}
        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Report Date</Text>
            <Text style={styles.metaValue}>{formattedDate}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Report ID</Text>
            <Text style={styles.metaValue}>{data.user.report_id}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Plan</Text>
            <Text style={styles.metaValue}>{tierDisplay}</Text>
          </View>
        </View>

        {/* Report ID small text */}
        <Text style={styles.reportIdText}>
          {'Report ID: ' + data.user.report_id}
        </Text>

      </View>

      {/* 3 — Orange footer strip (absolute) */}
      <View style={styles.footerStrip} />

    </Page>
  )
}

export default CoverPage