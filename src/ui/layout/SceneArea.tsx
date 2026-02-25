import { Suspense, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Scene from '@/scene/Scene'
import type { CenterCameraFn, SetCameraPresetFn, CameraPreset } from '@/scene/Scene'
import { useProjectStore } from '@/store/projectStore'
import { useUIStore } from '@/store/uiStore'
import { exportProjectGLB, exportFurnitureGLB } from '@/services/exportGLB'
import type { Furniture } from '@/engine/types'
import type { Project } from '@/engine/types'

interface SceneAreaProps {
  bottomHeight?: number
}

export default function SceneArea(_props: SceneAreaProps) {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()
  const { showDoors, toggleDoors, cameraView, setCameraView } = useUIStore()
  const project = activeProject()

  // ── Estado local: modo explosionado ───────────────────────
  const [explodedMode, setExplodedMode] = useState(false)
  const toggleExploded = useCallback(() => setExplodedMode(m => !m), [])

  // ── Estado local: exportando GLB ──────────────────────────
  const [isExporting, setIsExporting] = useState(false)

  const handleExportGLB = useCallback(async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const activeFurniture = project?.furnitures.find(
        (f: Furniture) => f.id === activeFurnitureId,
      )
      if (activeFurniture?.result) {
        await exportFurnitureGLB(activeFurniture)
      } else if (project) {
        await exportProjectGLB(project as Project)
      }
    } catch (err) {
      console.error('[SceneArea] Error exportando GLB:', err)
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, project, activeFurnitureId])

  // ── Referencia a la función de centrado expuesta por Scene ─
  const centerCameraRef = useRef<CenterCameraFn>(() => {})
  const setCameraPresetRef = useRef<SetCameraPresetFn>(() => {})

  const handleCenterReady = useCallback((fn: CenterCameraFn) => {
    centerCameraRef.current = fn
  }, [])

  const handlePresetReady = useCallback((fn: SetCameraPresetFn) => {
    setCameraPresetRef.current = fn
  }, [])

  // ── Handler de vistas rápidas ──────────────────────────────
  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPresetRef.current(preset)
    setCameraView(preset)
  }, [setCameraView])

  // Encontrar el mueble activo para mostrar sus dimensiones
  const activeFurniture = project?.furnitures.find(f => f.id === activeFurnitureId)

  return (
    <div
      className="relative flex-1 bg-scene overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {/* Visor 3D */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-slate-400">Cargando visor 3D...</div>
        </div>
      }>
        <Scene
          onCenterReady={handleCenterReady}
          onPresetReady={handlePresetReady}
          explodedMode={explodedMode}
        />
      </Suspense>

      {/* ── Overlays superiores ── */}

      {/* Breadcrumb: Proyecto > Mueble */}
      {project && (
        <div className="absolute top-3 left-3 flex items-center gap-1 text-xs text-slate-500 bg-white/80 backdrop-blur-sm rounded px-2 py-1">
          <span className="font-medium text-slate-700">{project.name}</span>
          {activeFurniture && (
            <>
              <span className="text-slate-300">›</span>
              <span>{activeFurniture.name}</span>
            </>
          )}
        </div>
      )}

      {/* Dimensiones del mueble activo */}
      {activeFurniture && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-slate-600 bg-white/80 backdrop-blur-sm rounded px-2 py-1 font-mono">
          {(activeFurniture.params as { totalWidth: number; totalHeight: number; totalDepth: number }).totalWidth} ×{' '}
          {(activeFurniture.params as { totalWidth: number; totalHeight: number; totalDepth: number }).totalHeight} ×{' '}
          {(activeFurniture.params as { totalWidth: number; totalHeight: number; totalDepth: number }).totalDepth}{' '}
          <span className="text-slate-400">{t('scene.unit')}</span>
        </div>
      )}

      {/* Controles: vistas rápidas + toggle puertas */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {/* Botones de vistas rápidas */}
        <div className="flex gap-1">
          <SceneButton
            label={t('scene.front')}
            onClick={() => handleCameraPreset('front')}
            active={cameraView === 'front'}
          />
          <SceneButton
            label={t('scene.side')}
            onClick={() => handleCameraPreset('side')}
            active={cameraView === 'side'}
          />
          <SceneButton
            label={t('scene.top')}
            onClick={() => handleCameraPreset('top')}
            active={cameraView === 'top'}
          />
          <SceneButton
            label={t('scene.perspective')}
            onClick={() => handleCameraPreset('perspective')}
            active={cameraView === 'perspective'}
          />
        </div>
        <div className="flex gap-1 justify-end">
          <SceneButton
            label={t('scene.center')}
            onClick={() => centerCameraRef.current()}
          />
          <SceneButton
            label="🚪"
            onClick={toggleDoors}
            title={showDoors ? t('scene.doors_open') : t('scene.doors_closed')}
            active={showDoors}
          />
          <SceneButton
            label="💥"
            onClick={toggleExploded}
            title={explodedMode ? t('scene.normal_view') : t('scene.exploded_view')}
            active={explodedMode}
          />
          <SceneButton
            label={isExporting ? '…' : '📦'}
            onClick={handleExportGLB}
            title={t('scene.export_glb')}
            active={false}
          />
        </div>
      </div>

      {/* Indicador de unidad */}
      <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white/70 backdrop-blur-sm rounded px-1.5 py-0.5">
        {t('scene.unit')}
      </div>

      {/* Estado vacío */}
      {!project && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-16 h-16 text-slate-200">
            <svg viewBox="0 0 64 64" fill="currentColor">
              <rect x="8"  y="8"  width="20" height="48" rx="2" />
              <rect x="36" y="8"  width="20" height="28" rx="2" />
              <rect x="36" y="44" width="20" height="12" rx="2" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">
            Crea un proyecto para comenzar
          </p>
        </div>
      )}
    </div>
  )
}

interface SceneButtonProps {
  label: string
  onClick: () => void
  active?: boolean
  title?: string
}

function SceneButton({ label, onClick, active, title }: SceneButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      className={`scene-btn ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  )
}
