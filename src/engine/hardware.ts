// ============================================================
// FURNITURE STUDIO — engine/hardware.ts
// Inferencia automática de herrajes para el ropero
// TypeScript PURO — sin imports de React
// ============================================================
// Reglas de inferencia:
//  - Por cada módulo drawer → 1 corredera (par) + 1 jalador
//  - Por cada módulo hinged_door → 2 bisagras por puerta + 1 jalador por puerta
//  - Por cada módulo sliding_door → 1 kit de riel corredero
//  - Por cada módulo hanging_rail → 1 barra + 2 soportes
//  - Por cada shelf (adjustable) → 4 pines regulables por estante
// ============================================================

import type {
  HardwareItem,
  HardwareType,
  Module,
  ModuleType,
  WardrobeParams,
  DrawerModuleParams,
  HingedDoorModuleParams,
  SlidingDoorModuleParams,
  ShelfModuleParams,
} from './types'

// ─── Precios de referencia (USD) — se sobreescriben con data/hardware.ts ────

const DEFAULT_PRICES: Record<HardwareType, number> = {
  hinge: 1.5,
  drawer_slide: 8.0,
  handle: 4.0,
  shelf_pin: 0.25,
  hanging_rail_support: 3.5,
  sliding_door_rail: 25.0,
  lock: 6.0,
  other: 2.0,
}

// ─── Helper ─────────────────────────────────────────────────

let _hwCounter = 0

function resetHwCounter() {
  _hwCounter = 0
}

function makeHardware(
  furnitureId: string,
  type: HardwareType,
  descEs: string,
  descEn: string,
  quantity: number,
  unitPrice?: number,
): HardwareItem {
  _hwCounter++
  return {
    id: `${furnitureId}_hw${String(_hwCounter).padStart(3, '0')}`,
    furnitureId,
    type,
    description: { es: descEs, en: descEn },
    quantity,
    unitPrice: unitPrice ?? DEFAULT_PRICES[type],
    source: 'auto',
  }
}

// ─── Inferencia por tipo de módulo ───────────────────────────

function inferDrawerHardware(
  furnitureId: string,
  mod: Module,
  _params: WardrobeParams,
): HardwareItem[] {
  const dp = mod.params as DrawerModuleParams
  const items: HardwareItem[] = []

  // Corredera (par) — 1 par por cajón
  items.push(makeHardware(
    furnitureId,
    'drawer_slide',
    `Corredera cajón ${dp.slideType === 'soft_close' ? 'cierre suave' : 'básica'}`,
    `Drawer slide ${dp.slideType === 'soft_close' ? 'soft-close' : 'basic'}`,
    1,
    dp.slideType === 'soft_close' ? 15.0 : 8.0,
  ))

  // Jalador — 1 por cajón
  items.push(makeHardware(
    furnitureId,
    'handle',
    'Jalador cajón',
    'Drawer handle',
    1,
  ))

  return items
}

function inferHingedDoorHardware(
  furnitureId: string,
  mod: Module,
): HardwareItem[] {
  const hp = mod.params as HingedDoorModuleParams
  const items: HardwareItem[] = []

  // 2 bisagras por puerta
  items.push(makeHardware(
    furnitureId,
    'hinge',
    'Bisagra de cazoleta 35mm',
    'Cup hinge 35mm',
    hp.count * 2,
  ))

  // 1 jalador por puerta
  items.push(makeHardware(
    furnitureId,
    'handle',
    'Jalador puerta',
    'Door handle',
    hp.count,
  ))

  return items
}

function inferSlidingDoorHardware(
  furnitureId: string,
  mod: Module,
  params: WardrobeParams,
): HardwareItem[] {
  const sp = mod.params as SlidingDoorModuleParams
  const items: HardwareItem[] = []

  // Kit de riel (superior + inferior) — precio incluye ambos rieles
  // El largo del riel = totalWidth del ropero
  const railLengthM = params.totalWidth / 1000
  items.push(makeHardware(
    furnitureId,
    'sliding_door_rail',
    `Kit riel corredero ${sp.panelCount} paneles (${params.totalWidth}mm)`,
    `Sliding door rail kit ${sp.panelCount} panels (${params.totalWidth}mm)`,
    1,
    25.0 + railLengthM * 8.0,  // base + por metro lineal
  ))

  return items
}

function inferHangingRailHardware(
  furnitureId: string,
  _mod: Module,
  params: WardrobeParams,
): HardwareItem[] {
  const items: HardwareItem[] = []
  const t = params.boardThickness
  const innerWidth = params.totalWidth - 2 * t

  // Barra de colgar (aluminio, por metro lineal)
  const railLengthM = innerWidth / 1000
  items.push(makeHardware(
    furnitureId,
    'other',
    `Barra colgar ropa ${innerWidth}mm`,
    `Clothing hanging rail ${innerWidth}mm`,
    1,
    railLengthM * 6.0,
  ))

  // Soportes de barra — 2 extremos + 1 central si > 1200mm
  const supportCount = innerWidth > 1200 ? 3 : 2
  items.push(makeHardware(
    furnitureId,
    'hanging_rail_support',
    'Soporte barra colgar',
    'Hanging rail bracket',
    supportCount,
  ))

  return items
}

function inferShelfHardware(
  furnitureId: string,
  mod: Module,
): HardwareItem[] {
  const sp = mod.params as ShelfModuleParams
  if (!sp.adjustable) return []

  // 4 pines por estante ajustable
  return [
    makeHardware(
      furnitureId,
      'shelf_pin',
      'Pin regulable estante 5mm',
      'Adjustable shelf pin 5mm',
      sp.count * 4,
    ),
  ]
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Infiere automáticamente los herrajes necesarios para un ropero
 * según sus módulos internos.
 *
 * @param furnitureId  — ID del mueble
 * @param params       — WardrobeParams
 * @param modules      — Lista de módulos internos
 * @returns            — Array de HardwareItem[] con source='auto'
 */
export function inferWardrobeHardware(
  furnitureId: string,
  params: WardrobeParams,
  modules: Module[],
): HardwareItem[] {
  resetHwCounter()

  const result: HardwareItem[] = []

  for (const mod of modules) {
    switch (mod.type as ModuleType) {
      case 'drawer':
        result.push(...inferDrawerHardware(furnitureId, mod, params))
        break
      case 'hinged_door':
        result.push(...inferHingedDoorHardware(furnitureId, mod))
        break
      case 'sliding_door':
        result.push(...inferSlidingDoorHardware(furnitureId, mod, params))
        break
      case 'hanging_rail':
        result.push(...inferHangingRailHardware(furnitureId, mod, params))
        break
      case 'shelf':
        result.push(...inferShelfHardware(furnitureId, mod))
        break
      case 'vertical_divider':
      case 'socle':
        // No generan herrajes automáticos
        break
    }
  }

  return result
}

export { DEFAULT_PRICES }
