// ============================================================
// FURNITURE STUDIO — ExplodedView
// Vista explosionada 3D del mueble activo
//
// Cada pieza se desplaza desde el centro multiplicando su
// posición local por explodeScale. El label (partCode o letra)
// flota sobre cada pieza usando <Text> de @react-three/drei.
//
// Animación suave con @react-spring/three: las piezas
// interpolan entre posición normal y explosionada con spring.
// ============================================================

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
// @ts-ignore — spring compat: @react-spring/three no expone tipos para r3f 9 perfectamente
import { useSpring, animated } from '@react-spring/three'
import type { Furniture, Part } from '@/engine/types'
import { partPosition, partScale, partColor } from './FurnitureParts'

// ─── Props ───────────────────────────────────────────────────

interface ExplodedViewProps {
  furniture: Furniture
  /** Factor de separación: 1.0 = posición normal, 2.0 = muy separado */
  explodeScale?: number
  /** Si true, muestra las piezas en posición explosionada; si false, en posición normal */
  exploded?: boolean
}

// ─── Pieza explosionada con animación spring ─────────────────

interface ExplodedPartProps {
  part: Part
  unitIndex: number
  furniture: Furniture
  explodeScale: number
  exploded: boolean
}

function ExplodedPart({
  part,
  unitIndex,
  furniture,
  explodeScale,
  exploded,
}: ExplodedPartProps) {
  const basePosition = partPosition(part, unitIndex, furniture)
  const scale = partScale(part)
  const color = partColor(part)

  // Posición normal (sin explosión)
  const normalPos: [number, number, number] = basePosition

  // Posición explosionada: alejar del centro multiplicando por factor
  // Para evitar que piezas en y=0 se hundan en el suelo, preservamos
  // la componente Y mínima (socle + medio de la pieza).
  const explodedPos: [number, number, number] = [
    basePosition[0] * explodeScale,
    basePosition[1] * explodeScale,
    basePosition[2] * explodeScale,
  ]

  // Spring: interpola suavemente entre posición normal y explosionada
  // @ts-ignore — spring compat: useSpring tipado para r3f 9
  const { position } = useSpring({
    position: exploded ? explodedPos : normalPos,
    config: { tension: 120, friction: 20 },
  })

  // Etiqueta de la pieza: partCode preferido, sino primeras 2 letras del label
  const label = part.partCode ?? part.label.slice(0, 2).toUpperCase()

  // Posición del texto: encima del centro de la pieza + pequeño offset vertical
  // Usamos el valor final (explodedPos o normalPos) para el label
  const targetY = exploded ? explodedPos[1] : normalPos[1]
  const textY = targetY + scale[1] * 0.5 + 0.04

  return (
    // @ts-ignore — spring compat: animated.group acepta position como SpringValue
    <animated.group position={position}>
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
        position={[0, textY - targetY, 0]}
        fontSize={0.07}
        color="#1e293b"
        anchorX="center"
        anchorY="bottom"
        // font={undefined} usa la fuente por defecto de Drei (Roboto via CDN)
      >
        {label}
      </Text>
    </animated.group>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function ExplodedView({
  furniture,
  explodeScale = 1.5,
  exploded = true,
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
          exploded={exploded}
        />
      ))}
    </group>
  )
}
