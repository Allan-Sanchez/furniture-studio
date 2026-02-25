// ============================================================
// FURNITURE STUDIO — engine/bom-cutlist-cost.test.ts
// Unit tests de BOM, CutList y Cost
// ============================================================

import { describe, it, expect } from 'vitest'
import { generateBOM, consolidateBOMs } from './bom'
import { generateCutList } from './cutlist'
import { calculateCost, consolidateCosts } from './cost'
import type { Part, HardwareItem, MaterialMap, FinishMap, BOM } from './types'

// ─── Fixtures ────────────────────────────────────────────────

const MAT_MAP: MaterialMap = {
  mdf_18: {
    id: 'mdf_18',
    name: { es: 'MDF 18mm', en: 'MDF 18mm' },
    type: 'mdf',
    standardThicknesses: [18],
    density: 700,
    pricePerSqm: 12.0,
    standardSheetWidth: 1220,
    standardSheetLength: 2440,
  },
  hdf_6: {
    id: 'hdf_6',
    name: { es: 'HDF 6mm', en: 'HDF 6mm' },
    type: 'hdf',
    standardThicknesses: [6],
    density: 900,
    pricePerSqm: 6.0,
    standardSheetWidth: 1220,
    standardSheetLength: 2440,
  },
}

const FINISH_MAP: FinishMap = {
  raw: {
    id: 'raw',
    name: { es: 'Sin acabado', en: 'Raw' },
    colorHex: '#D2B48C',
    commercialName: 'Natural',
  },
  white: {
    id: 'white',
    name: { es: 'Blanco', en: 'White' },
    colorHex: '#FFFFFF',
    commercialName: 'Blanco Polar',
  },
}

const SAMPLE_PARTS: Part[] = [
  {
    id: 'f1_p001',
    furnitureId: 'f1',
    label: 'Lateral',
    length: 600,
    width: 2400,
    thickness: 18,
    quantity: 2,
    materialId: 'mdf_18',
    finishId: 'white',
    grain: 'along',
  },
  {
    id: 'f1_p002',
    furnitureId: 'f1',
    label: 'Tapa superior',
    length: 600,
    width: 1164,
    thickness: 18,
    quantity: 1,
    materialId: 'mdf_18',
    finishId: 'white',
    grain: 'across',
  },
  {
    id: 'f1_p003',
    furnitureId: 'f1',
    label: 'Fondo cajón',
    length: 550,
    width: 1160,
    thickness: 6,
    quantity: 1,
    materialId: 'hdf_6',
    finishId: 'raw',
    grain: 'along',
  },
]

const SAMPLE_HARDWARE: HardwareItem[] = [
  {
    id: 'f1_hw001',
    furnitureId: 'f1',
    type: 'hinge',
    description: { es: 'Bisagra 35mm', en: 'Hinge 35mm' },
    quantity: 4,
    unitPrice: 1.5,
    source: 'auto',
  },
  {
    id: 'f1_hw002',
    furnitureId: 'f1',
    type: 'handle',
    description: { es: 'Jalador', en: 'Handle' },
    quantity: 2,
    unitPrice: 4.0,
    source: 'auto',
  },
]

// ─── Tests: generateBOM ───────────────────────────────────────

describe('generateBOM', () => {
  it('genera BOM con furnitureId correcto', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.furnitureId).toBe('f1')
  })

  it('la cantidad de items de partes coincide', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.parts).toHaveLength(SAMPLE_PARTS.length)
  })

  it('la cantidad de items de herrajes coincide', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.hardware).toHaveLength(SAMPLE_HARDWARE.length)
  })

  it('el área de los laterales es correcta', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    const lateralItem = bom.parts.find(p => p.label === 'Lateral')!
    // 600 × 2400 × 2 / 1_000_000 = 2.88 m²
    expect(lateralItem.areaSqm).toBeCloseTo(2.88, 3)
  })

  it('el subtotal de materiales es positivo', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.totalMaterials).toBeGreaterThan(0)
  })

  it('el subtotal de herrajes es positivo', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.totalHardware).toBeGreaterThan(0)
  })

  it('grandTotal = totalMaterials + totalHardware', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    expect(bom.grandTotal).toBeCloseTo(bom.totalMaterials + bom.totalHardware, 2)
  })

  it('los subtotales de herrajes son correctos', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    const hinge = bom.hardware.find(h => h.description === 'Bisagra 35mm')!
    expect(hinge.subtotal).toBeCloseTo(4 * 1.5, 2) // 6.0
  })

  it('materialName se resuelve con el idioma correcto', () => {
    const bomEs = generateBOM('f1', SAMPLE_PARTS, [], MAT_MAP, FINISH_MAP, 'es')
    const bomEn = generateBOM('f1', SAMPLE_PARTS, [], MAT_MAP, FINISH_MAP, 'en')
    const esName = bomEs.parts.find(p => p.materialId === 'mdf_18')!.materialName
    const enName = bomEn.parts.find(p => p.materialId === 'mdf_18')!.materialName
    expect(esName).toBe('MDF 18mm')
    expect(enName).toBe('MDF 18mm')
  })

  it('con mapa de materiales vacío los precios son 0', () => {
    const bom = generateBOM('f1', SAMPLE_PARTS, [], {}, {})
    expect(bom.totalMaterials).toBe(0)
  })
})

// ─── Tests: consolidateBOMs ───────────────────────────────────

describe('consolidateBOMs', () => {
  it('consolida dos BOMs en una con furnitureId=project', () => {
    const bom1 = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    const bom2 = generateBOM('f2', SAMPLE_PARTS, [], MAT_MAP, FINISH_MAP)
    const consolidated = consolidateBOMs([bom1, bom2])
    expect(consolidated.furnitureId).toBe('project')
    expect(consolidated.parts).toHaveLength(bom1.parts.length + bom2.parts.length)
  })

  it('el grandTotal consolidado es la suma de los individuales', () => {
    const bom1 = generateBOM('f1', SAMPLE_PARTS, SAMPLE_HARDWARE, MAT_MAP, FINISH_MAP)
    const bom2 = generateBOM('f2', SAMPLE_PARTS, [], MAT_MAP, FINISH_MAP)
    const consolidated = consolidateBOMs([bom1, bom2])
    expect(consolidated.grandTotal).toBeCloseTo(bom1.grandTotal + bom2.grandTotal, 2)
  })
})

// ─── Tests: generateCutList ───────────────────────────────────

describe('generateCutList', () => {
  it('genera grupos agrupados por material+grosor', () => {
    const cutList = generateCutList('f1', SAMPLE_PARTS, MAT_MAP)
    // mdf_18 + hdf_6 = 2 grupos
    expect(cutList.groups).toHaveLength(2)
  })

  it('cada grupo tiene sheetsNeeded ≥ 1', () => {
    const cutList = generateCutList('f1', SAMPLE_PARTS, MAT_MAP)
    for (const group of cutList.groups) {
      expect(group.sheetsNeeded).toBeGreaterThanOrEqual(1)
    }
  })

  it('el total de items en todos los grupos suma al total de parts', () => {
    const cutList = generateCutList('f1', SAMPLE_PARTS, MAT_MAP)
    const totalItems = cutList.groups.reduce((s, g) => s + g.items.length, 0)
    expect(totalItems).toBe(SAMPLE_PARTS.length)
  })

  it('sheetsNeeded incluye factor de desperdicio', () => {
    // Pieza que ocupa exactamente 1 tablero estándar sin desperdicio:
    // 2440 × 1220 = 2.9768 m²; con desperdicio 10% → 2 hojas
    const bigPart: Part = {
      id: 'bp1',
      furnitureId: 'f1',
      label: 'Panel grande',
      length: 2440,
      width: 1220,
      thickness: 18,
      quantity: 1,
      materialId: 'mdf_18',
      finishId: 'raw',
      grain: 'along',
    }
    const cutList = generateCutList('f1', [bigPart], MAT_MAP)
    const group = cutList.groups[0]
    // 1 tablero × 1.10 de desperdicio → Math.ceil(1.10) = 2 tableros
    expect(group.sheetsNeeded).toBe(2)
  })

  it('furnitureId en CutList coincide', () => {
    const cutList = generateCutList('f1', SAMPLE_PARTS, MAT_MAP)
    expect(cutList.furnitureId).toBe('f1')
  })
})

// ─── Tests: calculateCost ─────────────────────────────────────

describe('calculateCost', () => {
  const BOM_SAMPLE: BOM = {
    furnitureId: 'f1',
    parts: [],
    hardware: [],
    totalMaterials: 100.0,
    totalHardware: 30.0,
    grandTotal: 130.0,
  }

  it('subtotal = totalMaterials + totalHardware', () => {
    const cost = calculateCost('f1', BOM_SAMPLE, 30)
    expect(cost.subtotal).toBeCloseTo(130.0, 2)
  })

  it('salePrice = subtotal × (1 + margin/100)', () => {
    const cost = calculateCost('f1', BOM_SAMPLE, 30)
    expect(cost.salePrice).toBeCloseTo(130 * 1.30, 2)
  })

  it('con margen 0 el salePrice es igual al subtotal', () => {
    const cost = calculateCost('f1', BOM_SAMPLE, 0)
    expect(cost.salePrice).toBeCloseTo(cost.subtotal, 2)
  })

  it('profitMargin se preserva en el resultado', () => {
    const cost = calculateCost('f1', BOM_SAMPLE, 45)
    expect(cost.profitMargin).toBe(45)
  })
})

// ─── Tests: consolidateCosts ──────────────────────────────────

describe('consolidateCosts', () => {
  it('el subtotal consolidado es la suma de subtotales individuales', () => {
    const c1 = calculateCost('f1', { furnitureId: 'f1', parts: [], hardware: [], totalMaterials: 100, totalHardware: 20, grandTotal: 120 }, 30)
    const c2 = calculateCost('f2', { furnitureId: 'f2', parts: [], hardware: [], totalMaterials: 200, totalHardware: 50, grandTotal: 250 }, 30)
    const consolidated = consolidateCosts([c1, c2], 30)
    expect(consolidated.subtotal).toBeCloseTo(c1.subtotal + c2.subtotal, 2)
  })

  it('furnitureId consolidado = project', () => {
    const c1 = calculateCost('f1', { furnitureId: 'f1', parts: [], hardware: [], totalMaterials: 100, totalHardware: 20, grandTotal: 120 }, 30)
    const consolidated = consolidateCosts([c1], 30)
    expect(consolidated.furnitureId).toBe('project')
  })
})
