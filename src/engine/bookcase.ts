// ============================================================
// FURNITURE STUDIO — engine/bookcase.ts
// Motor paramétrico de la estantería / librería
// TypeScript PURO — sin React
// ============================================================

import type {
  BookcaseParams,
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

export interface BookcaseContext {
  furnitureId: string
  p: BookcaseParams
  globalMaterialId: string
  globalFinishId: string
  materialMap: MaterialMap
}

// ─── Cuerpo base de la estantería ───────────────────────────

export function generateBookcaseShell(ctx: BookcaseContext): Part[] {
  const { furnitureId, p, globalMaterialId, globalFinishId } = ctx
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const socleH = p.hasSocle ? p.socleHeight : 0

  const innerWidth = p.totalWidth - 2 * t
  const innerHeight = p.totalHeight - 2 * t

  // Laterales — van de suelo (o zócalo) hasta top
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

  // Top
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

  // Bottom
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

  // Panel trasero — opcional (hasBack=false = estantería abierta)
  const backPanel = (): Part => makePart(furnitureId, {
    label: 'Panel trasero',
    length: innerWidth,
    width: innerHeight,
    thickness: bt,
    quantity: 1,
    materialId: 'hdf_6',
    finishId: globalFinishId,
    grain: 'along',
  })

  // Zócalo frontal — opcional
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

// ─── Módulo: Estante ─────────────────────────────────────────

function generateShelf(ctx: BookcaseContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const sp = mod.params as ShelfModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  // Estantería abierta: sin retroceso de panel trasero si no tiene back
  const shelfDepth = p.hasBack ? p.totalDepth - bt - 20 : p.totalDepth - 10

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

function generateDrawer(ctx: BookcaseContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const dp = mod.params as DrawerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerWidth = p.totalWidth - 2 * t
  const shelfDepth = p.hasBack ? p.totalDepth - bt - 20 : p.totalDepth - 10

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
  ctx: BookcaseContext,
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
  ctx: BookcaseContext,
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

function generateVerticalDivider(ctx: BookcaseContext, mod: Module): Part[] {
  const { furnitureId, p } = ctx
  const vp = mod.params as VerticalDividerModuleParams
  const t = p.boardThickness
  const bt = p.hasBack ? (p.backPanelThickness ?? DEFAULT_BACK_THICKNESS) : 0
  const innerHeight = p.totalHeight - 2 * t
  const divDepth = p.hasBack ? p.totalDepth - bt - 20 : p.totalDepth - 10
  const innerWidth = p.totalWidth - 2 * t

  if (vp.position <= 0 || vp.position >= innerWidth) return []

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

// ─── Dispatcher de módulos ───────────────────────────────────

function generateModule(ctx: BookcaseContext, mod: Module): Part[] {
  const { p } = ctx
  const t = p.boardThickness
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
    case 'vertical_divider':
      return generateVerticalDivider(ctx, mod)
    case 'hanging_rail':
    case 'socle':
    default:
      return []
  }
}

// ─── Función principal exportada ────────────────────────────

export function generateBookcaseParts(
  furnitureId: string,
  params: BookcaseParams,
  modules: Module[],
  materialMap: MaterialMap,
  globalMaterialId = DEFAULT_MATERIAL_ID,
  globalFinishId = DEFAULT_FINISH_ID,
): Part[] {
  resetCounter()

  const ctx: BookcaseContext = {
    furnitureId,
    p: params,
    globalMaterialId,
    globalFinishId,
    materialMap,
  }

  const shellParts = generateBookcaseShell(ctx)
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)
  const moduleParts = sortedModules.flatMap(mod => generateModule(ctx, mod))

  const allParts = [...shellParts, ...moduleParts]
  return assignPartCodes(allParts)
}
