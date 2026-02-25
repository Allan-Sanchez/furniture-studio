// ============================================================
// FURNITURE STUDIO — FurnitureParts helper
// Lógica de posicionamiento y escala de piezas individuales
//
// Convención del engine (mm):
//   Lateral:        length=depth, width=height, thickness=t
//   Tapa/Piso:      length=depth, width=innerWidth, thickness=t
//   Panel trasero:  length=innerWidth, width=innerHeight, thickness=bt
//   Estante:        length=depth, width=innerWidth, thickness=t
//   Zócalo:         length=innerWidth, width=socleH, thickness=t
//   Puerta:         length=height, width=width, thickness=t
//   Cajón (frente): length=innerWidth, width=drawerH, thickness=t
//
// Three.js boxGeometry scale: [X=ancho, Y=alto, Z=profundidad]
// Origen del mueble: centro en X, suelo en Y=0, centro en Z (local)
// ============================================================

import type { Part, Furniture, ParamSet } from '@/engine/types'

// ─── Helpers de params ───────────────────────────────────────

interface BaseParams {
  totalWidth: number
  totalHeight: number
  totalDepth: number
  boardThickness: number
}

function asBase(params: ParamSet): BaseParams {
  return params as BaseParams
}

function getSocleHeight(params: ParamSet): number {
  const p = params as { hasSocle?: boolean; socleHeight?: number }
  return p.hasSocle && p.socleHeight ? p.socleHeight : 0
}

function getBackThickness(params: ParamSet): number {
  const p = params as { hasBack?: boolean; backPanelThickness?: number }
  return p.hasBack && p.backPanelThickness ? p.backPanelThickness : 0
}

// ─── Clasificación de pieza ───────────────────────────────────

type PartCategory =
  | 'lateral'
  | 'top'
  | 'bottom'
  | 'back'
  | 'shelf'
  | 'zocalo'
  | 'door'
  | 'drawer_front'
  | 'drawer_body'
  | 'rail'
  | 'countertop'
  | 'divider'
  | 'other'

function classify(label: string): PartCategory {
  const l = label.toLowerCase()

  if (l.includes('lateral')) return 'lateral'
  if (l.includes('tapa superior') || l === 'top') return 'top'
  if (l.includes('piso inferior') || l.includes('bottom')) return 'bottom'
  if (l.includes('panel trasero') || l.includes('fondo')) return 'back'
  if (l.includes('zócalo') || l.includes('zocalo') || l.includes('socle')) return 'zocalo'
  if (l.includes('estante') || l.includes('shelf')) return 'shelf'
  if (l.includes('puerta') || l.includes('door') || l.includes('corredero') || l.includes('sliding')) return 'door'
  if (l.includes('frente cajón') || l.includes('frente cajon') || (l.includes('frente') && !l.includes('interior'))) return 'drawer_front'
  if (l.includes('frente interior') || l.includes('trasero cajón') || l.includes('lateral cajón') || l.includes('fondo cajón')) return 'drawer_body'
  if (l.includes('barra') || l.includes('rail') || l.includes('hanging')) return 'rail'
  if (l.includes('encimera') || l.includes('countertop')) return 'countertop'
  if (l.includes('divisor') || l.includes('divider')) return 'divider'
  return 'other'
}

// ─── Escala de pieza ─────────────────────────────────────────
//
// Retorna [scaleX, scaleY, scaleZ] en metros (unidades Three.js).
// X = ancho horizontal, Y = alto vertical, Z = profundidad.
//
// Para cada categoría mapeamos (length, width, thickness) del engine
// a los ejes correctos de Three.js.

export function partScale(part: Part): [number, number, number] {
  const cat = classify(part.label)
  const len = part.length / 1000
  const wid = part.width / 1000
  const thi = part.thickness / 1000

  switch (cat) {
    // length=depth, width=height, thickness=t  → X=t, Y=height, Z=depth
    case 'lateral':
      return [thi, wid, len]

    // length=depth, width=innerWidth, thickness=t → X=innerWidth, Y=t, Z=depth
    case 'top':
    case 'bottom':
    case 'shelf':
      return [wid, thi, len]

    // length=innerWidth, width=innerHeight, thickness=bt → X=innerWidth, Y=innerHeight, Z=bt
    case 'back':
      return [len, wid, thi]

    // length=innerWidth, width=socleH, thickness=t → X=innerWidth, Y=socleH, Z=t
    case 'zocalo':
      return [len, wid, thi]

    // Puertas: length=doorHeight, width=doorWidth, thickness=t → X=doorWidth, Y=doorHeight, Z=t
    case 'door':
      return [wid, len, thi]

    // Frente exterior cajón: length=innerWidth, width=drawerH, thickness=t → X=innerWidth, Y=drawerH, Z=t
    case 'drawer_front':
      return [len, wid, thi]

    // Cuerpo cajón (múltiples piezas pequeñas): aproximado como [innerWidth, bodyH, t]
    case 'drawer_body':
      return [len, wid, thi]

    // Encimera: length=depth+overhang, width=innerWidth+overhang, thickness=ct → X=innerWidth, Y=ct, Z=depth
    case 'countertop':
      return [wid, thi, len]

    // Divisor vertical: length=depth, width=innerH, thickness=t → X=t, Y=innerH, Z=depth
    case 'divider':
      return [thi, wid, len]

    // Barra: length=innerWidth, thin en Y y Z
    case 'rail':
      return [len, 0.02, 0.02]

    default:
      return [len, thi, wid]
  }
}

// ─── Posición de pieza ───────────────────────────────────────
//
// Retorna [x, y, z] en metros (coordenadas locales del grupo del mueble).
// Origen local: centro-inferior del mueble (x=0, y=0, z=0).

export function partPosition(
  part: Part,
  unitIndex: number,
  furniture: Furniture,
): [number, number, number] {
  const { totalWidth, totalHeight, totalDepth, boardThickness } =
    asBase(furniture.params)

  const W = totalWidth / 1000
  const H = totalHeight / 1000
  const D = totalDepth / 1000
  const t = boardThickness / 1000
  const bt = getBackThickness(furniture.params) / 1000
  const socleH = getSocleHeight(furniture.params) / 1000

  const innerW = W - 2 * t
  const innerH = H - 2 * t

  const cat = classify(part.label)
  const scale = partScale(part)

  switch (cat) {
    // Laterales: izquierdo y derecho, centrados en Y y Z
    case 'lateral': {
      const x = unitIndex === 0 ? -(W / 2 - t / 2) : (W / 2 - t / 2)
      return [x, H / 2, 0]
    }

    // Tapa superior: centrada en X, al tope en Y, centrada en Z
    case 'top':
      return [0, H - t / 2, 0]

    // Piso inferior: centrado en X, sobre el zócalo, centrado en Z
    case 'bottom':
      return [0, socleH + t / 2, 0]

    // Panel trasero: centrado en X e Y, pegado al fondo en Z
    case 'back': {
      const backY = socleH + t + innerH / 2  // centro entre piso y tapa
      return [0, backY, -(D / 2 - bt / 2)]
    }

    // Zócalo frontal: centrado en X, en la base en Y, al frente en Z
    case 'zocalo':
      return [0, socleH / 2, D / 2 - t / 2]

    // Estantes: distribuidos uniformemente en Y, centrados en X y Z
    case 'shelf': {
      const count = part.quantity > 0 ? part.quantity : 1
      const availH = innerH - socleH  // espacio interior útil
      let y: number
      if (count === 1) {
        y = socleH + t + availH / 2
      } else {
        // Distribuir N estantes en el espacio interior
        y = socleH + t + (availH / (count + 1)) * (unitIndex + 1)
      }
      // Retroceder del panel trasero
      const shelfZ = -bt / 2
      return [0, y, shelfZ]
    }

    // Puertas abatibles / correderas: centradas, al frente
    case 'door': {
      const numDoors = part.quantity
      // Dividir ancho interior entre las puertas
      const doorSlotW = innerW / numDoors
      const x = -(innerW / 2) + doorSlotW * unitIndex + doorSlotW / 2
      return [x, (socleH + t + (H - t)) / 2, D / 2 + scale[2] / 2]
    }

    // Frente cajón: al frente, apilados verticalmente
    case 'drawer_front': {
      const drawerH = scale[1]
      const y = socleH + t + drawerH / 2 + unitIndex * drawerH
      return [0, y, D / 2 + scale[2] / 2]
    }

    // Cuerpo cajón: pequeño offset visual, dentro del mueble
    case 'drawer_body': {
      const y = socleH + t + scale[1] / 2
      return [0, y, 0]
    }

    // Encimera: sobre la tapa superior
    case 'countertop':
      return [0, H + scale[1] / 2, 0]

    // Divisor vertical: distribuido en X, de piso a techo
    case 'divider': {
      const count = part.quantity > 0 ? part.quantity : 1
      const offsetX = -(innerW / 2) + (innerW / (count + 1)) * (unitIndex + 1)
      return [offsetX, (socleH + t + H - t) / 2, 0]
    }

    // Barra: en la altura configurada, centrada
    case 'rail': {
      const railH = (furniture.params as { hangingRailHeight?: number }).hangingRailHeight
      const y = railH ? railH / 1000 : H * 0.7
      return [0, y, 0]
    }

    default: {
      const offset = (unitIndex * 0.005) % 0.05
      return [offset, H / 2 + offset, offset]
    }
  }
}

// ─── Color de pieza ──────────────────────────────────────────

export function partColor(part: Part): string {
  const cat = classify(part.label)

  switch (cat) {
    case 'back':       return '#D4C5A9'  // crema oscuro — HDF
    case 'door':       return '#CBD5E1'  // azul pálido — puertas
    case 'drawer_front': return '#94a3b8' // slate — frente cajón
    case 'countertop': return '#9CA3AF'  // gris — encimera
    case 'zocalo':     return '#A8A29E'  // stone — zócalo
    case 'rail':       return '#6B7280'  // gris oscuro — barra
    case 'shelf':      return '#BFD0E0'  // azul claro — estantes
    default:           return '#B0C4DE'  // azul madera — estructural
  }
}

// ─── Detección de puertas ────────────────────────────────────

export function isDoorPart(part: Part): boolean {
  return classify(part.label) === 'door'
}

export function isSlidingDoor(part: Part): boolean {
  const l = part.label.toLowerCase()
  return l.includes('corredero') || l.includes('sliding')
}
