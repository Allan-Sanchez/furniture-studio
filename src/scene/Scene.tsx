import { useRef, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import * as THREE from 'three'
import { useProjectStore } from '@/store/projectStore'
import FurnitureModel from './FurnitureModel'

// ─── Tipos de referencia de cámara ───────────────────────────

export type CenterCameraFn = () => void

// ─── Contenido interno de la escena ──────────────────────────

interface SceneContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orbitRef: React.RefObject<any>
  onCenterReady: (fn: CenterCameraFn) => void
}

function SceneContent({ orbitRef, onCenterReady }: SceneContentProps) {
  const { activeFurnitures, activeFurnitureId, setActiveFurniture } =
    useProjectStore()
  const { camera } = useThree()

  const furnitures = activeFurnitures()

  // ── Auto-fit: centrar cámara sobre todos los muebles ──────
  const centerCamera = useCallback(() => {
    if (furnitures.length === 0) return

    // Calcular bounding box de todos los muebles
    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity
    let maxH = 0

    for (const f of furnitures) {
      const p = f.params as { totalWidth: number; totalHeight: number; totalDepth: number }
      const W = p.totalWidth / 1000
      const H = p.totalHeight / 1000
      const D = p.totalDepth / 1000
      const cx = f.position.x / 1000
      const cz = f.position.z / 1000

      minX = Math.min(minX, cx - W / 2)
      maxX = Math.max(maxX, cx + W / 2)
      minZ = Math.min(minZ, cz - D / 2)
      maxZ = Math.max(maxZ, cz + D / 2)
      maxH = Math.max(maxH, H)
    }

    const centerX = (minX + maxX) / 2
    const centerZ = (minZ + maxZ) / 2
    const centerY = maxH / 2

    const spanX = maxX - minX
    const spanZ = maxZ - minZ
    const span = Math.max(spanX, spanZ, maxH, 1)

    const target = new THREE.Vector3(centerX, centerY, centerZ)
    const distance = span * 1.8

    // Actualizar target de OrbitControls
    if (orbitRef.current) {
      orbitRef.current.target.copy(target)
      orbitRef.current.update()
    }

    // Mover cámara
    camera.position.set(
      centerX + distance * 0.6,
      centerY + distance * 0.5,
      centerZ + distance * 0.6,
    )
    camera.lookAt(target)
  }, [furnitures, camera, orbitRef])

  // Exponer centerCamera al padre vía callback
  // Solo se llama una vez por render (se re-expone cuando furnitures cambia)
  // Usamos el patrón "ref callback sin useEffect" para mantenerlo sincronizado
  onCenterReady(centerCamera)

  return (
    <>
      {furnitures.map(furniture => (
        <FurnitureModel
          key={furniture.id}
          furniture={furniture}
          isSelected={furniture.id === activeFurnitureId}
          onClick={() => setActiveFurniture(furniture.id)}
        />
      ))}
    </>
  )
}

// ─── Escena principal ─────────────────────────────────────────

interface SceneProps {
  onCenterReady?: (fn: CenterCameraFn) => void
}

export default function Scene({ onCenterReady }: SceneProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null)
  const centerFnRef = useRef<CenterCameraFn>(() => {})

  const handleCenterReady = useCallback(
    (fn: CenterCameraFn) => {
      centerFnRef.current = fn
      onCenterReady?.(fn)
    },
    [onCenterReady],
  )

  return (
    <Canvas
      camera={{ position: [3, 2.5, 3], fov: 45, near: 0.01, far: 100 }}
      shadows
      style={{ background: '#f0f0f0', width: '100%', height: '100%' }}
    >
      {/* Iluminación */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />

      {/* Grid de piso */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#cbd5e1"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Plano de sombras */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.001, 0]}>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.08} />
      </mesh>

      {/* Muebles del proyecto activo */}
      <SceneContent orbitRef={orbitRef} onCenterReady={handleCenterReady} />

      {/* Controles de cámara */}
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={20}
        target={[0, 1.2, 0]}
      />

      {/* Gizmo de orientación */}
      <GizmoHelper alignment="bottom-left" margin={[60, 60]}>
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  )
}
