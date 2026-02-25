// ============================================================
// FURNITURE STUDIO — Domain Types
// Motor paramétrico puro: sin imports de React ni del DOM
// ============================================================

// ─── Identificadores ────────────────────────────────────────

export type FurnitureTypeId =
  | 'wardrobe'
  | 'kitchen_base'
  | 'kitchen_wall'
  | 'tv_unit'
  | 'entertainment_center'
  | 'bookcase'

export type ModuleType =
  | 'shelf'
  | 'drawer'
  | 'hinged_door'
  | 'sliding_door'
  | 'hanging_rail'
  | 'vertical_divider'
  | 'socle'

export type DoorType = 'none' | 'hinged' | 'sliding'

export type MaterialType = 'mdf' | 'melamine' | 'solid_wood' | 'plywood' | 'hdf'

export type GrainDirection = 'along' | 'across' | 'any'

export type HardwareSource = 'auto' | 'manual'

export type HardwareType =
  | 'hinge'
  | 'drawer_slide'
  | 'handle'
  | 'shelf_pin'
  | 'hanging_rail_support'
  | 'sliding_door_rail'
  | 'lock'
  | 'other'

export type ExportFormat = 'GLB' | 'CSV' | 'PDF_QUOTE' | 'PDF_CUTS' | 'JSON' | 'PDF_ASSEMBLY'

export type ExportStatus = 'pending' | 'running' | 'done' | 'error'

export type Currency = 'USD' | 'CRC' | 'MXN' | 'COP'

// ─── Parámetros globales del mueble ─────────────────────────

export interface WardrobeParams {
  totalWidth: number       // mm — 600..3600
  totalHeight: number      // mm — 1800..2800
  totalDepth: number       // mm — 450..700
  boardThickness: number   // mm — 15 | 18 | 25
  backPanelThickness: number // mm — 3 | 6 | 9
  hasBack: boolean
  hasSocle: boolean
  socleHeight: number      // mm — 60..200
  doorType: DoorType
  hangingRailHeight: number // mm — posición de la barra
}

export interface KitchenBaseParams {
  totalWidth: number       // mm — 300..1200
  totalHeight: number      // mm — 700..950
  totalDepth: number       // mm — 450..700
  boardThickness: number   // mm — 15 | 18 | 25
  backPanelThickness: number
  hasBack: boolean
  hasSocle: boolean
  socleHeight: number      // mm — 60..150
  doorType: DoorType
  hasCountertop: boolean
  countertopThickness: number // mm — 20..40
  countertopOverhang: number  // mm — 0..50
}

export interface KitchenWallParams {
  totalWidth: number       // mm — 300..1200
  totalHeight: number      // mm — 300..900
  totalDepth: number       // mm — 200..400
  boardThickness: number   // mm — 15 | 18 | 25
  backPanelThickness: number
  hasBack: boolean
  doorType: DoorType
  mountingHeight: number   // mm — altura desde el suelo donde se instala
}

export type ParamSet =
  | WardrobeParams
  | KitchenBaseParams
  | KitchenWallParams
  | TvUnitParams
  | EntertainmentCenterParams
  | BookcaseParams

// ─── Módulos internos ────────────────────────────────────────

export interface ShelfModuleParams {
  count: number            // 1..10
  adjustable: boolean
  materialId: string
}

export interface DrawerModuleParams {
  height: number           // mm — 100..400
  slideType: 'basic' | 'soft_close'
  frontMaterialId: string
  bodyMaterialId: string
}

export interface HingedDoorModuleParams {
  count: 1 | 2
  openDirection: 'left' | 'right' | 'both'
  materialId: string
  handleType: string
}

export interface SlidingDoorModuleParams {
  panelCount: 2 | 3
  materialId: string
}

export interface HangingRailModuleParams {
  height: number           // mm — posición vertical dentro del módulo
}

export interface VerticalDividerModuleParams {
  position: number         // mm desde el lateral izquierdo
  materialId: string
}

export interface SocleModuleParams {
  height: number           // mm — 60..200
  materialId: string
}

export type ModuleParams =
  | ShelfModuleParams
  | DrawerModuleParams
  | HingedDoorModuleParams
  | SlidingDoorModuleParams
  | HangingRailModuleParams
  | VerticalDividerModuleParams
  | SocleModuleParams

export interface Module {
  id: string
  type: ModuleType
  order: number
  params: ModuleParams
}

// ─── Materiales y acabados ───────────────────────────────────

export interface Material {
  id: string
  name: { es: string; en: string }
  type: MaterialType
  standardThicknesses: number[]  // mm — ej: [15, 18, 25]
  density: number                // kg/m³
  pricePerSqm: number            // precio de referencia
  standardSheetWidth: 1220       // mm — siempre 1220
  standardSheetLength: 2440      // mm — siempre 2440
}

export interface Finish {
  id: string
  name: { es: string; en: string }
  colorHex: string
  commercialName: string
  textureUrl?: string
}

// ─── Piezas (Parts) ─────────────────────────────────────────

export interface Part {
  id: string
  furnitureId: string
  label: string              // nombre legible para la BOM
  length: number             // mm
  width: number              // mm
  thickness: number          // mm
  quantity: number
  materialId: string
  finishId: string
  grain: GrainDirection
  moduleId?: string          // origen del módulo (si aplica)
  partCode?: string          // código alfabético: A, B, C...
}

// ─── Herrajes ────────────────────────────────────────────────

export interface HardwareItem {
  id: string
  furnitureId: string
  type: HardwareType
  description: { es: string; en: string }
  quantity: number
  unitPrice: number
  source: HardwareSource
}

// ─── BOM ─────────────────────────────────────────────────────

export interface BOMItem {
  partId: string
  partCode?: string          // código alfabético: A, B, C...
  label: string
  quantity: number
  length: number
  width: number
  thickness: number
  areaSqm: number            // m² = (length × width × quantity) / 1_000_000
  materialId: string
  materialName: string
  finishName: string
  unitPrice: number
  subtotal: number
}

export interface BOMHardwareItem {
  hardwareId: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface BOM {
  furnitureId: string
  parts: BOMItem[]
  hardware: BOMHardwareItem[]
  totalMaterials: number
  totalHardware: number
  grandTotal: number
}

// ─── Cut List ────────────────────────────────────────────────

export interface CutListItem {
  label: string              // ej: "A1", "B3"
  partLabel: string
  length: number
  width: number
  thickness: number
  quantity: number
  materialId: string
  grain: GrainDirection
  sheetIndex: number         // en qué tablero estándar cae
}

export interface SheetGroup {
  materialId: string
  materialName: string
  thickness: number
  sheetsNeeded: number
  items: CutListItem[]
  totalAreaSqm: number
}

export interface CutList {
  furnitureId: string
  groups: SheetGroup[]
}

// ─── Costo / Cotización ──────────────────────────────────────

export interface CostSummary {
  furnitureId: string
  materialsCost: number
  hardwareCost: number
  subtotal: number
  profitMargin: number       // porcentaje — ej: 30
  salePrice: number          // subtotal × (1 + margin/100)
}

// ─── Resultado del motor paramétrico ────────────────────────

export interface FurnitureResult {
  parts: Part[]
  bom: BOM
  cutList: CutList
  hardware: HardwareItem[]
  cost: CostSummary
  assemblySteps: AssemblyStep[]
}

// ─── Proyecto ────────────────────────────────────────────────

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Furniture {
  id: string
  projectId: string
  name: string
  furnitureType: FurnitureTypeId
  params: ParamSet
  modules: Module[]
  // Resultado calculado por el motor (se recalcula al cambiar params/modules)
  result?: FurnitureResult
  position: Position3D
  rotationY: number          // grados: 0 | 90 | 180 | 270
}

export interface Project {
  id: string
  name: string
  description?: string
  currency: Currency
  profitMargin: number       // porcentaje
  createdAt: string          // ISO date string
  updatedAt: string
  furnitures: Furniture[]
}

// ─── Export Jobs ─────────────────────────────────────────────

export interface ExportJob {
  id: string
  projectId: string
  format: ExportFormat
  status: ExportStatus
  createdAt: string
  fileUrl?: string
  errorMsg?: string
}

// ─── Catálogos ───────────────────────────────────────────────

export type MaterialMap = Record<string, Material>
export type FinishMap = Record<string, Finish>

// ─── Validación ──────────────────────────────────────────────

export interface ValidationError {
  field: string
  messageKey: string         // clave de i18n ej: "validation.min"
  params?: Record<string, number | string>
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

// ─── Fase 2 — Nuevos tipos de mueble ────────────────────────

export interface TvUnitParams {
  totalWidth: number        // mm — 900..2400
  totalHeight: number       // mm — 400..600
  totalDepth: number        // mm — 350..550
  boardThickness: number    // mm — 15 | 18 | 25
  backPanelThickness: number
  hasBack: boolean
  hasSocle: boolean
  socleHeight: number       // mm — 60..150
  doorType: DoorType
  tvNicheWidth: number      // mm — espacio reservado para TV (centrado)
  tvNicheHeight: number     // mm — altura del nicho TV
}

export interface EntertainmentCenterParams {
  totalWidth: number        // mm — 1200..2800
  totalHeight: number       // mm — 1800..2400
  totalDepth: number        // mm — 350..550
  boardThickness: number
  backPanelThickness: number
  hasBack: boolean
  hasSocle: boolean
  socleHeight: number
  doorType: DoorType
  sideColumnWidth: number   // mm — ancho de columna lateral (0 = sin columna)
  hasBackPanel: boolean     // panel posterior elevado (zona TV)
  backPanelHeight: number   // mm — altura del panel posterior
}

export interface BookcaseParams {
  totalWidth: number        // mm — 600..1800
  totalHeight: number       // mm — 900..2400
  totalDepth: number        // mm — 200..400
  boardThickness: number
  backPanelThickness: number
  hasBack: boolean          // false = estantería abierta
  hasSocle: boolean
  socleHeight: number
  doorType: DoorType
}

// ─── Fase 2 — Motor de Armado ────────────────────────────────

export interface AssemblyHardwareUsed {
  type: HardwareType
  quantity: number
  description: string        // ej: "Tornillo 6×40mm"
}

export interface AssemblyStep {
  stepNumber: number
  title: { es: string; en: string }
  description: { es: string; en: string }
  partsInvolved: string[]    // Part IDs
  partCodes: string[]        // Códigos alfabéticos: ['A', 'B']
  hardwareUsed: AssemblyHardwareUsed[]
}
