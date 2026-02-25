// ============================================================
// FURNITURE STUDIO — engine/cutlist.ts
// Lista de cortes — agrupada por material y tablero estándar
// TypeScript PURO — sin imports de React ni del DOM
// ============================================================
// Tablero estándar: 2440 × 1220 mm
// El algoritmo calcula cuántos tableros se necesitan por grupo de material+grosor
// usando un estimado por área (sin optimización de nesting en MVP).
// ============================================================

import type {
  Part,
  CutList,
  CutListItem,
  SheetGroup,
  MaterialMap,
} from './types'

// ─── Constantes ─────────────────────────────────────────────

const SHEET_LENGTH = 2440  // mm
const SHEET_WIDTH  = 1220  // mm
const SHEET_AREA_SQM = (SHEET_LENGTH * SHEET_WIDTH) / 1_000_000  // 2.9768 m²
const WASTE_FACTOR = 1.10  // 10% de desperdicio estándar MVP

// ─── Helpers ─────────────────────────────────────────────────

/** Clave de agrupación: materialId + grosor */
function groupKey(materialId: string, thickness: number): string {
  return `${materialId}__${thickness}`
}

/** Nombre del material con fallback al ID */
function materialName(materialId: string, materialMap: MaterialMap, lang: 'es' | 'en' = 'es'): string {
  return materialMap[materialId]?.name[lang] ?? materialId
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera la lista de cortes agrupada por material y grosor.
 * Cada grupo indica cuántos tableros estándar (2440×1220) se necesitan.
 *
 * @param furnitureId  — ID del mueble
 * @param parts        — Piezas generadas por el motor
 * @param materialMap  — Catálogo de materiales (para nombres)
 * @param lang         — Idioma para los nombres
 * @returns            — CutList con grupos por material/grosor
 */
export function generateCutList(
  furnitureId: string,
  parts: Part[],
  materialMap: MaterialMap,
  lang: 'es' | 'en' = 'es',
): CutList {
  // ── Agrupar piezas por materialId + thickness ──────────
  const groupsMap = new Map<string, { materialId: string; thickness: number; items: CutListItem[] }>()

  let labelCounter = 0

  for (const part of parts) {
    const key = groupKey(part.materialId, part.thickness)
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        materialId: part.materialId,
        thickness: part.thickness,
        items: [],
      })
    }

    labelCounter++
    const label = String.fromCharCode(65 + Math.floor((labelCounter - 1) / 26)) +
      String(((labelCounter - 1) % 26) + 1)

    groupsMap.get(key)!.items.push({
      label,
      partLabel: part.label,
      length: part.length,
      width: part.width,
      thickness: part.thickness,
      quantity: part.quantity,
      materialId: part.materialId,
      grain: part.grain,
      sheetIndex: 0, // MVP: sin asignación de hoja específica
    })
  }

  // ── Calcular tableros necesarios por grupo ─────────────
  const groups: SheetGroup[] = []

  for (const [, group] of groupsMap) {
    const totalAreaSqm = group.items.reduce(
      (sum, item) => sum + (item.length * item.width * item.quantity) / 1_000_000,
      0,
    )

    const areaWithWaste = totalAreaSqm * WASTE_FACTOR
    const sheetsNeeded = Math.ceil(areaWithWaste / SHEET_AREA_SQM)

    groups.push({
      materialId: group.materialId,
      materialName: materialName(group.materialId, materialMap, lang),
      thickness: group.thickness,
      sheetsNeeded,
      items: group.items,
      totalAreaSqm: Math.round(totalAreaSqm * 10000) / 10000,
    })
  }

  // Ordenar grupos: primero por materialId, luego por grosor descendente
  groups.sort((a, b) => {
    if (a.materialId !== b.materialId) return a.materialId.localeCompare(b.materialId)
    return b.thickness - a.thickness
  })

  return {
    furnitureId,
    groups,
  }
}

export { SHEET_LENGTH, SHEET_WIDTH, SHEET_AREA_SQM, WASTE_FACTOR }
