// ============================================================
// FURNITURE STUDIO — engine/cost.ts
// Cálculo de costos y cotización
// TypeScript PURO — sin imports de React ni del DOM
// ============================================================

import type { BOM, CostSummary } from './types'

/**
 * Calcula el costo y precio de venta de un mueble a partir de su BOM.
 *
 * @param furnitureId  — ID del mueble
 * @param bom          — BOM del mueble (con subtotales calculados)
 * @param profitMargin — Margen de ganancia en porcentaje (ej: 30 = 30%)
 * @returns            — CostSummary con materialsCost, hardwareCost, subtotal y salePrice
 */
export function calculateCost(
  furnitureId: string,
  bom: BOM,
  profitMargin: number,
): CostSummary {
  const materialsCost = Math.round(bom.totalMaterials * 100) / 100
  const hardwareCost = Math.round(bom.totalHardware * 100) / 100
  const subtotal = Math.round((materialsCost + hardwareCost) * 100) / 100
  const salePrice = Math.round(subtotal * (1 + profitMargin / 100) * 100) / 100

  return {
    furnitureId,
    materialsCost,
    hardwareCost,
    subtotal,
    profitMargin,
    salePrice,
  }
}

/**
 * Calcula el costo consolidado de un proyecto (suma de todos sus muebles).
 *
 * @param costs        — Array de CostSummary por mueble
 * @param profitMargin — Margen de ganancia a aplicar al total
 * @returns            — CostSummary consolidado con furnitureId='project'
 */
export function consolidateCosts(
  costs: CostSummary[],
  profitMargin: number,
): CostSummary {
  const materialsCost = costs.reduce((s, c) => s + c.materialsCost, 0)
  const hardwareCost = costs.reduce((s, c) => s + c.hardwareCost, 0)
  const subtotal = materialsCost + hardwareCost
  const salePrice = Math.round(subtotal * (1 + profitMargin / 100) * 100) / 100

  return {
    furnitureId: 'project',
    materialsCost: Math.round(materialsCost * 100) / 100,
    hardwareCost: Math.round(hardwareCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    profitMargin,
    salePrice,
  }
}
