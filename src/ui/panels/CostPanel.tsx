import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { CostSummary } from '@/engine/types'

// ─── Helpers ─────────────────────────────────────────────────

function fmt(n: number | undefined, currency?: string): string {
  if (n === undefined || n === null) return '-'
  const formatted = n.toFixed(2)
  return currency ? `${currency} ${formatted}` : formatted
}

// ─── Componente principal ─────────────────────────────────────

export default function CostPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId, updateProjectMargin } = useProjectStore()
  const project = activeProject()

  // Margen editable — inicializado desde el proyecto activo
  const [marginInput, setMarginInput] = useState<string>(
    String(project?.profitMargin ?? 30)
  )

  // Sincronizar si cambia el proyecto
  useEffect(() => {
    if (project) setMarginInput(String(project.profitMargin))
  }, [project?.id, project?.profitMargin])

  if (!project) {
    return <EmptyState text={t('cost.no_data')} />
  }

  const currency = project.currency
  const furnitures = project.furnitures

  // Recopilar costos del mueble activo (o consolidado)
  const targets = activeFurnitureId
    ? furnitures.filter(f => f.id === activeFurnitureId)
    : furnitures

  const costs: CostSummary[] = targets
    .map(f => f.result?.cost)
    .filter((c): c is CostSummary => c !== undefined)

  const hasData = costs.length > 0

  // Totales consolidados con el margen actual del editor
  const parsedMargin = parseFloat(marginInput)
  const marginVal = isNaN(parsedMargin) ? project.profitMargin : parsedMargin

  const totalMaterials = hasData ? costs.reduce((s, c) => s + c.materialsCost, 0) : undefined
  const totalHardware  = hasData ? costs.reduce((s, c) => s + c.hardwareCost,  0) : undefined
  const subtotal       = hasData && totalMaterials !== undefined && totalHardware !== undefined
    ? totalMaterials + totalHardware
    : undefined
  const salePrice = subtotal !== undefined
    ? Math.round(subtotal * (1 + marginVal / 100) * 100) / 100
    : undefined

  const handleMarginBlur = () => {
    const val = parseFloat(marginInput)
    if (!isNaN(val) && val >= 0 && val <= 999) {
      updateProjectMargin(val)
    } else {
      setMarginInput(String(project.profitMargin))
    }
  }

  return (
    <div className="space-y-4 max-w-sm">
      {/* Tabla de costos */}
      <div className="border border-surface-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <tbody>
            <CostRow
              label={t('cost.materials_cost')}
              value={fmt(totalMaterials)}
              currency={currency}
            />
            <CostRow
              label={t('cost.hardware_cost')}
              value={fmt(totalHardware)}
              currency={currency}
            />
            <CostRow
              label={t('cost.subtotal')}
              value={fmt(subtotal)}
              currency={currency}
              highlight
            />
          </tbody>
        </table>
      </div>

      {/* Editor de margen */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-slate-600 shrink-0">
          {t('cost.margin')}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={999}
            step={1}
            value={marginInput}
            onChange={e => setMarginInput(e.target.value)}
            onBlur={handleMarginBlur}
            onKeyDown={e => e.key === 'Enter' && handleMarginBlur()}
            className="w-16 text-xs rounded border border-surface-200 bg-white px-2 py-1 text-slate-700 text-right font-mono focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
          <span className="text-xs text-slate-400">%</span>
        </div>
      </div>

      {/* Precio de venta — destacado */}
      <div className={`rounded-lg border-2 px-4 py-4 text-center ${
        hasData
          ? 'border-primary-300 bg-primary-50'
          : 'border-surface-200 bg-surface-50'
      }`}>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-1">
          {t('cost.sale_price')}
        </p>
        {hasData ? (
          <p className="text-2xl font-bold text-primary-700">
            <span className="text-sm font-normal text-primary-400 mr-1">{currency}</span>
            {salePrice !== undefined ? salePrice.toFixed(2) : '-'}
          </p>
        ) : (
          <p className="text-lg font-semibold text-slate-300">-</p>
        )}

        {/* Desglose rápido */}
        {hasData && subtotal !== undefined && (
          <p className="text-[10px] text-slate-400 mt-1">
            {fmt(subtotal, currency)} + {marginVal}% margen
          </p>
        )}
      </div>

      {/* Nota de moneda */}
      <p className="text-[10px] text-slate-300 text-right">
        {t('cost.currency')}: {currency}
      </p>
    </div>
  )
}

// ─── Fila de costo ────────────────────────────────────────────

function CostRow({ label, value, currency, highlight }: {
  label: string
  value: string
  currency: string
  highlight?: boolean
}) {
  return (
    <tr className={`border-b border-surface-100 last:border-0 ${highlight ? 'bg-slate-50' : ''}`}>
      <td className={`py-2 px-3 text-left ${highlight ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
        {label}
      </td>
      <td className={`py-2 px-3 text-right font-mono ${highlight ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
        {value === '-' ? '-' : `${currency} ${value}`}
      </td>
    </tr>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60px] text-xs text-slate-400 italic">
      {text}
    </div>
  )
}
