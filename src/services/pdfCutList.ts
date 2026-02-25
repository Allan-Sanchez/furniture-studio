// ============================================================
// FURNITURE STUDIO — services/pdfCutList.ts
// Generador de PDF Lista de Corte (para maderería)
// SOLO TypeScript + @react-pdf/renderer — sin hooks
// ============================================================

import ReactPDF from '@react-pdf/renderer'
import React from 'react'
import type { Project, Furniture, SheetGroup, CutListItem } from '@/engine/types'
import {
  PDF_COLORS,
  PdfSectionTitle,
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

const cutStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PDF_COLORS.slate,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    backgroundColor: PDF_COLORS.white,
  },
  headerSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: PDF_COLORS.light,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginBottom: 6,
  },
  headerMeta: {
    fontSize: 9,
    color: PDF_COLORS.slate,
    marginBottom: 2,
  },
  groupTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: PDF_COLORS.navy,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.navy,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.navy,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
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

// ─── Anchos de columnas para la tabla de corte ───────────────
// Cód | Pieza | Largo | Ancho | Esp. | Cant | Veta
const COL_WIDTHS = [30, 90, 45, 45, 35, 25, 45]

// ─── Helpers ─────────────────────────────────────────────────

function grainLabel(grain: CutListItem['grain']): string {
  switch (grain) {
    case 'along':  return 'Paralela'
    case 'across': return 'Perp.'
    case 'any':    return 'Indiferente'
    default:       return '-'
  }
}

function buildGroupTable(group: SheetGroup) {
  const items = group.items

  const headerCells = ['Cód', 'Pieza', 'Largo mm', 'Ancho mm', 'Esp.', 'Cant', 'Veta'].map(
    (h, i) =>
      React.createElement(
        Text,
        { key: String(i), style: { ...cutStyles.cellHeader, width: COL_WIDTHS[i] } },
        h,
      ),
  )

  const dataRows = items.map((item, rowIdx) => {
    const rowStyle = rowIdx % 2 === 0 ? cutStyles.tableRow : cutStyles.tableRowAlt
    const cells = [
      item.label,
      item.partLabel,
      String(item.length),
      String(item.width),
      String(item.thickness),
      String(item.quantity),
      grainLabel(item.grain),
    ].map((val, ci) =>
      React.createElement(
        Text,
        { key: String(ci), style: { ...cutStyles.cell, width: COL_WIDTHS[ci] } },
        val,
      ),
    )
    return React.createElement(View, { key: String(rowIdx), style: rowStyle }, ...cells)
  })

  return React.createElement(
    View,
    null,
    React.createElement(View, { style: cutStyles.tableHeader }, ...headerCells),
    ...dataRows,
  )
}

function buildGroupSection(group: SheetGroup) {
  const subtitle = `${group.materialName} ${group.thickness}mm — ${group.sheetsNeeded} tablero${group.sheetsNeeded !== 1 ? 's' : ''} de 2440×1220mm`
  return React.createElement(
    View,
    { key: `${group.materialId}_${group.thickness}` },
    React.createElement(Text, { style: cutStyles.groupTitle }, subtitle),
    buildGroupTable(group),
  )
}

// ─── Construcción del documento PDF ──────────────────────────

function buildCutListDoc(
  furnitures: Furniture[],
  projectName: string,
  date: string,
  kerf: number,
  wastePercent: number,
  furnitureName?: string,
) {
  const isEmpty = furnitures.every(f => !f.result || f.result.cutList.groups.length === 0)

  const headerSection = React.createElement(
    View,
    { style: cutStyles.headerSection },
    React.createElement(Text, { style: cutStyles.headerTitle }, 'Lista de Corte'),
    React.createElement(Text, { style: cutStyles.headerMeta }, `Proyecto: ${projectName}`),
    furnitureName
      ? React.createElement(Text, { style: cutStyles.headerMeta }, `Mueble: ${furnitureName}`)
      : null,
    React.createElement(Text, { style: cutStyles.headerMeta }, `Fecha: ${date}`),
    React.createElement(Text, { style: cutStyles.headerMeta }, `Kerf (sierra): ${kerf} mm`),
    React.createElement(Text, { style: cutStyles.headerMeta }, `Desperdicio estimado: ${wastePercent}%`),
    React.createElement(Text, { style: cutStyles.headerMeta }, 'Tablero estándar: 2440 × 1220 mm'),
  )

  const footer = React.createElement(
    View,
    { style: cutStyles.footerFixed, fixed: true },
    React.createElement(Text, { style: cutStyles.footerText }, 'Furniture Studio'),
    React.createElement(
      Text,
      {
        style: cutStyles.footerText,
        render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          `Página ${pageNumber} de ${totalPages}`,
      },
    ),
  )

  if (isEmpty) {
    return React.createElement(
      Document,
      { title: 'Lista de Corte', author: 'Furniture Studio' },
      React.createElement(
        Page,
        { size: 'A4', style: cutStyles.page },
        headerSection,
        React.createElement(PdfSectionTitle, { text: 'Sin datos calculados' }),
        React.createElement(
          Text,
          { style: { fontSize: 10, color: PDF_COLORS.slate } },
          'Configura los muebles para generar la lista de corte.',
        ),
        footer,
      ),
    )
  }

  const allPages: React.ReactElement[] = []

  for (const furniture of furnitures) {
    if (!furniture.result) continue
    const { groups } = furniture.result.cutList
    if (groups.length === 0) continue

    const groupSections = groups.map(g => buildGroupSection(g))

    const furniturePage = React.createElement(
      Page,
      { size: 'A4', style: cutStyles.page },
      headerSection,
      furnitures.length > 1
        ? React.createElement(PdfSectionTitle, { text: furniture.name })
        : null,
      ...groupSections,
      footer,
    )
    allPages.push(furniturePage)
  }

  return React.createElement(
    Document,
    { title: 'Lista de Corte', author: 'Furniture Studio' },
    ...allPages,
  )
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera y descarga un PDF de lista de corte.
 * @param project      — Proyecto activo
 * @param furnitureId  — Si se provee, genera PDF solo de ese mueble; si es undefined, todos
 * @param kerf         — Kerf de sierra en mm (default 3)
 * @param wastePercent — Porcentaje de desperdicio (default 10)
 */
export async function generateCutListPDF(
  project: Project,
  furnitureId?: string,
  kerf: number = 3,
  wastePercent: number = 10,
): Promise<void> {
  const date = formatDate(project.updatedAt)
  const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_')

  let furnitures: Furniture[]
  let furnitureName: string | undefined

  if (furnitureId) {
    const f = project.furnitures.find(furn => furn.id === furnitureId)
    if (!f) throw new Error(`Mueble con id ${furnitureId} no encontrado`)
    furnitures = [f]
    furnitureName = f.name
  } else {
    furnitures = project.furnitures
  }

  const doc = buildCutListDoc(
    furnitures,
    project.name,
    date,
    kerf,
    wastePercent,
    furnitureName,
  )

  // Cast necesario: React.createElement retorna ReactElement<unknown> pero pdf() espera ReactElement<DocumentProps>
  const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob()
  downloadBlob(blob, `${safeProjectName}_lista_corte.pdf`)
}
