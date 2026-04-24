// ─────────────────────────────────────────────────────────────────────────────
// SOLVO — PDF Report Document  (root assembler)
// components/pdf/ReportDocument.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { Document } from '@react-pdf/renderer'
import type { PdfReportData } from '@/lib/pdf/report-data'
import { CoverPage } from './CoverPage'
import { PersonalityPage } from './PersonalityPage'
import { InterestPage } from './InterestPage'
import { AptitudePage } from './AptitudePage'
import { EqPage } from './EqPage'
import { CareerPage } from './CareerPage'
import { RoadmapPreviewPage } from './RoadmapPreview'
import { NextStepsPage } from './NextStepsPage'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReportDocumentProps {
  data: PdfReportData
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportDocument({ data }: ReportDocumentProps) {
  return (
    <Document
      title={`SOLVO Career Report — ${data.user.full_name}`}
      author="SOLVO Career Intelligence Platform"
      subject="Personalised Career Intelligence Report"
      keywords="career, psychometric, personality, RIASEC, aptitude, EQ"
      creator="SOLVO"
      producer="SOLVO"
    >
      <CoverPage data={data} />
      <PersonalityPage data={data} />
      <InterestPage data={data} />
      <AptitudePage data={data} />
      <EqPage data={data} />
      <CareerPage data={data} />
      <RoadmapPreviewPage data={data} />
      <NextStepsPage data={data} />
    </Document>
  )
}