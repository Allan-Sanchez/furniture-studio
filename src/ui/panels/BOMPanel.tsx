// TODO: Cuando el uiStore esté disponible, migrar bomMode a uiStore.bomMode
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { BOM, BOMItem, BOMHardwareItem } from '@/engine/types'

type BOMMode = 'by_furniture' | 'consolidated'

// ─── Helpers de formato ───────────────────────────────────────

function fmt(n: number | undefined, decimals = 2): string {
  if (n === undefined || n === null) return '-'
  return n.toFixed(decimals)
}

function fmtArea(n: number | undefined): string {
  if (n === undefined || n === null) return '-'
  return n.toFixed(4)
}

// ─── Componente principal ─────────────────────────────────────

export default function BOMPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()
  const project = activeProject()

  // TODO: usar uiStore.bomMode cuando esté disponible
  const [mode, setMode] = useState<BOMMode>('by_furniture')

  if (!project) {
    return <EmptyState text={t('bom.no_data')} />
  }

  const furnitures = project.furnitures

  // Recopilar BOMs según el modo
  const bomsToShow: { label: string; bom: BOM }[] = []

  if (mode === 'by_furniture') {
    // Solo el mueble activo, o todos si no hay activo
    const targets = activeFurnitureId
      ? furnitures.filter(f => f.id === activeFurnitureId)
      : furnitures

    for (const f of targets) {
      if (f.result?.bom) {
        bomsToShow.push({ label: f.name, bom: f.result.bom })
      }
    }
  } else {
    // Consolidado: suma de todos
    const allParts: BOMItem[] = furnitures.flatMap(f => f.result?.bom.parts ?? [])
    const allHardware: BOMHardwareItem[] = furnitures.flatMap(f => f.result?.bom.hardware ?? [])
    if (allParts.length > 0 || allHardware.length > 0) {
      const totalMaterials = allParts.reduce((s, i) => s + i.subtotal, 0)
      const totalHardware  = allHardware.reduce((s, i) => s + i.subtotal, 0)
      bomsToShow.push({
        label: t('bom.consolidated'),
        bom: {
          furnitureId: 'project',
          parts: allParts,
          hardware: allHardware,
          totalMaterials: Math.round(totalMaterials * 100) / 100,
          totalHardware:  Math.round(totalHardware  * 100) / 100,
          grandTotal:     Math.round((totalMaterials + totalHardware) * 100) / 100,
        },
      })
    }
  }

  const hasData = bomsToShow.length > 0

  return (
    <div className="space-y-3 h-full">
      {/* Toggle de modo */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400">{t('bom.mode_toggle')}:</span>
        <div className="flex rounded border border-surface-200 overflow-hidden text-[10px]">
          <ModeBtn active={mode === 'by_furniture'} onClick={() => setMode('by_furniture')}>
            {t('bom.by_furniture')}
          </ModeBtn>
          <ModeBtn active={mode === 'consolidated'} onClick={() => setMode('consolidated')}>
            {t('bom.consolidated')}
          </ModeBtn>
        </div>
      </div>

      {!hasData ? (
        <EmptyState text={t('bom.no_data')} />
      ) : (
        <div className="space-y-4">
          {bomsToShow.map(({ label, bom }) => (
            <BOMSection key={bom.furnitureId} label={label} bom={bom} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sección de BOM de un mueble ─────────────────────────────

function BOMSection({ label, bom }: { label: string; bom: BOM }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      {/* Título del mueble */}
      <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-surface-200 pb-1">
        {label}
      </h3>

      {/* Tabla de piezas */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-surface-50 text-slate-500">
              <Th align="left">{t('bom.piece')}</Th>
              <Th>{t('bom.qty')}</Th>
              <Th>{t('bom.length')}</Th>
              <Th>{t('bom.width')}</Th>
              <Th>{t('bom.thickness')}</Th>
              <Th>{t('bom.area_sqm')}</Th>
              <Th align="left">{t('bom.material')}</Th>
              <Th>{t('bom.subtotal')}</Th>
            </tr>
          </thead>
          <tbody>
            {bom.parts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-slate-300 py-2 italic">-</td>
              </tr>
            ) : (
              bom.parts.map(item => (
                <BOMRow key={item.partId} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sección de herrajes */}
      {bom.hardware.length > 0 && (
        <>
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-1">
            {t('bom.hardware_section')}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-surface-50 text-slate-500">
                  <Th align="left">{t('bom.description')}</Th>
                  <Th>{t('bom.qty')}</Th>
                  <Th>{t('bom.unit_price')}</Th>
                  <Th>{t('bom.subtotal')}</Th>
                </tr>
              </thead>
              <tbody>
                {bom.hardware.map(hw => (
                  <HardwareRow key={hw.hardwareId} item={hw} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer de totales */}
      <div className="border-t border-surface-200 pt-2 space-y-1">
        <TotalRow label={t('bom.total_materials')} value={fmt(bom.totalMaterials)} />
        <TotalRow label={t('bom.total_hardware')}  value={fmt(bom.totalHardware)}  />
        <TotalRow label={t('bom.grand_total')}     value={fmt(bom.grandTotal)} bold />
      </div>
    </div>
  )
}

// ─── Filas de tabla ───────────────────────────────────────────

function BOMRow({ item }: { item: BOMItem }) {
  return (
    <tr className="border-b border-surface-100 hover:bg-surface-50">
      <td className="py-1 px-1.5 text-slate-700 truncate max-w-[80px]">{item.label}</td>
      <td className="py-1 px-1.5 text-center text-slate-600">{item.quantity}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.length}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.width}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.thickness}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-500">{fmtArea(item.areaSqm)}</td>
      <td className="py-1 px-1.5 text-slate-600 truncate max-w-[80px]">{item.materialName}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-700">{fmt(item.subtotal)}</td>
    </tr>
  )
}

function HardwareRow({ item }: { item: BOMHardwareItem }) {
  return (
    <tr className="border-b border-surface-100 hover:bg-surface-50">
      <td className="py-1 px-1.5 text-slate-700 truncate max-w-[120px]">{item.description}</td>
      <td className="py-1 px-1.5 text-center text-slate-600">{item.quantity}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{fmt(item.unitPrice)}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-700">{fmt(item.subtotal)}</td>
    </tr>
  )
}

// ─── Sub-componentes utilitarios ─────────────────────────────

function Th({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={`py-1 px-1.5 font-semibold text-[10px] whitespace-nowrap text-${align}`}>
      {children}
    </th>
  )
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between items-center text-[11px] ${bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}

function ModeBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-[10px] transition-colors ${
        active ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-surface-50'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60px] text-xs text-slate-400 italic">
      {text}
    </div>
  )
}
