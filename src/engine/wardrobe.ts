// ============================================================
// FURNITURE STUDIO — engine/wardrobe.ts
// Motor paramétrico del ropero — TypeScript PURO, sin React
// ============================================================
// Función principal: generateWardrobe(params, modules, materialMap) → Part[]
// Las piezas se expresan en milímetros. El resultado es determinístico.
// ============================================================

import type {
  WardrobeParams,
  Module,
  ModuleType,
  Part,
  MaterialMap,
  ShelfModuleParams,
  DrawerModuleParams,
  HingedDoorModuleParams,
  SlidingDoorModuleParams,
  VerticalDividerModuleParams,
  SocleModuleParams,
  GrainDirection,
} from './types'

// ─── Constantes de construcción ─────────────────────────────

const STANDARD_SHEET_WIDTH = 1220   // mm
const STANDARD_SHEET_LENGTH = 2440  // mm

/** Grosor del panel trasero por defecto si no se especifica */
const DEFAULT_BACK_THICKNESS = 6 // mm

/** Material por defecto si no hay materialId en un módulo */
const DEFAULT_MATERIAL_ID = 'mdf_18'

/** Acabado por defecto (sin acabado específico) */
const DEFAULT_FINISH_ID = 'raw'

// ─── Helpers internos ────────────────────────────────────────

let _partCounter = 0

/** Reinicia el contador de piezas (llamado al inicio de cada generación) */
function resetCounter() {
  _partCounter = 0
}

/** Genera un ID de pieza secuencial y determinístico dentro de un mueble */
function nextPartId(furnitureId: string): string {
  _partCounter++
  return `${furnitureId}_p${String(_partCounter).padStart(3, '0')}`
}

/** Crea una pieza con valores por defecto aplicados */
function makePart(
  furnitureId: string,
  overrides: Partial<Part> & Pick<Part, 'label' | 'length' | 'width' | 'thickness' | 'quantity'>,
): Part {
  return {
    id: nextPartId(furnitureId),
    furnitureId,
    grain: 'along' as GrainDirection,
    materialId: DEFAULT_MATERIAL_ID,
    finishId: DEFAULT_FINISH_ID,
    moduleId: undefined,
    ...overrides,
  }
}

/** Resuelve el materialId de un módulo — usa el del módulo o el fallback global */
function resolveMatId(moduleMatId: string | undefined, fallback: string): string {
  if (moduleMatId && moduleMatId.trim() !== '') return moduleMatId
  return fallback
}

// ─── Tipo para el contexto de generación ────────────────────

export interface WardrobeContext {
  furnitureId: string
  p: WardrobeParams
  globalMaterialId: string
  globalFinishId: string
  materialMap: MaterialMap
}

// ─── Cuerpo base del ropero ──────────────────────────────────
// Genera: lateral izquierdo, lateral derecho, top, bottom, panel trasero
// y opcionalmente el zócalo frontal.
//
// Convención de dimensiones:
//   totalWidth  = ancho exterior (incluyendo los dos laterales)
//   totalHeight = alto exterior total (desde zócalo inferior, si aplica, hasta top)
//   totalDepth  = profundidad exterior
//   boardThickness (t) = grosor de tablero estructural (laterales, top, bottom)
//
// El fondo cubre toda la altura interior neta:
//   backHeight = totalHeight - boardThickness (top) - boardThickness (bottom)
//   backWidth  = totalWidth  - 2 × boardThickness (laterales)

function generateShell(ctx: WardrobeContext): Part[] {
  const { furnitureId, p, globalMaterialId, globalFinishId } = ctx
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0

  // Dimensiones interiores netas
  const innerWidth = p.totalWidth - 2 * t
  const innerHeight = p.totalHeight - 2 * t

  // Zócalo reduce la altura disponible desde abajo
  const socleH = p.hasSocle ? p.socleHeight : 0

  // ── Laterales ────────────────────────────────────────────
  // Dimensión: profundidad × alto total (corren de suelo a techo)
  const sidePanel = (): Part => makePart(furnitureId, {
    label: 'Lateral',
    length: p.totalDepth,
    width: p.totalHeight,
    thickness: t,
    quantity: 2,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'along',
  })

  // ── Top (tapa superior) ──────────────────────────────────
  // Va entre los dos laterales (embutida)
  const topPanel = (): Part => makePart(furnitureId, {
    label: 'Tapa superior',
    length: p.totalDepth,
    width: innerWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  })

  // ── Bottom (piso inferior) ───────────────────────────────
  // Va entre los dos laterales, sobre el zócalo
  const bottomPanel = (): Part => makePart(furnitureId, {
    label: 'Piso inferior',
    length: p.totalDepth,
    width: innerWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  })

  // ── Panel trasero ────────────────────────────────────────
  // Cubre todo el ancho interior y la altura interior neta
  const backPanel = (): Part => makePart(furnitureId, {
    label: 'Panel trasero',
    length: innerWidth,
    width: innerHeight,
    thickness: bt,
    quantity: 1,
    materialId: resolveMatId(undefined, 'hdf_6'),   // HDF para fondos
    finishId: globalFinishId,
    grain: 'along',
  })

  // ── Zócalo frontal ───────────────────────────────────────
  // Tira horizontal en la parte inferior frontal
  const sokleFront = (): Part => makePart(furnitureId, {
    label: 'Zócalo frontal',
    length: innerWidth,
    width: socleH,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'along',
  })

  const parts: Part[] = [
    sidePanel(),
    topPanel(),
    bottomPanel(),
  ]

  if (p.hasBack) {
    parts.push(backPanel())
  }

  if (p.hasSocle && socleH > 0) {
    parts.push(sokleFront())
  }

  return parts
}

// ─── Módulo: Estante (shelf) ─────────────────────────────────
// Un estante ocupa el ancho interior neto del ropero.
// El fondo (panel trasero) resta bt mm a la profundidad útil.

function generateShelf(
  ctx: WardrobeContext,
  mod: Module,
): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as ShelfModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  const shelfDepth = p.totalDepth - bt - 20 // 20mm retroceso estándar

  return [
    makePart(furnitureId, {
      label: 'Estante',
      length: shelfDepth,
      width: innerWidth,
      thickness: t,
      quantity: sp.count,
      materialId: resolveMatId(sp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'across',
      moduleId: mod.id,
    }),
  ]
}

// ─── Módulo: Cajón (drawer) ──────────────────────────────────
// Cada cajón = frente exterior + cuerpo (4 piezas: front, back, 2 sides) + fondo HDF
// El frente exterior cubre toda la abertura (ancho interior × alto cajón).

function generateDrawer(
  ctx: WardrobeContext,
  mod: Module,
): Part[] {
  const { furnitureId, p } = ctx
  const dp = mod.params as DrawerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  const shelfDepth = p.totalDepth - bt - 20

  // Cuerpo del cajón (frente interior + trasero + laterales de cajón)
  const bodyT = 16  // grosor estándar cuerpo cajón
  const bodyH = dp.height - 10  // la carcasa es 10mm menor al hueco
  const bodyWidth = innerWidth - 2  // 1mm holgura cada lado para corredera

  // Laterales del cajón: profundidad neta del corredor
  const sideLen = shelfDepth - bodyT - 2 // frente + trasero + 2mm holgura

  const parts: Part[] = [
    // Frente exterior (visible)
    makePart(furnitureId, {
      label: 'Frente cajón',
      length: innerWidth,
      width: dp.height,
      thickness: t,
      quantity: 1,
      materialId: resolveMatId(dp.frontMaterialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
    // Frente interior del cuerpo
    makePart(furnitureId, {
      label: 'Frente interior cajón',
      length: bodyWidth,
      width: bodyH,
      thickness: bodyT,
      quantity: 1,
      materialId: resolveMatId(dp.bodyMaterialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
    // Trasero del cajón
    makePart(furnitureId, {
      label: 'Trasero cajón',
      length: bodyWidth,
      width: bodyH,
      thickness: bodyT,
      quantity: 1,
      materialId: resolveMatId(dp.bodyMaterialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
    // Laterales del cajón (×2)
    makePart(furnitureId, {
      label: 'Lateral cajón',
      length: sideLen,
      width: bodyH,
      thickness: bodyT,
      quantity: 2,
      materialId: resolveMatId(dp.bodyMaterialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
    // Fondo cajón en HDF
    makePart(furnitureId, {
      label: 'Fondo cajón',
      length: sideLen,
      width: bodyWidth,
      thickness: 6,
      quantity: 1,
      materialId: 'hdf_6',
      finishId: DEFAULT_FINISH_ID,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]

  return parts
}

// ─── Módulo: Puerta abatible (hinged_door) ───────────────────
// 1 o 2 puertas que cubren el frente interior.
// Con 2 puertas: cada una tiene la mitad del ancho interior menos 2mm de junta.

function generateHingedDoor(
  ctx: WardrobeContext,
  mod: Module,
  availableHeight: number, // alto de la abertura en mm
): Part[] {
  const { furnitureId, p } = ctx
  const hp = mod.params as HingedDoorModuleParams
  const t = p.boardThickness
  const innerWidth = p.totalWidth - 2 * t

  const count = hp.count
  const jointGap = 2   // mm entre puertas
  const doorWidth = count === 1
    ? innerWidth - 2
    : (innerWidth - jointGap * (count - 1)) / count

  return [
    makePart(furnitureId, {
      label: 'Puerta abatible',
      length: availableHeight - 4,  // 2mm holgura arriba + 2mm abajo
      width: doorWidth,
      thickness: t,
      quantity: count,
      materialId: resolveMatId(hp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]
}

// ─── Módulo: Puerta corredera (sliding_door) ─────────────────
// 2 o 3 paneles que se superponen parcialmente.
// El ancho de cada panel = (totalWidth + overlap × (count-1)) / count
// overlap estándar = 60mm por panel.

function generateSlidingDoor(
  ctx: WardrobeContext,
  mod: Module,
  availableHeight: number,
): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as SlidingDoorModuleParams
  const panelCount = sp.panelCount
  const overlap = 60  // mm de solape por panel

  const panelWidth = (p.totalWidth + overlap * (panelCount - 1)) / panelCount
  const panelT = 18   // grosor estándar panel corredero (puede ser independiente)

  return [
    makePart(furnitureId, {
      label: 'Panel corredero',
      length: availableHeight - 40,  // riel superior + inferior ≈ 20mm cada uno
      width: panelWidth,
      thickness: panelT,
      quantity: panelCount,
      materialId: resolveMatId(sp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]
}

// ─── Módulo: Barra de colgar (hanging_rail) ──────────────────
// No genera piezas de tablero — solo define la posición para herrajes.
// Retorna un array vacío; el herraje se infiere en hardware.ts.

function generateHangingRail(
  _ctx: WardrobeContext,
  _mod: Module,
): Part[] {
  // La barra metálica no es una pieza de tablero — se gestiona en herrajes
  return []
}

// ─── Módulo: Divisor vertical (vertical_divider) ─────────────
// Tablero vertical que va de top a bottom, a una posición dada.
// Divide el ancho interior en dos secciones.

function generateVerticalDivider(
  ctx: WardrobeContext,
  mod: Module,
): Part[] {
  const { furnitureId, p } = ctx
  const vp = mod.params as VerticalDividerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerHeight = p.totalHeight - 2 * t
  const divDepth = p.totalDepth - bt - 20

  // Validar que la posición esté dentro del interior
  const innerWidth = p.totalWidth - 2 * t
  if (vp.position <= 0 || vp.position >= innerWidth) {
    return [] // posición inválida — ignorar silenciosamente
  }

  return [
    makePart(furnitureId, {
      label: 'Divisor vertical',
      length: divDepth,
      width: innerHeight,
      thickness: t,
      quantity: 1,
      materialId: resolveMatId(vp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]
}

// ─── Módulo: Zócalo (socle) ──────────────────────────────────
// Zócalo trasero (cierre posterior en la base, si el ropero no tiene panel trasero completo).
// Solo se genera si hasSocle es true en los parámetros globales.

function generateSocle(
  ctx: WardrobeContext,
  mod: Module,
): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as SocleModuleParams
  const t = p.boardThickness
  const innerWidth = p.totalWidth - 2 * t

  // Zócalo trasero (espejo del frontal, mismo alto)
  return [
    makePart(furnitureId, {
      label: 'Zócalo trasero',
      length: innerWidth,
      width: sp.height,
      thickness: t,
      quantity: 1,
      materialId: resolveMatId(sp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]
}

// ─── Dispatcher de módulos ───────────────────────────────────

function generateModule(ctx: WardrobeContext, mod: Module): Part[] {
  const { p } = ctx
  const t = p.boardThickness
  // Alto útil interior (espacio entre top y bottom, descontando socle si aplica)
  const socleH = p.hasSocle ? p.socleHeight : 0
  const innerHeight = p.totalHeight - 2 * t - socleH

  switch (mod.type as ModuleType) {
    case 'shelf':
      return generateShelf(ctx, mod)
    case 'drawer':
      return generateDrawer(ctx, mod)
    case 'hinged_door':
      return generateHingedDoor(ctx, mod, innerHeight)
    case 'sliding_door':
      return generateSlidingDoor(ctx, mod, innerHeight)
    case 'hanging_rail':
      return generateHangingRail(ctx, mod)
    case 'vertical_divider':
      return generateVerticalDivider(ctx, mod)
    case 'socle':
      return generateSocle(ctx, mod)
    default:
      return []
  }
}

// ─── Función principal exportada ────────────────────────────

/**
 * Genera todas las piezas de un ropero a partir de sus parámetros y módulos.
 *
 * @param furnitureId  — ID del mueble en el proyecto
 * @param params       — WardrobeParams (dimensiones, grosor, etc.)
 * @param modules      — Lista de módulos internos ordenados
 * @param materialMap  — Catálogo de materiales (para resolver precios)
 * @param globalMaterialId — Material por defecto para piezas sin material asignado
 * @param globalFinishId   — Acabado por defecto
 * @returns            — Array de Part[] listo para BOM, CutList y renderizado 3D
 */
export function generateWardrobeParts(
  furnitureId: string,
  params: WardrobeParams,
  modules: Module[],
  materialMap: MaterialMap,
  globalMaterialId = DEFAULT_MATERIAL_ID,
  globalFinishId = DEFAULT_FINISH_ID,
): Part[] {
  resetCounter()

  const ctx: WardrobeContext = {
    furnitureId,
    p: params,
    globalMaterialId,
    globalFinishId,
    materialMap,
  }

  // 1. Cuerpo estructural (shell)
  const shellParts = generateShell(ctx)

  // 2. Módulos internos (ordenados por mod.order)
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)
  const moduleParts = sortedModules.flatMap(mod => generateModule(ctx, mod))

  return [...shellParts, ...moduleParts]
}

// ─── Exports de utilidad para tests ─────────────────────────
export {
  generateShell,
  generateShelf,
  generateDrawer,
  generateHingedDoor,
  generateSlidingDoor,
  generateHangingRail,
  generateVerticalDivider,
  generateSocle,
}

// Re-export constantes útiles
export const WARDROBE_CONSTANTS = {
  STANDARD_SHEET_WIDTH,
  STANDARD_SHEET_LENGTH,
  DEFAULT_BACK_THICKNESS,
  DEFAULT_MATERIAL_ID,
  DEFAULT_FINISH_ID,
} as const
