import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import { exportBOMAsCSV } from '@/services/exportCSV'
import { exportAllProjectsAsJSON } from '@/services/storage'

interface AppHeaderProps {
  onToggleLanguage: () => void
}

export default function AppHeader({ onToggleLanguage }: AppHeaderProps) {
  const { t, i18n } = useTranslation()
  const { activeProject, activeFurnitureId, updateProjectName } = useProjectStore()
  const project = activeProject()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    if (!dropdownOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  const handleExport = useCallback(
    async (action: () => Promise<void> | void) => {
      setDropdownOpen(false)
      setIsExporting(true)
      try {
        await action()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        alert(`Error al exportar: ${msg}`)
      } finally {
        setIsExporting(false)
      }
    },
    [],
  )

  // ── Acciones de exportación ──────────────────────────────────

  const handleExportCSV = useCallback(() => {
    handleExport(() => {
      if (!project) return
      // Consolidar todas las BOMs del proyecto activo
      const allParts = project.furnitures.flatMap(f => f.result?.bom.parts ?? [])
      const allHardware = project.furnitures.flatMap(f => f.result?.bom.hardware ?? [])
      const totalMaterials = allParts.reduce((s, i) => s + i.subtotal, 0)
      const totalHardware = allHardware.reduce((s, i) => s + i.subtotal, 0)
      const consolidatedBOM = {
        furnitureId: project.id,
        parts: allParts,
        hardware: allHardware,
        totalMaterials: Math.round(totalMaterials * 100) / 100,
        totalHardware: Math.round(totalHardware * 100) / 100,
        grandTotal: Math.round((totalMaterials + totalHardware) * 100) / 100,
      }
      exportBOMAsCSV(consolidatedBOM, `${project.name}-bom.csv`)
    })
  }, [project, handleExport])

  const handleExportGLB = useCallback(() => {
    handleExport(async () => {
      // TODO: Agente B implementará la exportación GLB desde la escena Three.js
      // La función exportSceneAsGLB requiere un Object3D de Three.js, no un Project.
      // Por ahora se muestra una notificación informativa.
      throw new Error('Exportación GLB no disponible aún. El Agente B completará este módulo.')
    })
  }, [handleExport])

  const handleExportPDFQuote = useCallback(() => {
    handleExport(async () => {
      if (!project) return
      const { generateQuotePDF } = await import('@/services/pdfQuote')
      return generateQuotePDF(project)
    })
  }, [project, handleExport])

  const handleExportPDFCutList = useCallback(() => {
    handleExport(async () => {
      if (!project) return
      const { generateCutListPDF } = await import('@/services/pdfCutList')
      return generateCutListPDF(project)
    })
  }, [project, handleExport])

  const handleExportPDFAssembly = useCallback(() => {
    handleExport(async () => {
      if (!project || !activeFurnitureId) return
      const { generateAssemblyPDF } = await import('@/services/pdfAssembly')
      return generateAssemblyPDF(project, activeFurnitureId)
    })
  }, [project, activeFurnitureId, handleExport])

  const handleExportJSON = useCallback(() => {
    handleExport(() => exportAllProjectsAsJSON())
  }, [handleExport])

  const noProject = !project
  const noActiveFurniture = !activeFurnitureId

  return (
    <header
      className="flex items-center justify-between px-4 h-12 bg-white border-b border-surface-200 shrink-0 z-10"
      style={{ height: '48px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="white" className="w-4 h-4">
            <rect x="2" y="2" width="5" height="12" rx="0.5" />
            <rect x="9" y="2" width="5" height="7" rx="0.5" />
            <rect x="9" y="11" width="5" height="3" rx="0.5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-800 hidden sm:block">
          {t('app.name')}
        </span>
      </div>

      {/* Nombre del proyecto — editable */}
      <div className="flex-1 flex justify-center px-4 max-w-md">
        {project ? (
          <input
            type="text"
            value={project.name}
            onChange={e => updateProjectName(e.target.value)}
            className="text-sm font-medium text-slate-700 text-center bg-transparent
                       border-b border-transparent hover:border-surface-200
                       focus:outline-none focus:border-primary-400
                       w-full max-w-xs transition-colors"
            placeholder={t('project.name_placeholder')}
          />
        ) : (
          <span className="text-sm text-slate-400">{t('app.tagline')}</span>
        )}
      </div>

      {/* Acciones globales */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle de idioma */}
        <button
          onClick={onToggleLanguage}
          className="btn-secondary text-xs px-2 py-1"
          title="Cambiar idioma / Change language"
        >
          {i18n.language === 'es' ? 'EN' : 'ES'}
        </button>

        {/* Dropdown de exportación */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="btn-secondary text-xs flex items-center gap-1"
            disabled={noProject || isExporting}
            onClick={() => setDropdownOpen(prev => !prev)}
          >
            {isExporting ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                {t('header.generating')}
              </>
            ) : (
              <>
                {t('header.export')}
                <svg viewBox="0 0 10 6" fill="currentColor" className="w-2.5 h-2.5">
                  <path d="M0 0l5 6 5-6H0z" />
                </svg>
              </>
            )}
          </button>

          {dropdownOpen && !isExporting && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-surface-200 rounded-lg shadow-lg z-50 py-1 text-xs">
              {/* CSV */}
              <ExportMenuItem
                emoji="📊"
                label={t('header.export_csv')}
                disabled={noProject}
                onClick={handleExportCSV}
              />
              {/* GLB */}
              <ExportMenuItem
                emoji="🔷"
                label={t('header.export_glb')}
                disabled={noProject}
                onClick={handleExportGLB}
              />

              <div className="my-1 border-t border-surface-100" />

              {/* PDF Cotización */}
              <ExportMenuItem
                emoji="📄"
                label={t('header.export_pdf_quote')}
                disabled={noProject}
                onClick={handleExportPDFQuote}
              />
              {/* PDF Lista de Corte */}
              <ExportMenuItem
                emoji="📋"
                label={t('header.export_pdf_cuts')}
                disabled={noProject}
                onClick={handleExportPDFCutList}
              />
              {/* PDF Manual de Armado — destacado */}
              <ExportMenuItem
                emoji="📖"
                label={t('header.export_pdf_assembly')}
                disabled={noProject || noActiveFurniture}
                onClick={handleExportPDFAssembly}
                highlight
              />

              <div className="my-1 border-t border-surface-100" />

              {/* JSON */}
              <ExportMenuItem
                emoji="💾"
                label={t('header.export_json')}
                disabled={false}
                onClick={handleExportJSON}
              />
            </div>
          )}
        </div>

        {/* Guardar visual (auto-save en localStorage) */}
        <button
          className="btn-primary text-xs"
          disabled={!project}
        >
          {t('actions.save')}
        </button>
      </div>
    </header>
  )
}

// ─── Sub-componente: opción del dropdown ──────────────────────

interface ExportMenuItemProps {
  emoji: string
  label: string
  disabled: boolean
  onClick: () => void
  highlight?: boolean
}

function ExportMenuItem({ emoji, label, disabled, onClick, highlight }: ExportMenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors',
        disabled
          ? 'opacity-40 cursor-not-allowed text-slate-400'
          : 'hover:bg-surface-50 text-slate-700',
        highlight && !disabled
          ? 'font-semibold text-primary-700'
          : '',
      ].join(' ')}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
