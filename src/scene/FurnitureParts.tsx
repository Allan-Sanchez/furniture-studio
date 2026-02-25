// ============================================================
// FURNITURE STUDIO — FurnitureParts helper
// Lógica de posicionamiento y color de piezas individuales
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

// ─── Posición de pieza ───────────────────────────────────────

/**
 * Retorna [x, y, z] en unidades de escena para un Part dado.
 * Origen del mueble: centro inferior (x=0, y=0, z=0 en local).
 * Convención: 1 unidad = 1 metro = 1000 mm
 *
 * @param part       - la pieza a posicionar
 * @param unitIndex  - índice 0-based dentro de su Part (para quantity > 1)
 * @param furniture  - mueble padre con params
 */
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
  const socleH = getSocleHeight(furniture.params) / 1000

  const label = part.label.toLowerCase()

  // ── Laterales (quantity=2) ────────────────────────────────
  // unitIndex=0 → lado izquierdo, unitIndex=1 → lado derecho
  if (label.includes('lateral')) {
    const x = unitIndex === 0 ? -(W / 2 - t / 2) : (W / 2 - t / 2)
    return [x, H / 2, 0]
  }

  // ── Tapa superior ─────────────────────────────────────────
  if (label.includes('tapa superior') || label.includes('tapa_superior')) {
    return [0, H - t / 2, 0]
  }

  // ── Piso inferior ─────────────────────────────────────────
  if (
    label.includes('piso inferior') ||
    label.includes('piso_inferior') ||
    label.includes('base')
  ) {
    return [0, socleH + t / 2, 0]
  }

  // ── Panel trasero / fondo ─────────────────────────────────
  if (
    label.includes('panel trasero') ||
    label.includes('fondo') ||
    label.includes('trasero') ||
    label.includes('back')
  ) {
    return [0, H / 2, -(D / 2 - t / 2)]
  }

  // ── Zócalo frontal ────────────────────────────────────────
  if (label.includes('zócalo') || label.includes('zocalo') || label.includes('socle')) {
    return [0, socleH / 2, D / 2]
  }

  // ── Estantes — distribución uniforme en Y ─────────────────
  // Para quantity=N estantes: posiciones i=0..N-1
  // y = socleH + t + (innerH - t) * i / (count - 1)  (cuando count > 1)
  if (label.includes('estante') || label.includes('shelf')) {
    const count = part.quantity > 0 ? part.quantity : 1
    const innerH = H - socleH - t * 2  // espacio interior entre piso y tapa
    let y: number
    if (count === 1) {
      y = socleH + t + innerH / 2
    } else {
      y = socleH + t + (innerH - t) * unitIndex / (count - 1)
    }
    return [0, y, 0]
  }

  // ── Frente cajón ──────────────────────────────────────────
  if (
    label.includes('frente') ||
    label.includes('cajón') ||
    label.includes('cajon') ||
    label.includes('drawer front')
  ) {
    const drawerH = part.width / 1000
    const y = socleH + t + drawerH / 2 + unitIndex * drawerH
    return [0, y, D / 2]
  }

  // ── Divisor vertical ──────────────────────────────────────
  if (label.includes('divisor') || label.includes('divider')) {
    const offsetX = (unitIndex - (part.quantity - 1) / 2) * (W / (part.quantity + 1))
    return [offsetX, H / 2, 0]
  }

  // ── Barra / hanging rail ──────────────────────────────────
  if (label.includes('barra') || label.includes('rail') || label.includes('hanging')) {
    const railH =
      (furniture.params as { hangingRailHeight?: number }).hangingRailHeight
    const y = railH ? railH / 1000 : H * 0.7
    return [0, y, 0]
  }

  // ── Encimera / countertop ─────────────────────────────────
  if (
    label.includes('encimera') ||
    label.includes('countertop') ||
    label.includes('tapa')
  ) {
    return [0, H, 0]
  }

  // Fallback: centro con pequeño offset basado en índice para evitar z-fighting
  const offset = (unitIndex * 0.005) % 0.05
  return [offset, H / 2 + offset, offset]
}

// ─── Escala de pieza ────────────────────────────────────────

/**
 * Retorna [length/1000, thickness/1000, width/1000] en unidades de escena.
 * Three.js usa: X=ancho, Y=alto, Z=profundidad.
 * Part: length = dimensión principal, width = segunda dimensión, thickness = grosor.
 */
export function partScale(part: Part): [number, number, number] {
  return [
    part.length / 1000,
    part.thickness / 1000,
    part.width / 1000,
  ]
}

// ─── Color de pieza ──────────────────────────────────────────

export function partColor(part: Part): string {
  const label = part.label.toLowerCase()

  if (
    label.includes('panel trasero') ||
    label.includes('fondo') ||
    label.includes('trasero') ||
    label.includes('hdf')
  ) {
    return '#E8D5B7' // crema — HDF
  }

  if (
    label.includes('frente') ||
    label.includes('cajón') ||
    label.includes('cajon')
  ) {
    return '#94a3b8' // slate — frente cajón
  }

  if (label.includes('puerta') || label.includes('door')) {
    return '#CBD5E1' // azul pálido — puertas
  }

  if (label.includes('encimera') || label.includes('countertop')) {
    return '#d1d5db' // gris claro — encimera
  }

  if (label.includes('zócalo') || label.includes('zocalo') || label.includes('socle')) {
    return '#a8a29e' // stone — zócalo
  }

  return '#B0C4DE' // azul madera claro — por defecto
}

// ─── Detección de puertas ────────────────────────────────────

export function isDoorPart(part: Part): boolean {
  const label = part.label.toLowerCase()
  return (
    label.includes('puerta') ||
    label.includes('door') ||
    label.includes('corredero') ||
    label.includes('sliding')
  )
}

export function isSlidingDoor(part: Part): boolean {
  const label = part.label.toLowerCase()
  return label.includes('corredero') || label.includes('sliding')
}
