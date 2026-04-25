// =============================================================================
// SOLVO — PDF Download Button Wrapper
// File: PdfDownloadButton.tsx
// Path: components/pdf/PdfDownloadButton.tsx
// Purpose: Isolates react-pdf imports into a pure client component
//          so it can be safely dynamically imported by the results page
// =============================================================================
'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { ReportDocument } from './ReportDocument'
import type { PdfReportData } from '@/lib/pdf/report-data'

interface PdfDownloadButtonProps {
  data: PdfReportData
}

export default function PdfDownloadButton({ data }: PdfDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<ReportDocument data={data} />}
      fileName={`SOLVO-Report-${data.user.report_id}.pdf`}
    >
      {({ loading: pdfLoading }) => (
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors disabled:opacity-50"
          disabled={pdfLoading}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Report (PDF)'}
        </button>
      )}
    </PDFDownloadLink>
  )
}