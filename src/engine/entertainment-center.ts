// ============================================================
// FURNITURE STUDIO — engine/entertainment-center.ts
// Motor paramétrico del centro de entretenimiento
// TypeScript PURO — sin React
// ============================================================

import type {
  EntertainmentCenterParams,
  Module,
  ModuleType,
  Part,
  MaterialMap,
  ShelfModuleParams,
  DrawerModuleParams,
  HingedDoorModuleParams,
  SlidingDoorModuleParams,
  VerticalDividerModuleParams,
  GrainDirection,
} from './types'

// ─── Constantes ─────────────────────────────────────────────

const DEFAULT_MATERIAL_ID = 'mdf_18'
const DEFAULT_FINISH_ID = 'raw'
const DEFAULT_BACK_THICKNESS = 6

// ─── Helpers ────────────────────────────────────────────────

let _partCounter = 0

function resetCounter() {
  _partCounter = 0
}

function nextPartId(furnitureId: string): string {
  _partCounter++
  return `${furnitureId}_p${String(_partCounter).padStart(3, '0')}`
}

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

function resolveMatId(moduleMatId: string | undefined, fallback: string): string {
  if (moduleMatId && moduleMatId.trim() !== '') return moduleMatId
  return fallback
}

/** Asigna partCodes secuenciales A, B, C... a un array de piezas */
function assignPartCodes(parts: Part[]): Part[] {
  return parts.map((part, index) => ({
    ...part,
    partCode: String.fromCharCode(65 + index),
  }))
}

// ─── Contexto ────────────────────────────────────────────────

export interface EntertainmentCenterContext {
  furnitureId: string
  p: EntertainmentCenterParams
  globalMaterialId: string
  globalFinishId: string
  materialMap: MaterialMap
}

// ─── Sección 1: Base principal (estilo mueble TV) ─────────────

function generateBaseSection(ctx: EntertainmentCenterContext): Part[] {
  const { furnitureId, p, globalMaterialId, globalFinishId } = ctx
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const socleH = p.hasSocle ? p.socleHeight : 0

  // La base ocupa el 45% de la altura total
  const baseHeight = Math.round(p.totalHeight * 0.45)
  const baseWidth = p.totalWidth
  const baseDepth = p.totalDepth

  const innerWidth = baseWidth - 2 * t
  const innerHeight = baseHeight - 2 * t

  const parts: Part[] = []

  // Laterales base
  parts.push(makePart(furnitureId, {
    label: 'Lateral base',
    length: baseDepth,
    width: baseHeight - socleH,
    thickness: t,
    quantity: 2,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'along',
  }))

  // Top base
  parts.push(makePart(furnitureId, {
    label: 'Tapa superior base',
    length: baseDepth,
    width: innerWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  }))

  // Bottom base
  parts.push(makePart(furnitureId, {
    label: 'Piso inferior base',
    length: baseDepth,
    width: innerWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  }))

  // Panel trasero base
  if (p.hasBack) {
    parts.push(makePart(furnitureId, {
      label: 'Panel trasero',
      length: innerWidth,
      width: innerHeight,
      thickness: bt,
      quantity: 1,
      materialId: 'hdf_6',
      finishId: globalFinishId,
      grain: 'along',
    }))
  }

  // Zócalo base
  if (p.hasSocle && socleH > 0) {
    parts.push(makePart(furnitureId, {
      label: 'Zócalo frontal',
      length: innerWidth,
      width: socleH,
      thickness: t,
      quantity: 1,
      materialId: globalMaterialId,
      finishId: globalFinishId,
      grain: 'along',
    }))
  }

  return parts
}

// ─── Sección 2: Columna lateral ──────────────────────────────

function generateColumnSection(ctx: EntertainmentCenterContext): Part[] {
  const { furnitureId, p, globalMaterialId, globalFinishId } = ctx
  if (p.sideColumnWidth <= 0) return []

  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const colWidth = p.sideColumnWidth
  const colHeight = p.totalHeight
  const colDepth = p.totalDepth

  const innerColWidth = colWidth - 2 * t
  const innerColHeight = colHeight - 2 * t

  const parts: Part[] = []

  // Laterales columna
  parts.push(makePart(furnitureId, {
    label: 'Lateral columna',
    length: colDepth,
    width: colHeight,
    thickness: t,
    quantity: 2,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'along',
  }))

  // Top columna
  parts.push(makePart(furnitureId, {
    label: 'Top columna',
    length: colDepth,
    width: innerColWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  }))

  // Bottom columna
  parts.push(makePart(furnitureId, {
    label: 'Piso columna',
    length: colDepth,
    width: innerColWidth,
    thickness: t,
    quantity: 1,
    materialId: globalMaterialId,
    finishId: globalFinishId,
    grain: 'across',
  }))

  // Panel trasero columna
  if (p.hasBack) {
    parts.push(makePart(furnitureId, {
      label: 'Panel trasero columna',
      length: innerColWidth,
      width: innerColHeight,
      thickness: bt,
      quantity: 1,
      materialId: 'hdf_6',
      finishId: globalFinishId,
      grain: 'along',
    }))
  }

  return parts
}

// ─── Sección 3: Panel posterior elevado ──────────────────────

function generateBackPanelSection(ctx: EntertainmentCenterContext): Part[] {
  const { furnitureId, p, globalMaterialId, globalFinishId } = ctx
  if (!p.hasBackPanel || p.backPanelHeight <= 0) return []

  const t = p.boardThickness
  const panelWidth = p.totalWidth - p.sideColumnWidth

  if (panelWidth <= 0) return []

  return [
    makePart(furnitureId, {
      label: 'Panel posterior elevado',
      length: panelWidth,
      width: p.backPanelHeight,
      thickness: t,
      quantity: 1,
      materialId: globalMaterialId,
      finishId: globalFinishId,
      grain: 'across',
    }),
  ]
}

// ─── Módulo: Estante ─────────────────────────────────────────

function generateShelf(ctx: EntertainmentCenterContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as ShelfModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  const shelfDepth = p.totalDepth - bt - 20

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

// ─── Módulo: Cajón ───────────────────────────────────────────

function generateDrawer(ctx: EntertainmentCenterContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const dp = mod.params as DrawerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  const shelfDepth = p.totalDepth - bt - 20

  const bodyT = 16
  const bodyH = dp.height - 10
  const bodyWidth = innerWidth - 2
  const sideLen = shelfDepth - bodyT - 2

  return [
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
}

// ─── Módulo: Puerta abatible ─────────────────────────────────

function generateHingedDoor(
  ctx: EntertainmentCenterContext,
  mod: Module,
  availableHeight: number,
): Part[] {
  const { furnitureId, p } = ctx
  const hp = mod.params as HingedDoorModuleParams
  const t = p.boardThickness
  const innerWidth = p.totalWidth - 2 * t
  const count = hp.count
  const jointGap = 2
  const doorWidth = count === 1
    ? innerWidth - 2
    : (innerWidth - jointGap * (count - 1)) / count

  return [
    makePart(furnitureId, {
      label: 'Puerta abatible',
      length: availableHeight - 4,
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

// ─── Módulo: Puerta corredera ────────────────────────────────

function generateSlidingDoor(
  ctx: EntertainmentCenterContext,
  mod: Module,
  availableHeight: number,
): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as SlidingDoorModuleParams
  const panelCount = sp.panelCount
  const overlap = 60
  const panelWidth = (p.totalWidth + overlap * (panelCount - 1)) / panelCount
  const panelT = 18

  return [
    makePart(furnitureId, {
      label: 'Panel corredero',
      length: availableHeight - 40,
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

// ─── Módulo: Divisor vertical ────────────────────────────────

function generateVerticalDivider(ctx: EntertainmentCenterContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const vp = mod.params as VerticalDividerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const socleH = p.hasSocle ? p.socleHeight : 0
  const baseHeight = Math.round(p.totalHeight * 0.45)
  const innerHeight = baseHeight - 2 * t
  const divDepth = p.totalDepth - bt - 20
  const innerWidth = p.totalWidth - 2 * t

  if (vp.position <= 0 || vp.position >= innerWidth) return []

  return [
    makePart(furnitureId, {
      label: 'Divisor vertical',
      length: divDepth,
      width: innerHeight - socleH,
      thickness: t,
      quantity: 1,
      materialId: resolveMatId(vp.materialId, ctx.globalMaterialId),
      finishId: ctx.globalFinishId,
      grain: 'along',
      moduleId: mod.id,
    }),
  ]
}

// ─── Dispatcher de módulos ───────────────────────────────────

function generateModule(ctx: EntertainmentCenterContext, mod: Module): Part[] {
  const { p } = ctx
  const t = p.boardThickness
  const socleH = p.hasSocle ? p.socleHeight : 0
  const baseHeight = Math.round(p.totalHeight * 0.45)
  const innerHeight = baseHeight - 2 * t - socleH

  switch (mod.type as ModuleType) {
    case 'shelf':
      return generateShelf(ctx, mod)
    case 'drawer':
      return generateDrawer(ctx, mod)
    case 'hinged_door':
      return generateHingedDoor(ctx, mod, innerHeight)
    case 'sliding_door':
      return generateSlidingDoor(ctx, mod, innerHeight)
    case 'vertical_divider':
      return generateVerticalDivider(ctx, mod)
    case 'hanging_rail':
    case 'socle':
    default:
      return []
  }
}

// ─── Función principal exportada ────────────────────────────

export function generateEntertainmentCenterParts(
  furnitureId: string,
  params: EntertainmentCenterParams,
  modules: Module[],
  materialMap: MaterialMap,
  globalMaterialId = DEFAULT_MATERIAL_ID,
  globalFinishId = DEFAULT_FINISH_ID,
): Part[] {
  resetCounter()

  const ctx: EntertainmentCenterContext = {
    furnitureId,
    p: params,
    globalMaterialId,
    globalFinishId,
    materialMap,
  }

  // 1. Base principal
  const baseParts = generateBaseSection(ctx)

  // 2. Columna lateral (opcional)
  const columnParts = generateColumnSection(ctx)

  // 3. Panel posterior elevado (opcional)
  const backPanelParts = generateBackPanelSection(ctx)

  // 4. Módulos internos
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)
  const moduleParts = sortedModules.flatMap(mod => generateModule(ctx, mod))

  const allParts = [...baseParts, ...columnParts, ...backPanelParts, ...moduleParts]
  return assignPartCodes(allParts)
}
