// ============================================================
// FURNITURE STUDIO — services/pdfQuote.ts
// Generador de PDF de Cotización
// SOLO TypeScript + @react-pdf/renderer — sin hooks
// ============================================================

import ReactPDF from '@react-pdf/renderer'
import React from 'react'
import type { Project, Furniture, BOMItem, BOMHardwareItem, CostSummary } from '@/engine/types'
import {
  PDF_COLORS,
  baseStyles,
  PdfSectionTitle,
  PdfTable,
  PdfTwoCol,
  downloadBlob,
  formatDate,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from './exportPDF'

const { pdf } = ReactPDF

// ─── Estilos locales ─────────────────────────────────────────

const styles = StyleSheet.create({
  coverPage: {
    ...baseStyles.page,
    paddingTop: 50,
  },
  logoBox: {
    width: 100,
    height: 50,
    backgroundColor: PDF_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 10,
    color: PDF_COLORS.slate,
    fontFamily: 'Helvetica',
  },
  projectTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginBottom: 6,
  },
  projectMeta: {
    fontSize: 10,
    color: PDF_COLORS.slate,
    marginBottom: 4,
  },
  metaDivider: {
    height: 2,
    backgroundColor: PDF_COLORS.navy,
    marginTop: 12,
    marginBottom: 20,
  },
  contentPage: {
    ...baseStyles.page,
  },
  summaryBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: PDF_COLORS.light,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  totalLabel: {
    fontSize: 10,
    color: PDF_COLORS.slate,
  },
  totalValue: {
    fontSize: 10,
    color: PDF_COLORS.navy,
    fontFamily: 'Helvetica-Bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: PDF_COLORS.navy,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.green,
  },
  footerFixed: {
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

// ─── Helper: símbolo de moneda ───────────────────────────────

function currencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    CRC: '₡',
    MXN: '$',
    COP: '$',
  }
  return symbols[currency] ?? currency
}

function formatMoney(amount: number, currency: string): string {
  return `${currencySymbol(currency)} ${amount.toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// ─── Página 1: Portada ────────────────────────────────────────

function buildCoverPage(projectName: string, currency: string, date: string, furnitureName?: string) {
  return React.createElement(
    Page,
    { size: 'A4', style: styles.coverPage },
    // Logo placeholder
    React.createElement(
      View,
      { style: styles.logoBox },
      React.createElement(Text, { style: styles.logoText }, 'LOGO'),
    ),
    // Título
    React.createElement(
      Text,
      { style: styles.projectTitle },
      furnitureName ? furnitureName : projectName,
    ),
    // Subtítulo si hay mueble específico
    furnitureName
      ? React.createElement(Text, { style: styles.projectMeta }, `Proyecto: ${projectName}`)
      : null,
    // Meta
    React.createElement(Text, { style: styles.projectMeta }, `Fecha: ${date}`),
    React.createElement(Text, { style: styles.projectMeta }, `Moneda: ${currency}`),
    React.createElement(View, { style: styles.metaDivider }),
    React.createElement(
      Text,
      { style: { fontSize: 10, color: PDF_COLORS.slate } },
      'Cotización generada por Furniture Studio',
    ),
    // Footer fijo
    React.createElement(
      View,
      { style: styles.footerFixed, fixed: true },
      React.createElement(Text, { style: styles.footerText }, 'Furniture Studio'),
      React.createElement(
        Text,
        {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Página ${pageNumber} de ${totalPages}`,
        },
      ),
    ),
  )
}

// ─── Página de contenido: tablas y resumen ───────────────────

function buildContentPage(
  bomParts: BOMItem[],
  bomHardware: BOMHardwareItem[],
  cost: CostSummary,
  currency: string,
  furnitureName: string,
) {
  const materialRows = bomParts.map(item => [
    item.materialName,
    item.areaSqm.toFixed(4),
    formatMoney(item.unitPrice, currency),
    formatMoney(item.subtotal, currency),
  ])

  const hardwareRows = bomHardware.map(item => [
    item.description,
    String(item.quantity),
    formatMoney(item.unitPrice, currency),
    formatMoney(item.subtotal, currency),
  ])

  const matHeaders = ['Material', 'Área (m²)', 'Precio/m²', 'Subtotal']
  const hwHeaders  = ['Herraje', 'Cantidad', 'Precio unit.', 'Subtotal']

  return React.createElement(
    Page,
    { size: 'A4', style: styles.contentPage },
    // Título del mueble
    React.createElement(
      Text,
      { style: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: PDF_COLORS.navy, marginBottom: 12 } },
      furnitureName,
    ),

    // Tabla materiales
    React.createElement(PdfSectionTitle, { text: 'Materiales' }),
    materialRows.length > 0
      ? React.createElement(PdfTable, { headers: matHeaders, rows: materialRows })
      : React.createElement(Text, { style: { fontSize: 9, color: PDF_COLORS.slate } }, 'Sin materiales registrados.'),

    // Tabla herrajes
    React.createElement(PdfSectionTitle, { text: 'Herrajes' }),
    hardwareRows.length > 0
      ? React.createElement(PdfTable, { headers: hwHeaders, rows: hardwareRows })
      : React.createElement(Text, { style: { fontSize: 9, color: PDF_COLORS.slate } }, 'Sin herrajes registrados.'),

    // Resumen de costos
    React.createElement(PdfSectionTitle, { text: 'Resumen de Costos' }),
    React.createElement(
      View,
      { style: styles.summaryBox },
      React.createElement(
        View,
        { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Subtotal materiales'),
        React.createElement(Text, { style: styles.totalValue }, formatMoney(cost.materialsCost, currency)),
      ),
      React.createElement(
        View,
        { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Subtotal herrajes'),
        React.createElement(Text, { style: styles.totalValue }, formatMoney(cost.hardwareCost, currency)),
      ),
      React.createElement(PdfTwoCol, { left: `Margen de ganancia (${cost.profitMargin}%)`, right: '' }),
      React.createElement(
        View,
        { style: styles.grandTotalRow },
        React.createElement(Text, { style: styles.grandTotalLabel }, 'PRECIO DE VENTA'),
        React.createElement(Text, { style: styles.grandTotalValue }, formatMoney(cost.salePrice, currency)),
      ),
    ),

    // Footer fijo
    React.createElement(
      View,
      { style: styles.footerFixed, fixed: true },
      React.createElement(Text, { style: styles.footerText }, 'Furniture Studio'),
      React.createElement(
        Text,
        {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Página ${pageNumber} de ${totalPages}`,
        },
      ),
    ),
  )
}

// ─── Función que construye el documento PDF de un mueble ─────

function buildFurnitureQuoteDoc(furniture: Furniture, project: Project, date: string) {
  const { result } = furniture

  if (!result) {
    return React.createElement(
      Document,
      null,
      buildCoverPage(project.name, project.currency, date, furniture.name),
      React.createElement(
        Page,
        { size: 'A4', style: styles.contentPage },
        React.createElement(
          Text,
          { style: { fontSize: 12, color: PDF_COLORS.slate, marginTop: 40 } },
          'Sin datos calculados. Configura el mueble para generar la cotización.',
        ),
      ),
    )
  }

  return React.createElement(
    Document,
    { title: `Cotización — ${furniture.name}`, author: 'Furniture Studio' },
    buildCoverPage(project.name, project.currency, date, furniture.name),
    buildContentPage(
      result.bom.parts,
      result.bom.hardware,
      result.cost,
      project.currency,
      furniture.name,
    ),
  )
}

// ─── Función que construye el documento PDF consolidado ───────

function buildProjectQuoteDoc(project: Project, date: string) {
  const furnitures = project.furnitures

  if (furnitures.length === 0) {
    return React.createElement(
      Document,
      null,
      buildCoverPage(project.name, project.currency, date),
      React.createElement(
        Page,
        { size: 'A4', style: styles.contentPage },
        React.createElement(
          Text,
          { style: { fontSize: 12, color: PDF_COLORS.slate, marginTop: 40 } },
          'El proyecto no tiene muebles configurados.',
        ),
      ),
    )
  }

  const contentPages = furnitures
    .filter(f => f.result != null)
    .map(f =>
      buildContentPage(
        f.result!.bom.parts,
        f.result!.bom.hardware,
        f.result!.cost,
        project.currency,
        f.name,
      )
    )

  // Resumen consolidado
  const withResult = furnitures.filter(f => f.result != null)
  const totalMat  = withResult.reduce((s, f) => s + f.result!.cost.materialsCost, 0)
  const totalHw   = withResult.reduce((s, f) => s + f.result!.cost.hardwareCost, 0)
  const totalSale = withResult.reduce((s, f) => s + f.result!.cost.salePrice, 0)

  const consolidatedPage = React.createElement(
    Page,
    { size: 'A4', style: styles.contentPage },
    React.createElement(PdfSectionTitle, { text: 'Resumen Consolidado del Proyecto' }),
    React.createElement(
      View,
      { style: styles.summaryBox },
      ...withResult.map(f =>
        React.createElement(
          View,
          { key: f.id, style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, f.name),
          React.createElement(
            Text,
            { style: styles.totalValue },
            formatMoney(f.result!.cost.salePrice, project.currency),
          ),
        )
      ),
      React.createElement(
        View,
        { style: { ...styles.totalRow, marginTop: 4 } },
        React.createElement(Text, { style: styles.totalLabel }, 'Total materiales'),
        React.createElement(Text, { style: styles.totalValue }, formatMoney(totalMat, project.currency)),
      ),
      React.createElement(
        View,
        { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Total herrajes'),
        React.createElement(Text, { style: styles.totalValue }, formatMoney(totalHw, project.currency)),
      ),
      React.createElement(
        View,
        { style: styles.grandTotalRow },
        React.createElement(Text, { style: styles.grandTotalLabel }, 'TOTAL PROYECTO'),
        React.createElement(Text, { style: styles.grandTotalValue }, formatMoney(totalSale, project.currency)),
      ),
    ),
    // Footer
    React.createElement(
      View,
      { style: styles.footerFixed, fixed: true },
      React.createElement(Text, { style: styles.footerText }, 'Furniture Studio'),
      React.createElement(
        Text,
        {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Página ${pageNumber} de ${totalPages}`,
        },
      ),
    ),
  )

  return React.createElement(
    Document,
    { title: `Cotización — ${project.name}`, author: 'Furniture Studio' },
    buildCoverPage(project.name, project.currency, date),
    consolidatedPage,
    ...contentPages,
  )
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera y descarga un PDF de cotización.
 * @param project     — Proyecto activo
 * @param furnitureId — Si se provee, genera PDF solo de ese mueble; si es undefined, PDF consolidado
 */
export async function generateQuotePDF(project: Project, furnitureId?: string): Promise<void> {
  const date = formatDate(project.updatedAt)
  const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_')

  let doc: React.ReactElement

  if (furnitureId) {
    const furniture = project.furnitures.find(f => f.id === furnitureId)
    if (!furniture) throw new Error(`Mueble con id ${furnitureId} no encontrado`)
    doc = buildFurnitureQuoteDoc(furniture, project, date)
  } else {
    doc = buildProjectQuoteDoc(project, date)
  }

  // Cast necesario: React.createElement retorna ReactElement<unknown> pero pdf() espera ReactElement<DocumentProps>
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob()
  downloadBlob(blob, `${safeProjectName}_cotizacion.pdf`)
}
