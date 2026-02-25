// TODO: Cuando el uiStore esté disponible, migrar bomMode a uiStore.bomMode
import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import { useCatalogStore } from '@/store/catalogStore'
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
  const { getMaterial } = useCatalogStore()
  const project = activeProject()

  // TODO: usar uiStore.bomMode cuando esté disponible
  const [mode, setMode] = useState<BOMMode>('by_furniture')

  // Estado local de precios editables por materialId
  // Inicializado con los precios del catálogo
  const [materialPrices, setMaterialPrices] = useState<Record<string, number>>(() => {
    if (!project) return {}
    const prices: Record<string, number> = {}
    for (const f of project.furnitures) {
      for (const part of f.result?.bom.parts ?? []) {
        if (!(part.materialId in prices)) {
          const mat = getMaterial(part.materialId)
          prices[part.materialId] = mat?.pricePerSqm ?? part.unitPrice
        }
      }
    }
    return prices
  })

  const handlePriceChange = useCallback((materialId: string, value: number) => {
    setMaterialPrices(prev => ({ ...prev, [materialId]: value }))
  }, [])

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
            <BOMSection
              key={bom.furnitureId}
              label={label}
              bom={bom}
              materialPrices={materialPrices}
              onPriceChange={handlePriceChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Sección de BOM de un mueble ─────────────────────────────

interface BOMSectionProps {
  label: string
  bom: BOM
  materialPrices: Record<string, number>
  onPriceChange: (materialId: string, value: number) => void
}

function BOMSection({ label, bom, materialPrices, onPriceChange }: BOMSectionProps) {
  const { t } = useTranslation()

  // Recalcular subtotales y totales con los precios editados
  const recalcParts = useMemo(() => {
    return bom.parts.map(item => {
      const pricePerSqm = materialPrices[item.materialId] ?? item.unitPrice
      // unitPrice en BOM es precio total de esa fila (areaSqm × precio/m²)
      // Recalculamos: subtotal = areaSqm × pricePerSqm
      const newSubtotal = Math.round(item.areaSqm * pricePerSqm * 100) / 100
      return { ...item, unitPrice: pricePerSqm, subtotal: newSubtotal }
    })
  }, [bom.parts, materialPrices])

  const recalcTotalMaterials = useMemo(
    () => Math.round(recalcParts.reduce((s, i) => s + i.subtotal, 0) * 100) / 100,
    [recalcParts],
  )

  const recalcGrandTotal = useMemo(
    () => Math.round((recalcTotalMaterials + bom.totalHardware) * 100) / 100,
    [recalcTotalMaterials, bom.totalHardware],
  )

  const totalsChanged =
    recalcTotalMaterials !== bom.totalMaterials ||
    recalcGrandTotal !== bom.grandTotal

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
              <Th align="center">{t('bom.code')}</Th>
              <Th align="left">{t('bom.piece')}</Th>
              <Th>{t('bom.qty')}</Th>
              <Th>{t('bom.length')}</Th>
              <Th>{t('bom.width')}</Th>
              <Th>{t('bom.thickness')}</Th>
              <Th>{t('bom.area_sqm')}</Th>
              <Th align="left">{t('bom.material')}</Th>
              <Th>{t('bom.unit_price')}</Th>
              <Th>{t('bom.subtotal')}</Th>
            </tr>
          </thead>
          <tbody>
            {recalcParts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-slate-300 py-2 italic">-</td>
              </tr>
            ) : (
              recalcParts.map(item => (
                <BOMRow
                  key={item.partId}
                  item={item}
                  editedPrice={materialPrices[item.materialId]}
                  onPriceChange={(val) => onPriceChange(item.materialId, val)}
                />
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
        <TotalRow
          label={t('bom.total_materials')}
          value={fmt(recalcTotalMaterials)}
          changed={recalcTotalMaterials !== bom.totalMaterials}
        />
        <TotalRow
          label={t('bom.total_hardware')}
          value={fmt(bom.totalHardware)}
        />
        <TotalRow
          label={t('bom.grand_total')}
          value={fmt(recalcGrandTotal)}
          bold
          changed={totalsChanged}
        />
      </div>
    </div>
  )
}

// ─── Filas de tabla ───────────────────────────────────────────

interface BOMRowProps {
  item: BOMItem
  editedPrice?: number
  onPriceChange: (val: number) => void
}

function BOMRow({ item, editedPrice, onPriceChange }: BOMRowProps) {
  const [localVal, setLocalVal] = useState<string>(
    String(editedPrice ?? item.unitPrice),
  )

  const handleBlur = () => {
    const parsed = parseFloat(localVal)
    if (!isNaN(parsed) && parsed >= 0) {
      onPriceChange(parsed)
    } else {
      setLocalVal(String(editedPrice ?? item.unitPrice))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <tr className="border-b border-surface-100 hover:bg-surface-50">
      <td className="py-1 px-1.5 text-center font-mono font-semibold text-slate-500 w-8">{item.partCode ?? '-'}</td>
      <td className="py-1 px-1.5 text-slate-700 truncate max-w-[80px]">{item.label}</td>
      <td className="py-1 px-1.5 text-center text-slate-600">{item.quantity}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.length}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.width}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.thickness}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-500">{fmtArea(item.areaSqm)}</td>
      <td className="py-1 px-1.5 text-slate-600 truncate max-w-[80px]">{item.materialName}</td>
      {/* Precio/m² editable inline */}
      <td className="py-1 px-1.5 text-right font-mono">
        <input
          type="number"
          min={0}
          step={0.5}
          value={localVal}
          onChange={e => setLocalVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-16 border-b border-slate-300 bg-transparent text-right text-[10px]
                     font-mono text-slate-700 focus:outline-none focus:border-primary-400
                     hover:border-slate-400 transition-colors"
          title="Precio por m²"
        />
      </td>
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

function TotalRow({ label, value, bold, changed }: { label: string; value: string; bold?: boolean; changed?: boolean }) {
  return (
    <div className={`flex justify-between items-center text-[11px] ${bold ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span className={`font-mono ${changed ? 'text-amber-600' : ''}`}>{value}</span>
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
