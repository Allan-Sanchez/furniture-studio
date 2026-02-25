// Motor paramétrico — punto de entrada principal
// Todos los generadores se exportan desde aquí

export type * from './types'

// ─── Ropero ─────────────────────────────────────────────────
export {
  generateWardrobeParts,
  generateShell,
  generateShelf,
  generateDrawer,
  generateHingedDoor,
  generateSlidingDoor,
  generateHangingRail,
  generateVerticalDivider,
  generateSocle,
  WARDROBE_CONSTANTS,
} from './wardrobe'

// ─── Herrajes ────────────────────────────────────────────────
export { inferWardrobeHardware, DEFAULT_PRICES } from './hardware'

// ─── BOM ─────────────────────────────────────────────────────
export { generateBOM, consolidateBOMs } from './bom'

// ─── Cut List ────────────────────────────────────────────────
export {
  generateCutList,
  SHEET_LENGTH,
  SHEET_WIDTH,
  SHEET_AREA_SQM,
  WASTE_FACTOR,
} from './cutlist'

// ─── Costos ──────────────────────────────────────────────────
export { calculateCost, consolidateCosts } from './cost'

// Cocina — Fase 2:
// export { generateKitchenBaseParts } from './kitchen-base'
// export { generateKitchenWallParts } from './kitchen-wall'
