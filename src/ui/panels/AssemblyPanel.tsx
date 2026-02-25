import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { AssemblyStep } from '@/engine/types'

// ─── Componente principal ─────────────────────────────────────

export default function AssemblyPanel() {
  const { t, i18n } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()

  const project = activeProject()
  const lang = (i18n.language === 'es' ? 'es' : 'en') as 'es' | 'en'

  if (!project) {
    return <EmptyState text={t('assembly.no_furniture')} />
  }

  const furniture = activeFurnitureId
    ? project.furnitures.find(f => f.id === activeFurnitureId) ?? null
    : null

  if (!furniture) {
    return <EmptyState text={t('assembly.no_furniture')} />
  }

  const steps: AssemblyStep[] = furniture.result?.assemblySteps ?? []

  return (
    <div className="space-y-3">
      {/* Header del mueble */}
      <div className="space-y-0.5">
        <p className="text-xs text-slate-500 font-medium truncate">{furniture.name}</p>
        {steps.length > 0 && (
          <p className="text-[10px] text-slate-400">
            {t('assembly.steps_count', { count: steps.length })}
          </p>
        )}
      </div>

      {/* Lista de pasos o estado vacío */}
      {steps.length === 0 ? (
        <EmptyState text={t('assembly.no_steps')} />
      ) : (
        <div className="space-y-2">
          {steps.map(step => (
            <AssemblyStepCard key={step.stepNumber} step={step} lang={lang} />
          ))}
        </div>
      )}

      {/* Botón exportar PDF */}
      <div className="pt-2">
        <button
          onClick={() => {
            // TODO: implementar exportación a PDF del manual de armado
            console.log('TODO: PDF')
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded border border-surface-200 text-[11px] text-slate-600 hover:bg-surface-50 transition-colors"
        >
          <span>📄</span>
          <span>{t('assembly.export_manual')}</span>
        </button>
      </div>
    </div>
  )
}

// ─── Tarjeta de paso individual ───────────────────────────────

function AssemblyStepCard({ step, lang }: { step: AssemblyStep; lang: 'es' | 'en' }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const title = step.title[lang]
  const description = step.description[lang]
  const partCount = step.partCodes.length

  return (
    <div className="border border-surface-200 rounded overflow-hidden">
      {/* Header del paso */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-[10px] font-semibold text-slate-400 tabular-nums">
            {t('assembly.step', { number: step.stepNumber })}
          </span>
          <span className="text-[11px] font-medium text-slate-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {partCount > 0 && (
            <span className="text-[9px] bg-primary-100 text-primary-700 rounded px-1.5 py-0.5 font-semibold">
              {partCount}
            </span>
          )}
          <span className="text-slate-400 text-[10px]">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Contenido expandido */}
      {open && (
        <div className="px-2.5 pb-3 space-y-2.5 border-t border-surface-100 bg-surface-50">
          {/* Piezas involucradas */}
          {step.partCodes.length > 0 && (
            <div className="pt-2 space-y-1">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('assembly.parts_involved')}
              </p>
              <ul className="space-y-0.5">
                {step.partCodes.map(code => (
                  <li key={code} className="text-[10px] text-slate-600 font-mono">
                    {code}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Herrajes requeridos */}
          {step.hardwareUsed.length > 0 && (
            <div className="space-y-1">
              <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('assembly.hardware_used')}
              </p>
              <ul className="space-y-0.5">
                {step.hardwareUsed.map((hw, idx) => (
                  <li key={idx} className="text-[10px] text-slate-600">
                    <span className="font-semibold">{t('assembly.quantity_x', { qty: hw.quantity })}</span>{' '}
                    {hw.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Separador */}
          {(step.partCodes.length > 0 || step.hardwareUsed.length > 0) && description && (
            <hr className="border-surface-200" />
          )}

          {/* Descripción del paso */}
          {description && (
            <p className="text-[10px] text-slate-600 leading-relaxed">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Estado vacío ─────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60px] text-xs text-slate-400 italic">
      {text}
    </div>
  )
}
