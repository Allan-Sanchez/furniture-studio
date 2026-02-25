// ============================================================
// FURNITURE STUDIO — services/pdfAssembly.ts
// Generador de PDF Manual de Armado
// DIFERENCIADOR PRINCIPAL — instrucciones paso a paso
// SOLO TypeScript + @react-pdf/renderer — sin hooks
// ============================================================

import ReactPDF from '@react-pdf/renderer'
import React from 'react'
import type { Project, Furniture, Part, AssemblyStep } from '@/engine/types'
import {
  PDF_COLORS,
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

const asmStyles = StyleSheet.create({
  // Portada
  coverPage: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    backgroundColor: PDF_COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  coverLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica',
    color: '#7fb3e8',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 16,
    fontFamily: 'Helvetica',
    color: '#b0c4de',
    textAlign: 'center',
    marginBottom: 32,
  },
  coverDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#7fb3e8',
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 11,
    color: '#b0c4de',
    textAlign: 'center',
    marginBottom: 4,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 30,
    fontSize: 9,
    color: '#7fb3e8',
    letterSpacing: 2,
  },

  // Páginas de contenido
  contentPage: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PDF_COLORS.slate,
    paddingTop: 40,
    paddingBottom: 55,
    paddingHorizontal: 40,
    backgroundColor: PDF_COLORS.white,
  },

  // Tabla de despiece
  pageTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.navy,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.navy,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    backgroundColor: PDF_COLORS.light,
  },
  cellHeader: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
  },
  cell: {
    fontSize: 8,
    color: PDF_COLORS.slate,
  },

  // Pasos de armado
  stepContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },
  stepHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.navy,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    marginRight: 10,
    width: 26,
    height: 26,
    backgroundColor: '#7fb3e8',
    borderRadius: 13,
    textAlign: 'center',
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    flex: 1,
  },
  stepBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stepDescription: {
    fontSize: 9,
    color: PDF_COLORS.slate,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  subSectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginBottom: 4,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  miniTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  miniTableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  miniTableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    backgroundColor: '#f8fafc',
  },
  miniCellHeader: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
  },
  miniCell: {
    fontSize: 7,
    color: PDF_COLORS.slate,
  },

  // Footer
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

// ─── Anchos para tabla de despiece ───────────────────────────
// Código | Pieza | Dimensiones | Material | Cant
const DESPIECE_WIDTHS = [35, 100, 90, 80, 30]

// ─── Anchos para mini-tablas de pasos ────────────────────────
// Código | Pieza | Cant
const STEP_PARTS_WIDTHS = [35, 120, 30]
// Tipo | Descripción | Cantidad
const STEP_HW_WIDTHS = [60, 120, 35]

// ─── Helpers ─────────────────────────────────────────────────

function getPartCode(part: Part, idx: number): string {
  return part.partCode ?? String.fromCharCode(65 + idx)
}

// ─── Página 1: Portada ────────────────────────────────────────

function buildAssemblyCoverPage(furnitureName: string, projectName: string, date: string) {
  return React.createElement(
    Page,
    { size: 'A4', style: asmStyles.coverPage },
    React.createElement(
      View,
      { style: asmStyles.coverContent },
      React.createElement(Text, { style: asmStyles.coverLabel }, 'Manual de Armado'),
      React.createElement(Text, { style: asmStyles.coverTitle }, furnitureName),
      React.createElement(View, { style: asmStyles.coverDivider }),
      React.createElement(Text, { style: asmStyles.coverMeta }, `Proyecto: ${projectName}`),
      React.createElement(Text, { style: asmStyles.coverMeta }, `Fecha: ${date}`),
    ),
    React.createElement(Text, { style: asmStyles.coverFooter }, 'Generado por Furniture Studio'),
  )
}

// ─── Página 2: Tabla de despiece ─────────────────────────────

function buildDespiecePage(parts: Part[], footer: React.ReactElement) {
  const sortedParts = [...parts].sort((a, b) => {
    const codeA = a.partCode ?? ''
    const codeB = b.partCode ?? ''
    return codeA.localeCompare(codeB)
  })

  const headerCells = ['Código', 'Pieza', 'L × A × Esp. (mm)', 'Material', 'Cant'].map(
    (h, i) =>
      React.createElement(
        Text,
        { key: String(i), style: { ...asmStyles.cellHeader, width: DESPIECE_WIDTHS[i] } },
        h,
      ),
  )

  const dataRows = sortedParts.map((part, idx) => {
    const rowStyle = idx % 2 === 0 ? asmStyles.tableRow : asmStyles.tableRowAlt
    const code = getPartCode(part, idx)
    const dims = `${part.length} × ${part.width} × ${part.thickness}`
    const cells = [
      code,
      part.label,
      dims,
      part.materialId,
      String(part.quantity),
    ].map((val, ci) =>
      React.createElement(
        Text,
        { key: String(ci), style: { ...asmStyles.cell, width: DESPIECE_WIDTHS[ci] } },
        val,
      ),
    )
    return React.createElement(View, { key: part.id, style: rowStyle }, ...cells)
  })

  return React.createElement(
    Page,
    { size: 'A4', style: asmStyles.contentPage },
    React.createElement(Text, { style: asmStyles.pageTitle }, 'TABLA DE DESPIECE'),
    React.createElement(
      View,
      null,
      React.createElement(View, { style: asmStyles.tableHeader }, ...headerCells),
      ...dataRows,
    ),
    footer,
  )
}

// ─── Mini-tabla piezas de un paso ────────────────────────────

function buildStepPartsTable(step: AssemblyStep, allParts: Part[]) {
  if (step.partsInvolved.length === 0) return null

  // Buscar las piezas por ID
  const stepParts = step.partsInvolved
    .map(pid => allParts.find(p => p.id === pid))
    .filter((p): p is Part => p != null)

  if (stepParts.length === 0) return null

  const headerCells = ['Código', 'Pieza', 'Cant'].map(
    (h, i) =>
      React.createElement(
        Text,
        { key: String(i), style: { ...asmStyles.miniCellHeader, width: STEP_PARTS_WIDTHS[i] } },
        h,
      ),
  )

  const rows = stepParts.map((part, idx) => {
    const rowStyle = idx % 2 === 0 ? asmStyles.miniTableRow : asmStyles.miniTableRowAlt
    const code = part.partCode ?? step.partCodes[idx] ?? '-'
    return React.createElement(
      View,
      { key: part.id, style: rowStyle },
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_PARTS_WIDTHS[0] } }, code),
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_PARTS_WIDTHS[1] } }, part.label),
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_PARTS_WIDTHS[2] } }, String(part.quantity)),
    )
  })

  return React.createElement(
    View,
    null,
    React.createElement(Text, { style: asmStyles.subSectionTitle }, 'Piezas de este paso'),
    React.createElement(View, { style: asmStyles.miniTableHeader }, ...headerCells),
    ...rows,
  )
}

// ─── Mini-tabla herrajes de un paso ──────────────────────────

function buildStepHardwareTable(step: AssemblyStep) {
  if (step.hardwareUsed.length === 0) return null

  const headerCells = ['Tipo', 'Descripción', 'Cantidad'].map(
    (h, i) =>
      React.createElement(
        Text,
        { key: String(i), style: { ...asmStyles.miniCellHeader, width: STEP_HW_WIDTHS[i] } },
        h,
      ),
  )

  const rows = step.hardwareUsed.map((hw, idx) => {
    const rowStyle = idx % 2 === 0 ? asmStyles.miniTableRow : asmStyles.miniTableRowAlt
    return React.createElement(
      View,
      { key: String(idx), style: rowStyle },
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_HW_WIDTHS[0] } }, hw.type),
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_HW_WIDTHS[1] } }, hw.description),
      React.createElement(Text, { style: { ...asmStyles.miniCell, width: STEP_HW_WIDTHS[2] } }, String(hw.quantity)),
    )
  })

  return React.createElement(
    View,
    null,
    React.createElement(Text, { style: asmStyles.subSectionTitle }, 'Herrajes de este paso'),
    React.createElement(View, { style: asmStyles.miniTableHeader }, ...headerCells),
    ...rows,
  )
}

// ─── Tarjeta de un paso ───────────────────────────────────────

function buildStepCard(step: AssemblyStep, allParts: Part[]) {
  const partsTable  = buildStepPartsTable(step, allParts)
  const hwTable     = buildStepHardwareTable(step)

  return React.createElement(
    View,
    { key: String(step.stepNumber), style: asmStyles.stepContainer },
    // Cabecera del paso
    React.createElement(
      View,
      { style: asmStyles.stepHeader },
      React.createElement(
        Text,
        { style: asmStyles.stepNumber },
        String(step.stepNumber),
      ),
      React.createElement(Text, { style: asmStyles.stepTitle }, step.title.es),
    ),
    // Cuerpo
    React.createElement(
      View,
      { style: asmStyles.stepBody },
      React.createElement(Text, { style: asmStyles.stepDescription }, step.description.es),
      partsTable,
      hwTable,
    ),
  )
}

// ─── Páginas de pasos ─────────────────────────────────────────

function buildStepsPages(steps: AssemblyStep[], parts: Part[], footer: React.ReactElement) {
  // Agrupa pasos en secciones (máx 3 pasos por página para no saturar)
  const pages: React.ReactElement[] = []
  const STEPS_PER_PAGE = 3

  for (let i = 0; i < steps.length; i += STEPS_PER_PAGE) {
    const chunk = steps.slice(i, i + STEPS_PER_PAGE)
    const stepCards = chunk.map(step => buildStepCard(step, parts))

    pages.push(
      React.createElement(
        Page,
        { key: String(i), size: 'A4', style: asmStyles.contentPage },
        ...stepCards,
        footer,
      ),
    )
  }

  return pages
}

// ─── Documento completo ───────────────────────────────────────

function buildAssemblyDoc(furniture: Furniture, projectName: string, date: string) {
  const footer = React.createElement(
    View,
    { style: asmStyles.footerFixed, fixed: true },
    React.createElement(Text, { style: asmStyles.footerText }, 'Furniture Studio — Manual de Armado'),
    React.createElement(
      Text,
      {
        style: asmStyles.footerText,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `Página ${pageNumber} de ${totalPages}`,
      },
    ),
  )

  const coverPage = buildAssemblyCoverPage(furniture.name, projectName, date)

  if (!furniture.result) {
    return React.createElement(
      Document,
      { title: `Manual de Armado — ${furniture.name}`, author: 'Furniture Studio' },
      coverPage,
      React.createElement(
        Page,
        { size: 'A4', style: asmStyles.contentPage },
        React.createElement(
          Text,
          { style: { fontSize: 12, color: PDF_COLORS.slate, marginTop: 40 } },
          'Sin datos calculados. Configura el mueble para generar el manual de armado.',
        ),
        footer,
      ),
    )
  }

  const { parts, assemblySteps } = furniture.result

  const despiecePage = buildDespiecePage(parts, footer)

  const stepsPages =
    assemblySteps.length > 0
      ? buildStepsPages(assemblySteps, parts, footer)
      : [
          React.createElement(
            Page,
            { key: 'no-steps', size: 'A4', style: asmStyles.contentPage },
            React.createElement(
              Text,
              { style: { fontSize: 12, color: PDF_COLORS.slate, marginTop: 40 } },
              'No se generaron pasos de armado para este mueble.',
            ),
            footer,
          ),
        ]

  return React.createElement(
    Document,
    { title: `Manual de Armado — ${furniture.name}`, author: 'Furniture Studio' },
    coverPage,
    despiecePage,
    ...stepsPages,
  )
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera y descarga el PDF del Manual de Armado.
 * @param project     — Proyecto activo
 * @param furnitureId — ID del mueble (requerido: el manual es siempre por mueble)
 */
export async function generateAssemblyPDF(project: Project, furnitureId: string): Promise<void> {
  const furniture = project.furnitures.find(f => f.id === furnitureId)
  if (!furniture) throw new Error(`Mueble con id ${furnitureId} no encontrado`)

  const date = formatDate(project.updatedAt)
  const safeFurnitureName = furniture.name.replace(/[^a-z0-9]/gi, '_')

  const doc = buildAssemblyDoc(furniture, project.name, date)

  // Cast necesario: React.createElement retorna ReactElement<unknown> pero pdf() espera ReactElement<DocumentProps>
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob()
  downloadBlob(blob, `${safeFurnitureName}_manual_armado.pdf`)
}
