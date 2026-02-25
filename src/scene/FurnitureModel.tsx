// ============================================================
// FURNITURE STUDIO — FurnitureModel
// Renderiza un Furniture completo a partir de sus parts[]
// ============================================================

import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Furniture, Part } from '@/engine/types'
import { partPosition, partScale, partColor } from './FurnitureParts'

// ─── Props ───────────────────────────────────────────────────

interface FurnitureModelProps {
  furniture: Furniture
  isSelected: boolean
  onClick: () => void
}

// ─── Pieza individual ────────────────────────────────────────

interface PartMeshProps {
  part: Part
  partIndex: number
  furniture: Furniture
  isSelected: boolean
}

function PartMesh({ part, partIndex, furniture, isSelected }: PartMeshProps) {
  const position = partPosition(part, partIndex, furniture)
  const scale = partScale(part)
  const color = partColor(part)

  return (
    <mesh
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? '#3b82f6' : '#000000'}
        emissiveIntensity={isSelected ? 0.15 : 0}
      />
    </mesh>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function FurnitureModel({
  furniture,
  isSelected,
  onClick,
}: FurnitureModelProps) {
  const { params, position, rotationY, result } = furniture

  // Dimensiones globales en unidades de escena
  const { W, H, D } = useMemo(() => {
    const p = params as {
      totalWidth: number
      totalHeight: number
      totalDepth: number
    }
    return {
      W: p.totalWidth / 1000,
      H: p.totalHeight / 1000,
      D: p.totalDepth / 1000,
    }
  }, [params])

  // Posición global del mueble en la escena (position.y = 0 → sobre el suelo)
  const groupPosition: [number, number, number] = [
    position.x / 1000,
    position.y / 1000,
    position.z / 1000,
  ]

  // Rotación en radianes (rotationY está en grados)
  const rotationYRad = (rotationY * Math.PI) / 180

  // Handler de click con tipo correcto de r3f
  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    onClick()
  }

  // ── Sin resultado: placeholder wireframe ──────────────────
  if (!result || result.parts.length === 0) {
    return (
      <group
        position={groupPosition}
        rotation={[0, rotationYRad, 0]}
        onClick={handleClick}
      >
        <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, H, D]} />
          <meshStandardMaterial
            color="#94a3b8"
            transparent
            opacity={0.4}
            wireframe
          />
        </mesh>

        {/* Bounding box sólido semi-transparente para selección */}
        {isSelected && (
          <mesh position={[0, H / 2, 0]}>
            <boxGeometry args={[W, H, D]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={0.08}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    )
  }

  // ── Con resultado: renderizar piezas ──────────────────────
  // Expandir parts según quantity para posicionamiento individual
  const expandedParts: { part: Part; partIndex: number }[] = []
  let globalIndex = 0

  for (const part of result.parts) {
    for (let q = 0; q < part.quantity; q++) {
      expandedParts.push({ part, partIndex: globalIndex })
      globalIndex++
    }
  }

  return (
    <group
      position={groupPosition}
      rotation={[0, rotationYRad, 0]}
      onClick={handleClick}
    >
      {expandedParts.map(({ part, partIndex }) => (
        <PartMesh
          key={`${part.id}-${partIndex}`}
          part={part}
          partIndex={partIndex}
          furniture={furniture}
          isSelected={isSelected}
        />
      ))}

      {/* Overlay de selección */}
      {isSelected && (
        <mesh position={[0, H / 2, 0]}>
          <boxGeometry args={[W + 0.01, H + 0.01, D + 0.01]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.06}
            depthWrite={false}
            side={1} // BackSide — evita ocluir las piezas
          />
        </mesh>
      )}
    </group>
  )
}
