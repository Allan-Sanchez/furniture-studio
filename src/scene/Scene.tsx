import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useProjectStore } from '@/store/projectStore'
import FurnitureModel from './FurnitureModel'

// ─── Contenido de la escena (dentro del Canvas) ───────────────

function SceneContent() {
  const { activeFurnitures, activeFurnitureId, setActiveFurniture } =
    useProjectStore()

  const furnitures = activeFurnitures()

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

export default function Scene() {
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
      <SceneContent />

      {/* Controles de cámara */}
      <OrbitControls
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
