import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Scene from '@/scene/Scene'
import { useProjectStore } from '@/store/projectStore'

interface SceneAreaProps {
  bottomHeight?: number
}

export default function SceneArea(_props: SceneAreaProps) {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()
  const project = activeProject()

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
        <Scene />
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
        <div className="flex gap-1">
          <SceneButton label={t('scene.front')}       onClick={() => {}} />
          <SceneButton label={t('scene.side')}        onClick={() => {}} />
          <SceneButton label={t('scene.top')}         onClick={() => {}} />
          <SceneButton label={t('scene.perspective')} onClick={() => {}} active />
        </div>
        <div className="flex gap-1 justify-end">
          <SceneButton label={t('scene.center')} onClick={() => {}} />
          <SceneButton label="🚪" onClick={() => {}} title={t('scene.doors_open')} />
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
