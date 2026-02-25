// ============================================================
// FURNITURE STUDIO — engine/assembly.ts
// Motor de instrucciones de armado (Assembly Steps)
// TypeScript PURO — sin React
// ============================================================

import type {
  Part,
  Module,
  AssemblyStep,
  AssemblyHardwareUsed,
  HardwareItem,
} from './types'

// ─── Orden de prioridad de ensamble ─────────────────────────
// Menor número = primero en armar

const ASSEMBLY_ORDER: Record<string, number> = {
  'Lateral': 1,
  'Lateral base': 1,
  'Lateral columna': 1,
  'Tapa superior': 2,
  'Tapa superior base': 2,
  'Top columna': 2,
  'Piso inferior': 2,
  'Piso inferior base': 2,
  'Piso columna': 2,
  'Panel trasero': 3,
  'Panel trasero columna': 3,
  'Panel trasero base': 3,
  'Zócalo frontal': 4,
  'Zócalo trasero': 4,
  'Divisor vertical': 5,
  'Estante': 6,
  'Frente interior cajón': 7,
  'Trasero cajón': 7,
  'Lateral cajón': 7,
  'Fondo cajón': 7,
  'Frente cajón': 8,
  'Puerta abatible': 9,
  'Panel corredero': 9,
  'Encimera': 10,
  'Panel posterior elevado': 10,
  // fallback → 6
}

// ─── Títulos y descripciones por prioridad ───────────────────

const STEP_TITLES: Record<number, { es: string; en: string }> = {
  1: { es: 'Armar el cuerpo principal', en: 'Assemble the main body' },
  2: { es: 'Fijar tapa superior y piso inferior', en: 'Fix top and bottom panels' },
  3: { es: 'Instalar panel trasero', en: 'Install the back panel' },
  4: { es: 'Instalar zócalo', en: 'Install kick plate' },
  5: { es: 'Instalar divisores verticales', en: 'Install vertical dividers' },
  6: { es: 'Instalar estantes', en: 'Install shelves' },
  7: { es: 'Armar cuerpo de cajones', en: 'Assemble drawer bodies' },
  8: { es: 'Instalar frentes de cajones', en: 'Install drawer fronts' },
  9: { es: 'Instalar puertas', en: 'Install doors' },
  10: { es: 'Instalar encimera y herrajes finales', en: 'Install countertop and final hardware' },
}

const STEP_DESCRIPTIONS: Record<number, { es: string; en: string }> = {
  1: {
    es: 'Armar el cuerpo principal. Unir los laterales al piso inferior y a la tapa superior. Verificar escuadra con cinta métrica diagonal.',
    en: 'Assemble the main body. Join the side panels to the bottom and top panels. Check squareness with diagonal tape measure.',
  },
  2: {
    es: 'Fijar la tapa superior y el piso inferior entre los laterales. Verificar que queden al hilo y en escuadra.',
    en: 'Fix the top and bottom panels between the side panels. Verify they are flush and square.',
  },
  3: {
    es: 'Instalar el panel trasero. Colocar encajado entre los laterales desde la parte posterior. Atornillar perimetralmente cada 200mm.',
    en: 'Install the back panel. Place it fitted between the side panels from the rear. Screw perimetrically every 200mm.',
  },
  4: {
    es: 'Instalar el zócalo. Fijar en la parte inferior frontal y posterior con tornillos desde el interior.',
    en: 'Install the kick plate. Secure at the bottom front and rear with screws from the inside.',
  },
  5: {
    es: 'Instalar divisores verticales en la posición indicada. Verificar que queden a plomo y en escuadra.',
    en: 'Install vertical dividers at the indicated position. Verify they are plumb and square.',
  },
  6: {
    es: 'Instalar estantes fijos. Para estantes ajustables, insertar los pines regulables primero.',
    en: 'Install fixed shelves. For adjustable shelves, insert the shelf pins first.',
  },
  7: {
    es: 'Instalar cuerpo de cajones. Fijar las correderas en los laterales del cuerpo. Insertar los cajones y ajustar nivel.',
    en: 'Install drawer bodies. Fix slides to the body sides. Insert drawers and adjust level.',
  },
  8: {
    es: 'Instalar frentes de cajones. Ajustar alineación horizontal y vertical hasta quedar al hilo con los cajones adyacentes.',
    en: 'Install drawer fronts. Adjust horizontal and vertical alignment until flush with adjacent drawers.',
  },
  9: {
    es: 'Instalar puertas. Colocar bisagras según plantilla. Ajustar regulación horizontal y vertical hasta quedar al hilo.',
    en: 'Install doors. Place hinges according to template. Adjust horizontal and vertical regulation until flush.',
  },
  10: {
    es: 'Colocar la encimera y los herrajes finales: jaladores, pines de estante y accesorios adicionales. Revisión final de ajuste.',
    en: 'Place the countertop and install final hardware: handles, shelf pins, and additional accessories. Final adjustment review.',
  },
}

// ─── Herrajes por prioridad de paso ─────────────────────────

function buildShellHardware(parts: Part[]): AssemblyHardwareUsed[] {
  // Estima 3 tornillos por unión, mínimo 6
  // Cada lateral toca top y bottom (2 uniones por lateral, ×2 laterales = 4 uniones + extras)
  const unionCount = Math.max(2, parts.length) * 2
  const screwCount = Math.max(6, unionCount * 3)

  return [
    {
      type: 'other',
      quantity: screwCount,
      description: 'Tornillo estructural 6×40mm',
    },
  ]
}

function buildBackHardware(parts: Part[]): AssemblyHardwareUsed[] {
  // Estima tornillos perimetrales cada 200mm
  const backPart = parts.find(p =>
    p.label === 'Panel trasero' ||
    p.label === 'Panel trasero columna' ||
    p.label === 'Panel trasero base',
  )

  const innerWidth = backPart?.length ?? 800
  const innerHeight = backPart?.width ?? 600
  const screwCount = Math.max(4, Math.round(innerWidth / 200) + Math.round(innerHeight / 200))

  return [
    {
      type: 'other',
      quantity: screwCount,
      description: 'Tornillo HDF 3.5×16mm',
    },
  ]
}

function buildDrawerHardware(hardware: HardwareItem[]): AssemblyHardwareUsed[] {
  const result: AssemblyHardwareUsed[] = []

  const slides = hardware.filter(h => h.type === 'drawer_slide')
  if (slides.length > 0) {
    const totalSlides = slides.reduce((sum, h) => sum + h.quantity, 0)
    result.push({
      type: 'drawer_slide',
      quantity: totalSlides,
      description: 'Corredera cajón (par)',
    })
  }

  // Tornillos de montaje de correderas
  const slideScrews = slides.reduce((sum, h) => sum + h.quantity, 0) * 4
  if (slideScrews > 0) {
    result.push({
      type: 'other',
      quantity: slideScrews,
      description: 'Tornillo montaje corredera 3.5×16mm',
    })
  }

  return result
}

function buildDoorHardware(hardware: HardwareItem[]): AssemblyHardwareUsed[] {
  const result: AssemblyHardwareUsed[] = []

  const hinges = hardware.filter(h => h.type === 'hinge')
  if (hinges.length > 0) {
    const totalHinges = hinges.reduce((sum, h) => sum + h.quantity, 0)
    result.push({
      type: 'hinge',
      quantity: totalHinges,
      description: 'Bisagra de cazoleta 35mm',
    })
  }

  const handles = hardware.filter(h => h.type === 'handle')
  if (handles.length > 0) {
    const totalHandles = handles.reduce((sum, h) => sum + h.quantity, 0)
    result.push({
      type: 'handle',
      quantity: totalHandles,
      description: 'Jalador de puerta',
    })
  }

  const rails = hardware.filter(h => h.type === 'sliding_door_rail')
  if (rails.length > 0) {
    result.push({
      type: 'sliding_door_rail',
      quantity: rails.length,
      description: 'Kit riel corredero',
    })
  }

  return result
}

function buildSocleHardware(): AssemblyHardwareUsed[] {
  return [
    {
      type: 'other',
      quantity: 6,
      description: 'Tornillo zócalo 4×30mm',
    },
  ]
}

function buildShelfHardware(parts: Part[], hardware: HardwareItem[]): AssemblyHardwareUsed[] {
  const result: AssemblyHardwareUsed[] = []

  const shelfPins = hardware.filter(h => h.type === 'shelf_pin')
  if (shelfPins.length > 0) {
    const totalPins = shelfPins.reduce((sum, h) => sum + h.quantity, 0)
    result.push({
      type: 'shelf_pin',
      quantity: totalPins,
      description: 'Pin regulable estante 5mm',
    })
  }

  // Tornillos para estantes fijos
  const fixedShelfCount = parts.length
  if (fixedShelfCount > 0) {
    result.push({
      type: 'other',
      quantity: fixedShelfCount * 4,
      description: 'Tornillo estante fijo 4×30mm',
    })
  }

  return result
}

// ─── Obtener el código de pieza ──────────────────────────────

function getPartCode(part: Part, allParts: Part[]): string {
  if (part.partCode) return part.partCode
  const index = allParts.indexOf(part)
  return index >= 0 ? String.fromCharCode(65 + index) : '?'
}

// ─── Función principal exportada ─────────────────────────────

/**
 * Genera los pasos de ensamble para un mueble.
 *
 * @param furnitureId — ID del mueble
 * @param parts       — Piezas generadas por el motor (con partCode asignado)
 * @param modules     — Módulos internos del mueble
 * @param hardware    — Herrajes inferidos
 * @returns           — Array de AssemblyStep[] numerados secuencialmente
 */
export function generateAssemblySteps(
  _furnitureId: string,
  parts: Part[],
  _modules: Module[],
  hardware: HardwareItem[],
): AssemblyStep[] {
  // 1. Agrupar piezas por prioridad
  const byPriority = new Map<number, Part[]>()

  for (const part of parts) {
    const priority = ASSEMBLY_ORDER[part.label] ?? 6
    if (!byPriority.has(priority)) {
      byPriority.set(priority, [])
    }
    byPriority.get(priority)!.push(part)
  }

  // 2. Ordenar prioridades
  const sortedPriorities = [...byPriority.keys()].sort((a, b) => a - b)

  // 3. Crear pasos por grupo de prioridad
  const steps: AssemblyStep[] = []

  for (const priority of sortedPriorities) {
    const groupParts = byPriority.get(priority)!
    if (groupParts.length === 0) continue

    const partsInvolved = groupParts.map(p => p.id)
    const partCodes = groupParts.map(p => getPartCode(p, parts))

    // Eliminar códigos duplicados (hay piezas con quantity > 1 que comparten código)
    const uniquePartCodes = [...new Set(partCodes)]

    // 4. Determinar título y descripción según prioridad
    // Prioridades 1 y 2 se combinan en el paso de shell
    const titlePriority = priority <= 2 ? 1 : priority
    const title = STEP_TITLES[titlePriority] ?? STEP_TITLES[6]
    const description = STEP_DESCRIPTIONS[titlePriority] ?? STEP_DESCRIPTIONS[6]

    // 5. Hardware por paso
    let hardwareUsed: AssemblyHardwareUsed[] = []

    if (priority <= 2) {
      hardwareUsed = buildShellHardware(groupParts)
    } else if (priority === 3) {
      hardwareUsed = buildBackHardware(groupParts)
    } else if (priority === 4) {
      hardwareUsed = buildSocleHardware()
    } else if (priority === 6) {
      hardwareUsed = buildShelfHardware(groupParts, hardware)
    } else if (priority === 7 || priority === 8) {
      hardwareUsed = buildDrawerHardware(hardware)
    } else if (priority === 9) {
      hardwareUsed = buildDoorHardware(hardware)
    }

    steps.push({
      stepNumber: 0, // se renumera al final
      title,
      description,
      partsInvolved,
      partCodes: uniquePartCodes,
      hardwareUsed,
    })
  }

  // 6. Renumerar secuencialmente desde 1
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
  }))
}
