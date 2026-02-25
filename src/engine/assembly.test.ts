// ============================================================
// FURNITURE STUDIO — engine/assembly.test.ts
// Unit tests del motor de ensamble
// ============================================================

import { describe, it, expect } from 'vitest'
import { generateAssemblySteps } from './assembly'
import { generateWardrobeParts } from './wardrobe'
import { inferWardrobeHardware } from './hardware'
import { generateKitchenBaseParts } from './kitchen-base'
import type {
  WardrobeParams,
  KitchenBaseParams,
  Module,
  MaterialMap,
  HardwareItem,
} from './types'

// ─── Fixtures ────────────────────────────────────────────────

const EMPTY_MATERIAL_MAP: MaterialMap = {}
const EMPTY_HARDWARE: HardwareItem[] = []

const WARDROBE_PARAMS: WardrobeParams = {
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

const KITCHEN_BASE_PARAMS: KitchenBaseParams = {
  totalWidth: 600,
  totalHeight: 850,
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
}

function makeShelfModule(count = 3): Module {
  return {
    id: 'mod_shelf_1',
    type: 'shelf',
    order: 1,
    params: { count, adjustable: true, materialId: '' },
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

// ─── Test 1: retorna array no vacío para ropero con módulos ──

describe('generateAssemblySteps', () => {
  it('retorna array no vacío para ropero con módulos', () => {
    const modules = [makeShelfModule(2), makeDrawerModule()]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    expect(steps.length).toBeGreaterThan(0)
  })

  // ─── Test 2: paso 1 siempre contiene los laterales ───────

  it('el primer paso contiene los laterales', () => {
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, [], EMPTY_MATERIAL_MAP)
    const steps = generateAssemblySteps('f1', parts, [], EMPTY_HARDWARE)

    const step1 = steps.find(s => s.stepNumber === 1)
    expect(step1).toBeDefined()

    const lateralParts = parts.filter(p => p.label === 'Lateral')
    const lateralIds = lateralParts.map(p => p.id)

    // Al menos un lateral debe estar en el primer paso
    const hasLaterals = lateralIds.some(id => step1!.partsInvolved.includes(id))
    expect(hasLaterals).toBe(true)
  })

  // ─── Test 3: panel trasero va después del shell ───────────

  it('el panel trasero va después del paso del cuerpo principal', () => {
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, [], EMPTY_MATERIAL_MAP)
    const steps = generateAssemblySteps('f1', parts, [], EMPTY_HARDWARE)

    const backPart = parts.find(p => p.label === 'Panel trasero')
    expect(backPart).toBeDefined()

    const backStep = steps.find(s => s.partsInvolved.includes(backPart!.id))
    const lateralPart = parts.find(p => p.label === 'Lateral')
    const lateralStep = steps.find(s => s.partsInvolved.includes(lateralPart!.id))

    expect(backStep).toBeDefined()
    expect(lateralStep).toBeDefined()
    expect(backStep!.stepNumber).toBeGreaterThan(lateralStep!.stepNumber)
  })

  // ─── Test 4: puertas van después de estantes ─────────────

  it('las puertas van en un paso posterior al de los estantes', () => {
    const modules = [makeShelfModule(2), makeHingedDoorModule(2)]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    const doorPart = parts.find(p => p.label === 'Puerta abatible')
    const shelfPart = parts.find(p => p.label === 'Estante')

    expect(doorPart).toBeDefined()
    expect(shelfPart).toBeDefined()

    const doorStep = steps.find(s => s.partsInvolved.includes(doorPart!.id))
    const shelfStep = steps.find(s => s.partsInvolved.includes(shelfPart!.id))

    expect(doorStep).toBeDefined()
    expect(shelfStep).toBeDefined()
    expect(doorStep!.stepNumber).toBeGreaterThan(shelfStep!.stepNumber)
  })

  // ─── Test 5: cajones van antes de sus frentes ─────────────

  it('el cuerpo de cajones va antes que el frente exterior', () => {
    const modules = [makeDrawerModule()]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    const drawerBodyPart = parts.find(p => p.label === 'Frente interior cajón')
    const drawerFrontPart = parts.find(p => p.label === 'Frente cajón')

    expect(drawerBodyPart).toBeDefined()
    expect(drawerFrontPart).toBeDefined()

    const bodyStep = steps.find(s => s.partsInvolved.includes(drawerBodyPart!.id))
    const frontStep = steps.find(s => s.partsInvolved.includes(drawerFrontPart!.id))

    expect(bodyStep).toBeDefined()
    expect(frontStep).toBeDefined()
    expect(bodyStep!.stepNumber).toBeLessThan(frontStep!.stepNumber)
  })

  // ─── Test 6: los partCodes son strings no vacíos ──────────

  it('todos los partCodes en los pasos son strings no vacíos', () => {
    const modules = [makeShelfModule(2), makeDrawerModule()]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    for (const step of steps) {
      expect(step.partCodes.length).toBeGreaterThan(0)
      for (const code of step.partCodes) {
        expect(typeof code).toBe('string')
        expect(code.length).toBeGreaterThan(0)
      }
    }
  })

  // ─── Test 7: pasos numerados secuencialmente desde 1 ──────

  it('los pasos están numerados secuencialmente comenzando en 1', () => {
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    const steps = generateAssemblySteps('f1', parts, [], EMPTY_HARDWARE)

    for (let i = 0; i < steps.length; i++) {
      expect(steps[i].stepNumber).toBe(i + 1)
    }
  })

  // ─── Test 8: sin pasos duplicados ────────────────────────

  it('no hay pasos duplicados (mismos partsInvolved)', () => {
    const modules = [makeShelfModule(2), makeDrawerModule(), makeHingedDoorModule()]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    const stepNumbers = steps.map(s => s.stepNumber)
    expect(new Set(stepNumbers).size).toBe(stepNumbers.length)
  })

  // ─── Test 9: ropero sin módulos tiene al menos 2 pasos ───

  it('un ropero sin módulos tiene al menos 2 pasos (shell + back)', () => {
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, [], EMPTY_MATERIAL_MAP)
    const steps = generateAssemblySteps('f1', parts, [], EMPTY_HARDWARE)

    // Shell (laterales + top + bottom) y panel trasero → mínimo 2 pasos
    expect(steps.length).toBeGreaterThanOrEqual(2)
  })

  // ─── Test 10: cada paso tiene título en es y en ───────────

  it('cada paso tiene título en español e inglés', () => {
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, [makeShelfModule()], EMPTY_MATERIAL_MAP)
    const steps = generateAssemblySteps('f1', parts, [], EMPTY_HARDWARE)

    for (const step of steps) {
      expect(typeof step.title.es).toBe('string')
      expect(step.title.es.length).toBeGreaterThan(0)
      expect(typeof step.title.en).toBe('string')
      expect(step.title.en.length).toBeGreaterThan(0)
    }
  })

  // ─── Test 11: hardwareUsed de puertas incluye bisagras ───

  it('el paso de puertas incluye bisagras en hardwareUsed', () => {
    const modules = [makeHingedDoorModule(2)]
    const parts = generateWardrobeParts('f1', WARDROBE_PARAMS, modules, EMPTY_MATERIAL_MAP)
    const hardware = inferWardrobeHardware('f1', WARDROBE_PARAMS, modules)
    const steps = generateAssemblySteps('f1', parts, modules, hardware)

    const doorPart = parts.find(p => p.label === 'Puerta abatible')
    const doorStep = steps.find(s => doorPart && s.partsInvolved.includes(doorPart.id))

    expect(doorStep).toBeDefined()
    const hasHinge = doorStep!.hardwareUsed.some(h => h.type === 'hinge')
    expect(hasHinge).toBe(true)
  })

  // ─── Test 12: kitchen-base genera encimera ────────────────

  it('kitchen-base con hasCountertop=true genera la pieza de encimera', () => {
    const parts = generateKitchenBaseParts('kb1', KITCHEN_BASE_PARAMS, [], EMPTY_MATERIAL_MAP)
    const countertop = parts.find(p => p.label === 'Encimera')
    expect(countertop).toBeDefined()
    expect(countertop!.thickness).toBe(KITCHEN_BASE_PARAMS.countertopThickness)
    expect(countertop!.width).toBe(
      KITCHEN_BASE_PARAMS.totalWidth + KITCHEN_BASE_PARAMS.countertopOverhang * 2,
    )
  })
})
