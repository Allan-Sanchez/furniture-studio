// ============================================================
// FURNITURE STUDIO — services/exportPDF.ts
// Componentes base reutilizables para todos los PDFs
// SOLO @react-pdf/renderer — sin hooks, sin browser APIs
// ============================================================

import ReactPDF from '@react-pdf/renderer'
import React from 'react'

const { Document, Page, View, Text, StyleSheet } = ReactPDF

// ─── Paleta de colores ───────────────────────────────────────

export const PDF_COLORS = {
  navy:   '#1e3a5f',
  slate:  '#475569',
  light:  '#f8fafc',
  border: '#e2e8f0',
  white:  '#ffffff',
  green:  '#16a34a',
  red:    '#dc2626',
  gray:   '#94a3b8',
} as const

// ─── Estilos base compartidos ────────────────────────────────

export const baseStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PDF_COLORS.slate,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: PDF_COLORS.white,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.navy,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.navy,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.light,
  },
  tableCell: {
    fontSize: 9,
    color: PDF_COLORS.slate,
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: PDF_COLORS.gray,
  },
})

// ─── Componente: Portada ─────────────────────────────────────

export interface PdfCoverPageProps {
  title: string
  subtitle?: string
  projectName: string
  date: string
}

export function PdfCoverPage({ title, subtitle, projectName, date }: PdfCoverPageProps) {
  const styles = StyleSheet.create({
    page: {
      ...baseStyles.page,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoBox: {
      width: 120,
      height: 60,
      backgroundColor: PDF_COLORS.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
    },
    logoText: {
      fontSize: 11,
      color: PDF_COLORS.slate,
      fontFamily: 'Helvetica',
    },
    title: {
      fontSize: 28,
      fontFamily: 'Helvetica-Bold',
      color: PDF_COLORS.navy,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Helvetica',
      color: PDF_COLORS.slate,
      textAlign: 'center',
      marginBottom: 24,
    },
    divider: {
      width: 80,
      height: 3,
      backgroundColor: PDF_COLORS.navy,
      marginBottom: 24,
    },
    projectName: {
      fontSize: 13,
      fontFamily: 'Helvetica-Bold',
      color: PDF_COLORS.navy,
      textAlign: 'center',
      marginBottom: 8,
    },
    date: {
      fontSize: 10,
      color: PDF_COLORS.slate,
      textAlign: 'center',
    },
    generatedBy: {
      position: 'absolute',
      bottom: 30,
      fontSize: 9,
      color: PDF_COLORS.gray,
    },
  })

  return React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(
      View,
      { style: styles.logoBox },
      React.createElement(Text, { style: styles.logoText }, 'LOGO'),
    ),
    React.createElement(Text, { style: styles.title }, title),
    subtitle ? React.createElement(Text, { style: styles.subtitle }, subtitle) : null,
    React.createElement(View, { style: styles.divider }),
    React.createElement(Text, { style: styles.projectName }, projectName),
    React.createElement(Text, { style: styles.date }, date),
    React.createElement(Text, { style: styles.generatedBy }, 'Generado por Furniture Studio'),
  )
}

// ─── Componente: Título de sección ───────────────────────────

export interface PdfSectionTitleProps {
  text: string
}

export function PdfSectionTitle({ text }: PdfSectionTitleProps) {
  return React.createElement(Text, { style: baseStyles.sectionTitle }, text)
}

// ─── Componente: Tabla ───────────────────────────────────────

export interface PdfTableProps {
  headers: string[]
  rows: string[][]
  colWidths?: number[]
}

export function PdfTable({ headers, rows, colWidths }: PdfTableProps) {
  const headerCells = headers.map((h, i) => {
    const style = colWidths
      ? { ...baseStyles.tableHeaderCell, flex: undefined as unknown as number, width: colWidths[i] }
      : baseStyles.tableHeaderCell
    return React.createElement(Text, { key: String(i), style }, h)
  })

  const dataRows = rows.map((row, rowIdx) => {
    const cells = row.map((cell, colIdx) => {
      const style = colWidths
        ? { ...baseStyles.tableCell, flex: undefined as unknown as number, width: colWidths[colIdx] }
        : baseStyles.tableCell
      return React.createElement(Text, { key: String(colIdx), style }, cell)
    })
    const rowStyle = rowIdx % 2 === 0 ? baseStyles.tableRow : baseStyles.tableRowAlt
    return React.createElement(View, { key: String(rowIdx), style: rowStyle }, ...cells)
  })

  return React.createElement(
    View,
    null,
    React.createElement(View, { style: baseStyles.tableHeader }, ...headerCells),
    ...dataRows,
  )
}

// ─── Componente: Footer ──────────────────────────────────────

export interface PdfFooterProps {
  pageNumber: number
  total: number
}

export function PdfFooter({ pageNumber, total }: PdfFooterProps) {
  return React.createElement(
    View,
    { style: baseStyles.footer, fixed: true },
    React.createElement(Text, { style: baseStyles.footerText }, 'Furniture Studio'),
    React.createElement(
      Text,
      { style: baseStyles.footerText },
      `Página ${pageNumber} de ${total}`,
    ),
  )
}

// ─── Componente: Dos columnas de texto ──────────────────────

export interface PdfTwoColProps {
  left: string
  right: string
}

export function PdfTwoCol({ left, right }: PdfTwoColProps) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    leftText: {
      fontSize: 10,
      color: PDF_COLORS.slate,
      flex: 1,
    },
    rightText: {
      fontSize: 10,
      color: PDF_COLORS.navy,
      fontFamily: 'Helvetica-Bold',
      textAlign: 'right',
    },
  })

  return React.createElement(
    View,
    { style: styles.container },
    React.createElement(Text, { style: styles.leftText }, left),
    React.createElement(Text, { style: styles.rightText }, right),
  )
}

// ─── Helper: Descargar blob como archivo ─────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── Helper: Formato de fecha ────────────────────────────────

export function formatDate(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date()
  return date.toLocaleDateString('es-CR', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })
}

// ─── Re-exportar Document/Page para que los módulos hijos no importen ReactPDF directamente ──

export { Document, Page, View, Text, StyleSheet }
export const pdfRenderer = ReactPDF
