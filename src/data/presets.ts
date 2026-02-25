import type { WardrobeParams, Module } from '@/engine/types'

export interface WardrobePreset {
  id: string
  name: { es: string; en: string }
  description: { es: string; en: string }
  params: WardrobeParams
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
