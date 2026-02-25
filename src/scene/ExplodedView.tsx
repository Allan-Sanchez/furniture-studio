// ============================================================
// FURNITURE STUDIO — ExplodedView
// Vista explosionada 3D del mueble activo
//
// Cada pieza se desplaza desde el centro multiplicando su
// posición local por explodeScale. El label (partCode o letra)
// flota sobre cada pieza usando <Text> de @react-three/drei.
//
// TODO: Animación suave con @react-spring/three no está
// instalada en este proyecto. Las piezas aparecen en su
// posición final sin transición animada.
// Para habilitarla: pnpm add @react-spring/three y descomentar
// el bloque de useSpring en este archivo.
// ============================================================

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import type { Furniture, Part } from '@/engine/types'
import { partPosition, partScale, partColor } from './FurnitureParts'

// ─── Props ───────────────────────────────────────────────────

interface ExplodedViewProps {
  furniture: Furniture
  /** Factor de separación: 1.0 = posición normal, 2.0 = muy separado */
  explodeScale?: number
}

// ─── Pieza explosionada ──────────────────────────────────────

interface ExplodedPartProps {
  part: Part
  unitIndex: number
  furniture: Furniture
  explodeScale: number
}

function ExplodedPart({
  part,
  unitIndex,
  furniture,
  explodeScale,
}: ExplodedPartProps) {
  const basePosition = partPosition(part, unitIndex, furniture)
  const scale = partScale(part)
  const color = partColor(part)

  // Offset explosionado: alejar del centro (origen = 0,0,0 del grupo)
  // Multiplicamos la posición local por el factor de explosión.
  // Para evitar que piezas en y=0 se hundan en el suelo, preservamos
  // la componente Y mínima (socle + medio de la pieza).
  const ex = basePosition[0] * explodeScale
  const ey = basePosition[1] * explodeScale
  const ez = basePosition[2] * explodeScale

  // Etiqueta de la pieza: partCode preferido, sino primeras 2 letras del label
  const label = part.partCode ?? part.label.slice(0, 2).toUpperCase()

  // Posición del texto: encima del centro de la pieza + pequeño offset vertical
  const textY = ey + scale[1] * 0.5 + 0.04

  return (
    <group position={[ex, ey, ez]}>
      {/* Mesh de la pieza */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[scale[0], scale[1], scale[2]]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.05}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Borde de contorno para destacar la pieza */}
      <mesh>
        <boxGeometry args={[scale[0] + 0.002, scale[1] + 0.002, scale[2] + 0.002]} />
        <meshStandardMaterial
          color="#475569"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Label flotante */}
      <Text
        position={[0, textY - ey, 0]}
        fontSize={0.07}
        color="#1e293b"
        anchorX="center"
        anchorY="bottom"
        // font={undefined} usa la fuente por defecto de Drei (Roboto via CDN)
      >
        {label}
      </Text>
    </group>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function ExplodedView({
  furniture,
  explodeScale = 1.5,
}: ExplodedViewProps) {
  const { result } = furniture

  // Expandir piezas por quantity (igual que FurnitureModel)
  const expandedParts = useMemo(() => {
    if (!result || result.parts.length === 0) return []
    const list: { part: Part; unitIndex: number }[] = []
    for (const part of result.parts) {
      for (let q = 0; q < part.quantity; q++) {
        list.push({ part, unitIndex: q })
      }
    }
    return list
  }, [result])

  // Posición global del mueble en la escena (igual que FurnitureModel)
  const groupPosition: [number, number, number] = [
    furniture.position.x / 1000,
    furniture.position.y / 1000,
    furniture.position.z / 1000,
  ]
  const rotationYRad = (furniture.rotationY * Math.PI) / 180

  if (expandedParts.length === 0) {
    return null
  }

  return (
    <group position={groupPosition} rotation={[0, rotationYRad, 0]}>
      {expandedParts.map(({ part, unitIndex }) => (
        <ExplodedPart
          key={`${part.id}-${unitIndex}`}
          part={part}
          unitIndex={unitIndex}
          furniture={furniture}
          explodeScale={explodeScale}
        />
      ))}
    </group>
  )
}
