// ============================================================
// FURNITURE STUDIO — engine/bom.ts
// Generación de la Lista de Materiales (BOM)
// TypeScript PURO — sin imports de React ni del DOM
// ============================================================

import type {
  Part,
  HardwareItem,
  BOM,
  BOMItem,
  BOMHardwareItem,
  MaterialMap,
  FinishMap,
} from './types'

// ─── Helpers ─────────────────────────────────────────────────

/** Área en m² de una pieza: largo × ancho × cantidad / 1_000_000 */
function partAreaSqm(part: Part): number {
  return (part.length * part.width * part.quantity) / 1_000_000
}

/** Precio por m² de un material — devuelve 0 si no se encuentra */
function materialPricePerSqm(materialId: string, materialMap: MaterialMap): number {
  return materialMap[materialId]?.pricePerSqm ?? 0
}

/** Nombre localizado del material — fallback al ID */
function materialName(materialId: string, materialMap: MaterialMap, lang: 'es' | 'en' = 'es'): string {
  const mat = materialMap[materialId]
  if (!mat) return materialId
  return mat.name[lang]
}

/** Nombre localizado del acabado — fallback al ID */
function finishName(finishId: string, finishMap: FinishMap, lang: 'es' | 'en' = 'es'): string {
  const fin = finishMap[finishId]
  if (!fin) return finishId
  return fin.name[lang]
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera la BOM completa de un mueble a partir de sus piezas y herrajes.
 *
 * @param furnitureId  — ID del mueble
 * @param parts        — Piezas generadas por el motor
 * @param hardware     — Herrajes inferidos por hardware.ts
 * @param materialMap  — Catálogo de materiales (para precios y nombres)
 * @param finishMap    — Catálogo de acabados (para nombres)
 * @param lang         — Idioma para los nombres ('es' | 'en')
 * @returns            — BOM completa con subtotales y gran total
 */
export function generateBOM(
  furnitureId: string,
  parts: Part[],
  hardware: HardwareItem[],
  materialMap: MaterialMap,
  finishMap: FinishMap,
  lang: 'es' | 'en' = 'es',
): BOM {
  // ── Items de materiales (piezas) ──────────────────────────
  const bomParts: BOMItem[] = parts.map(part => {
    const areaSqm = partAreaSqm(part)
    const unitPrice = materialPricePerSqm(part.materialId, materialMap)
    const subtotal = areaSqm * unitPrice

    return {
      partId: part.id,
      label: part.label,
      quantity: part.quantity,
      length: part.length,
      width: part.width,
      thickness: part.thickness,
      areaSqm: Math.round(areaSqm * 10000) / 10000, // 4 decimales
      materialId: part.materialId,
      materialName: materialName(part.materialId, materialMap, lang),
      finishName: finishName(part.finishId, finishMap, lang),
      unitPrice,
      subtotal: Math.round(subtotal * 100) / 100, // 2 decimales
    }
  })

  // ── Items de herrajes ────────────────────────────────────
  const bomHardware: BOMHardwareItem[] = hardware.map(hw => ({
    hardwareId: hw.id,
    description: hw.description[lang],
    quantity: hw.quantity,
    unitPrice: hw.unitPrice,
    subtotal: Math.round(hw.quantity * hw.unitPrice * 100) / 100,
  }))

  // ── Totales ──────────────────────────────────────────────
  const totalMaterials = bomParts.reduce((sum, item) => sum + item.subtotal, 0)
  const totalHardware = bomHardware.reduce((sum, item) => sum + item.subtotal, 0)
  const grandTotal = Math.round((totalMaterials + totalHardware) * 100) / 100

  return {
    furnitureId,
    parts: bomParts,
    hardware: bomHardware,
    totalMaterials: Math.round(totalMaterials * 100) / 100,
    totalHardware: Math.round(totalHardware * 100) / 100,
    grandTotal,
  }
}

/**
 * Consolida múltiples BOM de distintos muebles en una sola.
 * Útil para la vista consolidada del proyecto.
 *
 * @param boms — Array de BOM por mueble
 * @returns    — BOM consolidada con furnitureId='project'
 */
export function consolidateBOMs(boms: BOM[]): BOM {
  const allParts: BOMItem[] = boms.flatMap(b => b.parts)
  const allHardware: BOMHardwareItem[] = boms.flatMap(b => b.hardware)

  const totalMaterials = allParts.reduce((s, i) => s + i.subtotal, 0)
  const totalHardware = allHardware.reduce((s, i) => s + i.subtotal, 0)

  return {
    furnitureId: 'project',
    parts: allParts,
    hardware: allHardware,
    totalMaterials: Math.round(totalMaterials * 100) / 100,
    totalHardware: Math.round(totalHardware * 100) / 100,
    grandTotal: Math.round((totalMaterials + totalHardware) * 100) / 100,
  }
}
