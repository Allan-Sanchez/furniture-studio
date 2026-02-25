import type {
  WardrobeParams,
  KitchenBaseParams,
  KitchenWallParams,
  TvUnitParams,
  EntertainmentCenterParams,
  BookcaseParams,
  Module,
  FurnitureTypeId,
} from '@/engine/types'

export interface WardrobePreset {
  id: string
  name: { es: string; en: string }
  description: { es: string; en: string }
  params: WardrobeParams
  modules: Module[]
}

export interface KitchenPreset {
  id: string
  name: { es: string; en: string }
  params: KitchenBaseParams | KitchenWallParams
  modules: Module[]
}

export interface TvUnitPreset {
  id: string
  name: { es: string; en: string }
  params: TvUnitParams
  modules: Module[]
}

export interface EntertainmentCenterPreset {
  id: string
  name: { es: string; en: string }
  params: EntertainmentCenterParams
  modules: Module[]
}

export interface BookcasePreset {
  id: string
  name: { es: string; en: string }
  params: BookcaseParams
  modules: Module[]
}

export const WARDROBE_PRESETS: WardrobePreset[] = [
  // ─── Preset 1: Ropero Estándar 2 Puertas ─────────────────────
  {
    id: 'preset_standard_2door',
    name: {
      es: 'Ropero Estándar 2 Puertas',
      en: 'Standard 2-Door Wardrobe',
    },
    description: {
      es: 'Ropero de 1200mm con 2 puertas batientes, 3 repisas ajustables y barra de colgar.',
      en: '1200mm wardrobe with 2 hinged doors, 3 adjustable shelves and hanging rail.',
    },
    params: {
      totalWidth: 1200,
      totalHeight: 2400,
      totalDepth: 600,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      hangingRailHeight: 1600,
    },
    modules: [
      {
        id: 'preset_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 3, adjustable: true, materialId: 'mdf_18' },
      },
      {
        id: 'preset_mod_2',
        type: 'hinged_door',
        order: 2,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
      {
        id: 'preset_mod_3',
        type: 'hanging_rail',
        order: 3,
        params: { height: 1600 },
      },
    ],
  },

  // ─── Preset 2: Ropero Corredizo ──────────────────────────────
  {
    id: 'preset_sliding_door',
    name: {
      es: 'Ropero Corredizo',
      en: 'Sliding Door Wardrobe',
    },
    description: {
      es: 'Ropero de 1800mm con puertas corredizas, 4 repisas ajustables, barra de colgar y divisor vertical.',
      en: '1800mm wardrobe with sliding doors, 4 adjustable shelves, hanging rail and vertical divider.',
    },
    params: {
      totalWidth: 1800,
      totalHeight: 2400,
      totalDepth: 650,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'sliding',
      hangingRailHeight: 1600,
    },
    modules: [
      {
        id: 'preset_mod_4',
        type: 'shelf',
        order: 1,
        params: { count: 4, adjustable: true, materialId: 'mdf_18' },
      },
      {
        id: 'preset_mod_5',
        type: 'sliding_door',
        order: 2,
        params: { panelCount: 2, materialId: 'mdf_18' },
      },
      {
        id: 'preset_mod_6',
        type: 'hanging_rail',
        order: 3,
        params: { height: 1600 },
      },
      {
        id: 'preset_mod_7',
        type: 'vertical_divider',
        order: 4,
        params: { position: 900, materialId: 'mdf_18' },
      },
    ],
  },

  // ─── Preset 3: Ropero Abierto ────────────────────────────────
  {
    id: 'preset_open',
    name: {
      es: 'Ropero Abierto',
      en: 'Open Wardrobe',
    },
    description: {
      es: 'Ropero abierto de 1200mm con 5 repisas ajustables y barra de colgar, sin puertas.',
      en: '1200mm open wardrobe with 5 adjustable shelves and hanging rail, no doors.',
    },
    params: {
      totalWidth: 1200,
      totalHeight: 2400,
      totalDepth: 500,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'none',
      hangingRailHeight: 1600,
    },
    modules: [
      {
        id: 'preset_mod_8',
        type: 'shelf',
        order: 1,
        params: { count: 5, adjustable: true, materialId: 'mdf_18' },
      },
      {
        id: 'preset_mod_9',
        type: 'hanging_rail',
        order: 2,
        params: { height: 1600 },
      },
    ],
  },
]

// ─── Presets de Cocina ────────────────────────────────────────

export const KITCHEN_BASE_PRESETS: KitchenPreset[] = [
  {
    id: 'kb_single_door',
    name: { es: 'Base 1 Puerta', en: 'Base 1 Door' },
    params: {
      totalWidth: 600,
      totalHeight: 870,
      totalDepth: 600,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      hasCountertop: true,
      countertopThickness: 30,
      countertopOverhang: 20,
    } satisfies KitchenBaseParams,
    modules: [
      {
        id: 'kb_sd_mod_1',
        type: 'hinged_door',
        order: 1,
        params: { count: 1, openDirection: 'right', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
  {
    id: 'kb_double_door',
    name: { es: 'Base 2 Puertas', en: 'Base 2 Doors' },
    params: {
      totalWidth: 900,
      totalHeight: 870,
      totalDepth: 600,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      hasCountertop: true,
      countertopThickness: 30,
      countertopOverhang: 20,
    } satisfies KitchenBaseParams,
    modules: [
      {
        id: 'kb_dd_mod_1',
        type: 'hinged_door',
        order: 1,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
  {
    id: 'kb_drawers',
    name: { es: 'Base Cajones', en: 'Drawer Base' },
    params: {
      totalWidth: 600,
      totalHeight: 870,
      totalDepth: 600,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'none',
      hasCountertop: true,
      countertopThickness: 30,
      countertopOverhang: 20,
    } satisfies KitchenBaseParams,
    modules: [
      {
        id: 'kb_dr_mod_1',
        type: 'drawer',
        order: 1,
        params: { height: 200, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
      {
        id: 'kb_dr_mod_2',
        type: 'drawer',
        order: 2,
        params: { height: 200, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
      {
        id: 'kb_dr_mod_3',
        type: 'drawer',
        order: 3,
        params: { height: 150, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
    ],
  },
  {
    id: 'kw_single_door',
    name: { es: 'Alto 1 Puerta', en: 'Wall 1 Door' },
    params: {
      totalWidth: 600,
      totalHeight: 700,
      totalDepth: 300,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      doorType: 'hinged',
      mountingHeight: 1400,
    } satisfies KitchenWallParams,
    modules: [
      {
        id: 'kw_sd_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 2, adjustable: false, materialId: 'mdf_18' },
      },
      {
        id: 'kw_sd_mod_2',
        type: 'hinged_door',
        order: 2,
        params: { count: 1, openDirection: 'right', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
  {
    id: 'kw_double_door',
    name: { es: 'Alto 2 Puertas', en: 'Wall 2 Doors' },
    params: {
      totalWidth: 900,
      totalHeight: 700,
      totalDepth: 300,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      doorType: 'hinged',
      mountingHeight: 1400,
    } satisfies KitchenWallParams,
    modules: [
      {
        id: 'kw_dd_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 2, adjustable: false, materialId: 'mdf_18' },
      },
      {
        id: 'kw_dd_mod_2',
        type: 'hinged_door',
        order: 2,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
]

// ─── Presets TV Unit ──────────────────────────────────────────

export const TV_UNIT_PRESETS: TvUnitPreset[] = [
  {
    id: 'tv_floating',
    name: { es: 'Flotante Simple', en: 'Simple Floating' },
    params: {
      totalWidth: 1800,
      totalHeight: 450,
      totalDepth: 450,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: false,
      socleHeight: 0,
      doorType: 'none',
      tvNicheWidth: 900,
      tvNicheHeight: 350,
    } satisfies TvUnitParams,
    modules: [
      {
        id: 'tv_fl_mod_1',
        type: 'drawer',
        order: 1,
        params: { height: 200, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
    ],
  },
  {
    id: 'tv_with_doors',
    name: { es: 'Con Puertas', en: 'With Doors' },
    params: {
      totalWidth: 1600,
      totalHeight: 500,
      totalDepth: 450,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 80,
      doorType: 'hinged',
      tvNicheWidth: 800,
      tvNicheHeight: 380,
    } satisfies TvUnitParams,
    modules: [
      {
        id: 'tv_wd_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 1, adjustable: false, materialId: 'mdf_18' },
      },
      {
        id: 'tv_wd_mod_2',
        type: 'hinged_door',
        order: 2,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
  {
    id: 'tv_with_drawers',
    name: { es: 'Con Cajones', en: 'With Drawers' },
    params: {
      totalWidth: 1800,
      totalHeight: 550,
      totalDepth: 450,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 80,
      doorType: 'none',
      tvNicheWidth: 900,
      tvNicheHeight: 380,
    } satisfies TvUnitParams,
    modules: [
      {
        id: 'tv_wdr_mod_1',
        type: 'drawer',
        order: 1,
        params: { height: 180, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
      {
        id: 'tv_wdr_mod_2',
        type: 'drawer',
        order: 2,
        params: { height: 180, slideType: 'soft_close', frontMaterialId: 'mdf_18', bodyMaterialId: 'mdf_18' },
      },
      {
        id: 'tv_wdr_mod_3',
        type: 'shelf',
        order: 3,
        params: { count: 1, adjustable: true, materialId: 'mdf_18' },
      },
    ],
  },
]

// ─── Presets Entertainment Center ────────────────────────────

export const ENTERTAINMENT_CENTER_PRESETS: EntertainmentCenterPreset[] = [
  {
    id: 'ec_compact',
    name: { es: 'Compacto', en: 'Compact' },
    params: {
      totalWidth: 1400,
      totalHeight: 2000,
      totalDepth: 450,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      sideColumnWidth: 350,
      hasBackPanel: true,
      backPanelHeight: 1200,
    } satisfies EntertainmentCenterParams,
    modules: [],
  },
  {
    id: 'ec_medium',
    name: { es: 'Mediano', en: 'Medium' },
    params: {
      totalWidth: 1800,
      totalHeight: 2200,
      totalDepth: 450,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      sideColumnWidth: 400,
      hasBackPanel: true,
      backPanelHeight: 1400,
    } satisfies EntertainmentCenterParams,
    modules: [],
  },
  {
    id: 'ec_large',
    name: { es: 'Grande', en: 'Large' },
    params: {
      totalWidth: 2400,
      totalHeight: 2400,
      totalDepth: 500,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 100,
      doorType: 'hinged',
      sideColumnWidth: 500,
      hasBackPanel: true,
      backPanelHeight: 1600,
    } satisfies EntertainmentCenterParams,
    modules: [],
  },
]

// ─── Presets Bookcase ─────────────────────────────────────────

export const BOOKCASE_PRESETS: BookcasePreset[] = [
  {
    id: 'bc_open',
    name: { es: 'Abierto', en: 'Open' },
    params: {
      totalWidth: 900,
      totalHeight: 1800,
      totalDepth: 300,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: false,
      hasSocle: true,
      socleHeight: 80,
      doorType: 'none',
    } satisfies BookcaseParams,
    modules: [
      {
        id: 'bc_op_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 5, adjustable: true, materialId: 'mdf_18' },
      },
    ],
  },
  {
    id: 'bc_with_doors',
    name: { es: 'Con Puertas', en: 'With Doors' },
    params: {
      totalWidth: 900,
      totalHeight: 1800,
      totalDepth: 300,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 80,
      doorType: 'hinged',
    } satisfies BookcaseParams,
    modules: [
      {
        id: 'bc_wd_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 3, adjustable: true, materialId: 'mdf_18' },
      },
      {
        id: 'bc_wd_mod_2',
        type: 'hinged_door',
        order: 2,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
  {
    id: 'bc_combined',
    name: { es: 'Combinado', en: 'Combined' },
    params: {
      totalWidth: 1200,
      totalHeight: 1800,
      totalDepth: 300,
      boardThickness: 18,
      backPanelThickness: 6,
      hasBack: true,
      hasSocle: true,
      socleHeight: 80,
      doorType: 'hinged',
    } satisfies BookcaseParams,
    modules: [
      {
        id: 'bc_cb_mod_1',
        type: 'shelf',
        order: 1,
        params: { count: 4, adjustable: true, materialId: 'mdf_18' },
      },
      {
        id: 'bc_cb_mod_2',
        type: 'vertical_divider',
        order: 2,
        params: { position: 600, materialId: 'mdf_18' },
      },
      {
        id: 'bc_cb_mod_3',
        type: 'hinged_door',
        order: 3,
        params: { count: 2, openDirection: 'both', materialId: 'mdf_18', handleType: 'handle_bar_128' },
      },
    ],
  },
]

// ─── Helper getAllPresets ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllPresets(type: FurnitureTypeId): any[] {
  switch (type) {
    case 'wardrobe':
      return WARDROBE_PRESETS
    case 'kitchen_base':
    case 'kitchen_wall':
      return KITCHEN_BASE_PRESETS.filter(p =>
        type === 'kitchen_wall'
          ? p.id.startsWith('kw_')
          : p.id.startsWith('kb_')
      )
    case 'tv_unit':
      return TV_UNIT_PRESETS
    case 'entertainment_center':
      return ENTERTAINMENT_CENTER_PRESETS
    case 'bookcase':
      return BOOKCASE_PRESETS
    default:
      return []
  }
}
