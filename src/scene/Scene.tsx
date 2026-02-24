import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useProjectStore } from '@/store/projectStore'

// Componente de prueba Fase 0: cubo reactivo al ancho del mueble activo
function DemoBox() {
  const { activeProject, activeFurnitureId } = useProjectStore()
  const project = activeProject()
  const furniture = project?.furnitures.find(f => f.id === activeFurnitureId)

  // Convertir mm a unidades de escena (1 unidad = 100mm)
  const w = furniture
    ? (furniture.params as { totalWidth: number }).totalWidth / 1000
    : 1.2
  const h = furniture
    ? (furniture.params as { totalHeight: number }).totalHeight / 1000
    : 2.4
  const d = furniture
    ? (furniture.params as { totalDepth: number }).totalDepth / 1000
    : 0.6

  return (
    <mesh position={[0, h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#94a3b8" wireframe={false} />
    </mesh>
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

      {/* Modelo de prueba — Fase 0 */}
      <DemoBox />

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
