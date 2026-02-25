// ============================================================
// FURNITURE STUDIO — engine/hardware.test.ts
// Unit tests del motor de inferencia de herrajes
// ============================================================

import { describe, it, expect } from 'vitest'
import { inferWardrobeHardware } from './hardware'
import type { WardrobeParams, Module } from './types'

// ─── Fixtures ────────────────────────────────────────────────

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

function makeModule(type: Module['type'], params: Module['params'], id = 'mod_1'): Module {
  return { id, type, order: 1, params }
}

// ─── Tests ────────────────────────────────────────────────────

describe('inferWardrobeHardware', () => {
  it('sin módulos no genera herrajes', () => {
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [])
    expect(hw).toHaveLength(0)
  })

  it('un cajón genera corredera + jalador (2 items)', () => {
    const mod = makeModule('drawer', {
      height: 200,
      slideType: 'basic',
      frontMaterialId: '',
      bodyMaterialId: '',
    })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    expect(hw).toHaveLength(2)
    expect(hw.some(h => h.type === 'drawer_slide')).toBe(true)
    expect(hw.some(h => h.type === 'handle')).toBe(true)
  })

  it('corredera soft_close tiene precio mayor a la básica', () => {
    const basic = makeModule('drawer', {
      height: 200, slideType: 'basic', frontMaterialId: '', bodyMaterialId: '',
    }, 'mod_basic')
    const softClose = makeModule('drawer', {
      height: 200, slideType: 'soft_close', frontMaterialId: '', bodyMaterialId: '',
    }, 'mod_soft')

    const hwBasic = inferWardrobeHardware('f1', BASE_PARAMS, [basic])
    const hwSoft = inferWardrobeHardware('f1', BASE_PARAMS, [softClose])

    const priceBasic = hwBasic.find(h => h.type === 'drawer_slide')!.unitPrice
    const priceSoft = hwSoft.find(h => h.type === 'drawer_slide')!.unitPrice
    expect(priceSoft).toBeGreaterThan(priceBasic)
  })

  it('2 puertas abatibles generan 4 bisagras y 2 jaladores', () => {
    const mod = makeModule('hinged_door', {
      count: 2,
      openDirection: 'both',
      materialId: '',
      handleType: 'bar',
    })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    const hinges = hw.filter(h => h.type === 'hinge')
    const handles = hw.filter(h => h.type === 'handle')
    expect(hinges[0].quantity).toBe(4)  // 2 puertas × 2 bisagras
    expect(handles[0].quantity).toBe(2) // 1 jalador por puerta
  })

  it('1 puerta abatible genera 2 bisagras y 1 jalador', () => {
    const mod = makeModule('hinged_door', {
      count: 1,
      openDirection: 'left',
      materialId: '',
      handleType: 'bar',
    })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    const hinges = hw.filter(h => h.type === 'hinge')
    const handles = hw.filter(h => h.type === 'handle')
    expect(hinges[0].quantity).toBe(2)
    expect(handles[0].quantity).toBe(1)
  })

  it('puerta corredera genera 1 kit de riel', () => {
    const mod = makeModule('sliding_door', { panelCount: 2, materialId: '' })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    const rails = hw.filter(h => h.type === 'sliding_door_rail')
    expect(rails).toHaveLength(1)
    expect(rails[0].quantity).toBe(1)
  })

  it('barra de colgar genera barra + soportes', () => {
    const mod = makeModule('hanging_rail', { height: 1800 })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    expect(hw.some(h => h.type === 'other')).toBe(true)          // barra
    expect(hw.some(h => h.type === 'hanging_rail_support')).toBe(true) // soportes
  })

  it('ropero > 1200mm ancho agrega soporte central en la barra', () => {
    const wideParams = { ...BASE_PARAMS, totalWidth: 1800 }
    const mod = makeModule('hanging_rail', { height: 1800 })
    const hw = inferWardrobeHardware('f1', wideParams, [mod])
    const supports = hw.find(h => h.type === 'hanging_rail_support')!
    expect(supports.quantity).toBe(3)  // 2 extremos + 1 central
  })

  it('ropero ≤ 1200mm solo necesita 2 soportes en la barra', () => {
    const narrowParams = { ...BASE_PARAMS, totalWidth: 1200 }
    const mod = makeModule('hanging_rail', { height: 1800 })
    const hw = inferWardrobeHardware('f1', narrowParams, [mod])
    const supports = hw.find(h => h.type === 'hanging_rail_support')!
    expect(supports.quantity).toBe(2)
  })

  it('estante ajustable genera 4 pines × count estantes', () => {
    const mod = makeModule('shelf', { count: 3, adjustable: true, materialId: '' })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    const pins = hw.find(h => h.type === 'shelf_pin')!
    expect(pins.quantity).toBe(12) // 3 × 4
  })

  it('estante NO ajustable no genera pines', () => {
    const mod = makeModule('shelf', { count: 3, adjustable: false, materialId: '' })
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, [mod])
    const pins = hw.filter(h => h.type === 'shelf_pin')
    expect(pins).toHaveLength(0)
  })

  it('todos los IDs de herraje son únicos', () => {
    const modules: Module[] = [
      makeModule('drawer', { height: 200, slideType: 'basic', frontMaterialId: '', bodyMaterialId: '' }, 'mod_1'),
      makeModule('hinged_door', { count: 2, openDirection: 'both', materialId: '', handleType: 'bar' }, 'mod_2'),
      makeModule('shelf', { count: 2, adjustable: true, materialId: '' }, 'mod_3'),
    ]
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, modules)
    const ids = hw.map(h => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos los herrajes tienen source = auto', () => {
    const modules: Module[] = [
      makeModule('drawer', { height: 200, slideType: 'basic', frontMaterialId: '', bodyMaterialId: '' }),
    ]
    const hw = inferWardrobeHardware('f1', BASE_PARAMS, modules)
    expect(hw.every(h => h.source === 'auto')).toBe(true)
  })
})
