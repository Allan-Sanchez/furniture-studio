// ============================================================
// FURNITURE STUDIO — FurnitureModel
// Renderiza un Furniture completo a partir de sus parts[]
// Incluye: drag XZ, highlight de selección, toggle puertas
// ============================================================

import { useRef, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
// @ts-ignore — spring compat: @react-spring/three no expone tipos para r3f 9 perfectamente
import { useSpring, animated } from '@react-spring/three'
import type { Furniture, Part } from '@/engine/types'
import { useProjectStore } from '@/store/projectStore'
import { useUIStore } from '@/store/uiStore'
import { partPosition, partScale, partColor, isDoorPart, isSlidingDoor } from './FurnitureParts'

// ─── Umbral de movimiento para distinguir click vs drag ───────
const DRAG_THRESHOLD_PX = 5

// ─── Props ───────────────────────────────────────────────────

interface FurnitureModelProps {
  furniture: Furniture
  isSelected: boolean
  onClick: () => void
}

// ─── Pieza individual ────────────────────────────────────────

interface PartMeshProps {
  part: Part
  unitIndex: number
  furniture: Furniture
  showDoorsOpen: boolean
}

function PartMesh({ part, unitIndex, furniture, showDoorsOpen }: PartMeshProps) {
  const basePosition = partPosition(part, unitIndex, furniture)
  const scale = partScale(part)
  const color = partColor(part)

  const isDoor = isDoorPart(part)
  const isSlidingPart = isSlidingDoor(part)

  // ── Animación spring: puertas abatibles (rotación Y) ──────
  // @ts-ignore — spring compat
  const { rotY } = useSpring({
    rotY: isDoor && !isSlidingPart && showDoorsOpen
      ? (unitIndex % 2 === 0 ? Math.PI / 2 : -Math.PI / 2)
      : 0,
    config: { tension: 180, friction: 24 },
  })

  // ── Animación spring: puertas correderas (desplazamiento X) ─
  // @ts-ignore — spring compat
  const { slideX } = useSpring({
    slideX: isDoor && isSlidingPart && showDoorsOpen
      ? (unitIndex % 2 === 0 ? 1 : -1) * (scale[0] * 0.8)
      : 0,
    config: { tension: 180, friction: 24 },
  })

  return (
    // @ts-ignore — spring compat: animated.mesh acepta SpringValues como props
    <animated.mesh
      position-x={slideX.to((ox: number) => basePosition[0] + ox)}
      position-y={basePosition[1]}
      position-z={basePosition[2]}
      rotation-y={rotY}
      scale={scale}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </animated.mesh>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function FurnitureModel({
  furniture,
  isSelected,
  onClick,
}: FurnitureModelProps) {
  const { params, position, rotationY, result } = furniture
  const { updateFurniture } = useProjectStore()
  const { showDoors } = useUIStore()
  const { camera, gl, raycaster } = useThree()

  // ── Dimensiones globales en unidades de escena ────────────
  const { W, H, D } = useMemo(() => {
    const p = params as {
      totalWidth: number
      totalHeight: number
      totalDepth: number
    }
    return {
      W: (p.totalWidth ?? 1000) / 1000,
      H: (p.totalHeight ?? 2000) / 1000,
      D: (p.totalDepth ?? 600) / 1000,
    }
  }, [params])

  // ── Posición global del mueble en la escena ───────────────
  const groupPosition = useMemo<[number, number, number]>(
    () => [position.x / 1000, position.y / 1000, position.z / 1000],
    [position.x, position.y, position.z],
  )

  // ── Rotación en radianes ──────────────────────────────────
  const rotationYRad = useMemo(() => (rotationY * Math.PI) / 180, [rotationY])

  // ── Estado de drag ────────────────────────────────────────
  const isDragging = useRef(false)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  // Offset en el plano XZ entre el punto de click y el centro del mueble
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 })
  // Objeto THREE.Plane para intersección del raycaster con el suelo
  const xzPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])

  // ─── Handlers de drag ─────────────────────────────────────

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      // Capturar el pointer para recibir eventos fuera del mesh
      ;(e.target as Element).setPointerCapture(e.pointerId)
      pointerDownPos.current = { x: e.clientX, y: e.clientY }
      isDragging.current = false

      // Calcular offset: dónde dentro del mueble hizo click
      // Usamos el punto de intersección en XZ menos la posición actual del mueble
      if (e.point) {
        dragOffset.current = {
          x: e.point.x - position.x / 1000,
          z: e.point.z - position.z / 1000,
        }
      }
    },
    [position.x, position.z],
  )

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!pointerDownPos.current) return

      const dx = e.clientX - pointerDownPos.current.x
      const dz = e.clientY - pointerDownPos.current.y
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist < DRAG_THRESHOLD_PX) return

      // Marcar como drag real
      isDragging.current = true

      // Proyectar el mouse sobre el plano XZ usando el raycaster
      const rect = gl.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)

      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(xzPlane, intersection)

      if (!intersection) return

      const newX = (intersection.x - dragOffset.current.x) * 1000
      const newZ = (intersection.z - dragOffset.current.z) * 1000

      updateFurniture(furniture.id, {
        position: { x: newX, y: 0, z: newZ },
      })
    },
    [camera, gl, raycaster, xzPlane, furniture.id, updateFurniture],
  )

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      ;(e.target as Element).releasePointerCapture(e.pointerId)

      if (!isDragging.current) {
        // Fue un click simple → seleccionar mueble
        onClick()
      }

      isDragging.current = false
      pointerDownPos.current = null
    },
    [onClick],
  )

  // ── Piezas expandidas (una entrada por unidad) ────────────
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

  // ── Sin resultado: placeholder wireframe ──────────────────
  if (!result || result.parts.length === 0) {
    return (
      <group
        position={groupPosition}
        rotation={[0, rotationYRad, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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

        {/* Tarea 2 — Highlight de selección (Opción A: BackSide semitransparente) */}
        {isSelected && (
          <mesh position={[0, H / 2, 0]}>
            <boxGeometry args={[W + 0.02, H + 0.02, D + 0.02]} />
            <meshStandardMaterial
              color="#3b82f6"
              transparent
              opacity={0.08}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </group>
    )
  }

  // ── Con resultado: renderizar piezas ──────────────────────
  return (
    <group
      position={groupPosition}
      rotation={[0, rotationYRad, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {expandedParts.map(({ part, unitIndex }) => (
        <PartMesh
          key={`${part.id}-${unitIndex}`}
          part={part}
          unitIndex={unitIndex}
          furniture={furniture}
          showDoorsOpen={showDoors}
        />
      ))}

      {/* Tarea 2 — Highlight de selección (Opción A: BackSide semitransparente) */}
      {isSelected && (
        <mesh position={[0, H / 2, 0]}>
          <boxGeometry args={[W + 0.02, H + 0.02, D + 0.02]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.08}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}
