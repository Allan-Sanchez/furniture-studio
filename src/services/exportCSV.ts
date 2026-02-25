// ============================================================
// FURNITURE STUDIO — services/exportCSV.ts
// Exportación de BOM y CutList en formato CSV
// ============================================================

import type { BOM, CutList } from '@/engine/types'

// ─── Helpers ─────────────────────────────────────────────────

/** Escapa un valor para CSV: envuelve en comillas si contiene coma, comilla o salto de línea */
function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Une un array de celdas en una fila CSV */
function csvRow(cells: (string | number)[]): string {
  return cells.map(escapeCSV).join(',')
}

/** Descarga un string como archivo CSV con BOM UTF-8 */
function downloadCSV(content: string, filename: string): void {
  // BOM UTF-8 para compatibilidad con Excel
  const bom = '\uFEFF'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// ─── Export BOM ───────────────────────────────────────────────

/**
 * Genera y descarga la BOM como CSV.
 * Incluye sección de piezas de material y sección de herrajes.
 *
 * @param bom      — BOM del mueble generada por el motor
 * @param filename — Nombre del archivo (por defecto: "bom-export.csv")
 */
export function exportBOMAsCSV(bom: BOM, filename = 'bom-export.csv'): void {
  const lines: string[] = []

  // ── Encabezado sección piezas ────────────────────────────
  lines.push(csvRow([
    'Código',
    'Pieza',
    'Cantidad',
    'Largo(mm)',
    'Ancho(mm)',
    'Esp(mm)',
    'Área(m²)',
    'Material',
    'Precio unit',
    'Subtotal',
  ]))

  // ── Filas de piezas ──────────────────────────────────────
  for (const item of bom.parts) {
    lines.push(csvRow([
      item.partId,
      item.label,
      item.quantity,
      item.length,
      item.width,
      item.thickness,
      item.areaSqm,
      item.materialName,
      item.unitPrice,
      item.subtotal,
    ]))
  }

  // ── Subtotal materiales ──────────────────────────────────
  lines.push('')
  lines.push(csvRow(['', '', '', '', '', '', '', '', 'TOTAL MATERIALES', bom.totalMaterials]))

  // ── Sección herrajes ─────────────────────────────────────
  lines.push('')
  lines.push(csvRow(['HERRAJES', '', '', '', '', '', '', '', '', '']))
  lines.push(csvRow([
    'ID Herraje',
    'Descripción',
    'Cantidad',
    '',
    '',
    '',
    '',
    '',
    'Precio unit',
    'Subtotal',
  ]))

  for (const hw of bom.hardware) {
    lines.push(csvRow([
      hw.hardwareId,
      hw.description,
      hw.quantity,
      '',
      '',
      '',
      '',
      '',
      hw.unitPrice,
      hw.subtotal,
    ]))
  }

  // ── Subtotal herrajes y gran total ───────────────────────
  lines.push('')
  lines.push(csvRow(['', '', '', '', '', '', '', '', 'TOTAL HERRAJES', bom.totalHardware]))
  lines.push(csvRow(['', '', '', '', '', '', '', '', 'GRAN TOTAL', bom.grandTotal]))

  downloadCSV(lines.join('\n'), filename)
}

// ─── Export CutList ───────────────────────────────────────────

/**
 * Genera y descarga la lista de cortes como CSV, agrupada por material y grosor.
 *
 * @param cutList  — CutList generada por el motor
 * @param filename — Nombre del archivo (por defecto: "cutlist-export.csv")
 */
export function exportCutListAsCSV(cutList: CutList, filename = 'cutlist-export.csv'): void {
  const lines: string[] = []

  for (const group of cutList.groups) {
    // ── Encabezado del grupo ─────────────────────────────
    lines.push(csvRow([
      `Material: ${group.materialName}`,
      `Grosor: ${group.thickness}mm`,
      `Tableros necesarios: ${group.sheetsNeeded}`,
      `Área total: ${group.totalAreaSqm}m²`,
    ]))

    // ── Headers de columna ───────────────────────────────
    lines.push(csvRow([
      'Código',
      'Pieza',
      'Largo(mm)',
      'Ancho(mm)',
      'Cant',
      'Veta',
    ]))

    // ── Items del grupo ──────────────────────────────────
    for (const item of group.items) {
      lines.push(csvRow([
        item.label,
        item.partLabel,
        item.length,
        item.width,
        item.quantity,
        item.grain,
      ]))
    }

    lines.push('') // línea en blanco entre grupos
  }

  downloadCSV(lines.join('\n'), filename)
}
