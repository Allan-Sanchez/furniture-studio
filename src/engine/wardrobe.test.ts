// ============================================================
// FURNITURE STUDIO — engine/wardrobe.test.ts
// Unit tests del motor paramétrico del ropero
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  generateWardrobeParts,
  generateShell,
  type WardrobeContext,
} from './wardrobe'
import type { WardrobeParams, Module, MaterialMap, Part } from './types'

// ─── Fixtures ────────────────────────────────────────────────

const EMPTY_MATERIAL_MAP: MaterialMap = {}

const BASE_PARAMS: WardrobeParams = {
  totalWidth: 1200,
  totalHeight: 2400,
  totalDepth: 600,
  boardThickness: 18,
  backPanelThickness: 6,
  hasBack: true,
  hasSocle: true,
  socleHeight: 100,
  doorType: 'none',
  hangingRailHeight: 1800,
}

function makeShelfModule(count = 3, adjustable = true): Module {
  return {
    id: 'mod_shelf_1',
    type: 'shelf',
    order: 1,
    params: { count, adjustable, materialId: '' },
  }
}

function makeDrawerModule(): Module {
  return {
    id: 'mod_drawer_1',
    type: 'drawer',
    order: 2,
    params: {
      height: 200,
      slideType: 'soft_close',
      frontMaterialId: '',
      bodyMaterialId: '',
    },
  }
}

function makeHingedDoorModule(count: 1 | 2 = 2): Module {
  return {
    id: 'mod_door_1',
    type: 'hinged_door',
    order: 3,
    params: {
      count,
      openDirection: 'both',
      materialId: '',
      handleType: 'bar',
    },
  }
}

function makeSlidingDoorModule(panelCount: 2 | 3 = 2): Module {
  return {
    id: 'mod_sliding_1',
    type: 'sliding_door',
    order: 4,
    params: { panelCount, materialId: '' },
  }
}

function makeVerticalDividerModule(position = 600): Module {
  return {
    id: 'mod_vdiv_1',
    type: 'vertical_divider',
    order: 5,
    params: { position, materialId: '' },
  }
}

// ─── Helper para crear contexto de test tipado ───────────────

function makeCtx(overrideParams?: Partial<WardrobeParams>): WardrobeContext {
  return {
    furnitureId: 'f1',
    p: { ...BASE_PARAMS, ...overrideParams },
    globalMaterialId: 'mdf_18',
    globalFinishId: 'raw',
    materialMap: EMPTY_MATERIAL_MAP,
  }
}

// ─── Tests: cuerpo estructural (shell) ───────────────────────

describe('generateShell', () => {
  it('genera 4 piezas cuando hasBack=true y hasSocle=false', () => {
    const parts = generateShell(makeCtx({ hasSocle: false }))
    // Laterales (×2 en una sola Part con quantity=2) + top + bottom + back = 4 items
    expect(parts).toHaveLength(4)
  })

  it('genera 5 piezas cuando hasBack=true y hasSocle=true', () => {
    const parts = generateShell(makeCtx())
    expect(parts).toHaveLength(5)
  })

  it('genera 3 piezas cuando hasBack=false y hasSocle=false', () => {
    const parts = generateShell(makeCtx({ hasBack: false, hasSocle: false }))
    expect(parts).toHaveLength(3)
  })

  it('los laterales tienen la profundidad total como length', () => {
    const parts = generateShell(makeCtx())
    const lateral = parts.find((p: Part) => p.label === 'Lateral')
    expect(lateral).toBeDefined()
    expect(lateral!.length).toBe(BASE_PARAMS.totalDepth)
    expect(lateral!.width).toBe(BASE_PARAMS.totalHeight)
  })

  it('el top tiene el ancho interior neto', () => {
    const parts = generateShell(makeCtx())
    const top = parts.find((p: Part) => p.label === 'Tapa superior')
    const expectedInnerWidth = BASE_PARAMS.totalWidth - 2 * BASE_PARAMS.boardThickness
    expect(top!.width).toBe(expectedInnerWidth)
  })

  it('todos los IDs de pieza son únicos', () => {
    const parts = generateShell(makeCtx())
    const ids = parts.map((p: Part) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ─── Tests: función principal generateWardrobeParts ──────────

describe('generateWardrobeParts', () => {
  it('retorna un array no vacío para un ropero básico sin módulos', () => {
    const parts = generateWardrobeParts('f1', BASE_PARAMS, [], EMPTY_MATERIAL_MAP)
    expect(parts.length).toBeGreaterThan(0)
  })

  it('todas las piezas tienen furnitureId correcto', () => {
    const parts = generateWardrobeParts('furn_abc', BASE_PARAMS, [], EMPTY_MATERIAL_MAP)
    expect(parts.every(p => p.furnitureId === 'furn_abc')).toBe(true)
  })

  it('todas las dimensiones son positivas', () => {
    const modules = [makeShelfModule(2), makeDrawerModule()]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0)
      expect(part.width).toBeGreaterThan(0)
      expect(part.thickness).toBeGreaterThan(0)
      expect(part.quantity).toBeGreaterThan(0)
    }
  })

  it('agregar módulos incrementa el número de piezas', () => {
    const withoutModules = generateWardrobeParts('f1', BASE_PARAMS, [], EMPTY_MATERIAL_MAP)
    const withShelf = generateWardrobeParts('f1', BASE_PARAMS, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    expect(withShelf.length).toBeGreaterThan(withoutModules.length)
  })

  it('los IDs de piezas son únicos entre todos los módulos', () => {
    const modules = [
      makeShelfModule(2),
      makeDrawerModule(),
      makeHingedDoorModule(),
    ]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const ids = parts.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('es determinístico — dos llamadas con los mismos args dan el mismo resultado', () => {
    const parts1 = generateWardrobeParts('f1', BASE_PARAMS, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    const parts2 = generateWardrobeParts('f1', BASE_PARAMS, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    expect(parts1.map(p => p.label)).toEqual(parts2.map(p => p.label))
    expect(parts1.map(p => p.length)).toEqual(parts2.map(p => p.length))
  })
})

// ─── Tests: módulo shelf ──────────────────────────────────────

describe('generateShelf', () => {
  it('genera 1 Part con quantity = count', () => {
    const modules = [makeShelfModule(3)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const shelfParts = parts.filter(p => p.label === 'Estante')
    expect(shelfParts).toHaveLength(1)
    expect(shelfParts[0].quantity).toBe(3)
  })

  it('la profundidad del estante es menor a la profundidad total', () => {
    const modules = [makeShelfModule(1)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const shelf = parts.find(p => p.label === 'Estante')!
    expect(shelf.length).toBeLessThan(BASE_PARAMS.totalDepth)
  })

  it('el ancho del estante es el ancho interior neto', () => {
    const modules = [makeShelfModule(1)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const shelf = parts.find(p => p.label === 'Estante')!
    const expectedInnerWidth = BASE_PARAMS.totalWidth - 2 * BASE_PARAMS.boardThickness
    expect(shelf.width).toBe(expectedInnerWidth)
  })
})

// ─── Tests: módulo drawer ─────────────────────────────────────

describe('generateDrawer', () => {
  it('genera 5 partes por cajón (frente + frente int + trasero + 2 laterales + fondo)', () => {
    const modules = [makeDrawerModule()]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const drawerParts = parts.filter(p => p.moduleId === 'mod_drawer_1')
    // frente exterior, frente interior, trasero, laterales (1 part ×2), fondo = 5
    expect(drawerParts).toHaveLength(5)
  })

  it('el frente exterior tiene el ancho interior neto como length', () => {
    const modules = [makeDrawerModule()]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const front = parts.find(p => p.label === 'Frente cajón')!
    const expectedInnerWidth = BASE_PARAMS.totalWidth - 2 * BASE_PARAMS.boardThickness
    // El frente se construye como length=innerWidth, width=height del cajón
    expect(front.length).toBe(expectedInnerWidth)
  })

  it('el fondo del cajón es HDF (materialId = hdf_6)', () => {
    const modules = [makeDrawerModule()]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const bottom = parts.find(p => p.label === 'Fondo cajón')!
    expect(bottom.materialId).toBe('hdf_6')
    expect(bottom.thickness).toBe(6)
  })
})

// ─── Tests: módulo hinged_door ────────────────────────────────

describe('generateHingedDoor', () => {
  it('genera 1 Part con quantity=2 para 2 puertas', () => {
    const modules = [makeHingedDoorModule(2)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const doors = parts.filter(p => p.label === 'Puerta abatible')
    expect(doors).toHaveLength(1)
    expect(doors[0].quantity).toBe(2)
  })

  it('una sola puerta tiene ancho ≈ ancho interior - 2mm', () => {
    const modules = [makeHingedDoorModule(1)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const door = parts.find(p => p.label === 'Puerta abatible')!
    const innerWidth = BASE_PARAMS.totalWidth - 2 * BASE_PARAMS.boardThickness
    expect(door.width).toBeCloseTo(innerWidth - 2, 1)
  })
})

// ─── Tests: módulo sliding_door ───────────────────────────────

describe('generateSlidingDoor', () => {
  it('genera 1 Part con panelCount como quantity', () => {
    const modules = [makeSlidingDoorModule(3)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const panels = parts.filter(p => p.label === 'Panel corredero')
    expect(panels).toHaveLength(1)
    expect(panels[0].quantity).toBe(3)
  })
})

// ─── Tests: módulo vertical_divider ──────────────────────────

describe('generateVerticalDivider', () => {
  it('genera 1 Part cuando la posición es válida', () => {
    const modules = [makeVerticalDividerModule(600)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const dividers = parts.filter(p => p.label === 'Divisor vertical')
    expect(dividers).toHaveLength(1)
  })

  it('no genera piezas si la posición es 0', () => {
    const modules = [makeVerticalDividerModule(0)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const dividers = parts.filter(p => p.label === 'Divisor vertical')
    expect(dividers).toHaveLength(0)
  })

  it('no genera piezas si la posición supera el ancho interior', () => {
    const innerWidth = BASE_PARAMS.totalWidth - 2 * BASE_PARAMS.boardThickness
    const modules = [makeVerticalDividerModule(innerWidth + 10)]
    const parts = generateWardrobeParts('f1', BASE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const dividers = parts.filter(p => p.label === 'Divisor vertical')
    expect(dividers).toHaveLength(0)
  })
})

// ─── Tests: variaciones paramétricas ─────────────────────────

describe('variaciones paramétricas', () => {
  it('un ropero más ancho produce partes interiores más anchas', () => {
    const narrow = generateWardrobeParts('f1', { ...BASE_PARAMS, totalWidth: 900 }, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    const wide = generateWardrobeParts('f1', { ...BASE_PARAMS, totalWidth: 2400 }, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    const narrowShelf = narrow.find(p => p.label === 'Estante')!
    const wideShelf = wide.find(p => p.label === 'Estante')!
    expect(wideShelf.width).toBeGreaterThan(narrowShelf.width)
  })

  it('un tablero más grueso no rompe la generación', () => {
    const parts = generateWardrobeParts(
      'f1',
      { ...BASE_PARAMS, boardThickness: 25 },
      [makeShelfModule()],
      EMPTY_MATERIAL_MAP,
    )
    expect(parts.length).toBeGreaterThan(0)
  })
})
