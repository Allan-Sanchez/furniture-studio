import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { SheetGroup, CutListItem, GrainDirection } from '@/engine/types'

// ─── Constantes ───────────────────────────────────────────────

const SHEET_LENGTH_MM = 2440
const SHEET_WIDTH_MM  = 1220
const SHEET_AREA_SQM  = (SHEET_LENGTH_MM * SHEET_WIDTH_MM) / 1_000_000  // 2.9768 m²

// ─── Helpers ─────────────────────────────────────────────────

function fmtArea(n: number): string {
  return n.toFixed(4)
}

/**
 * Calcula la cantidad de tableros necesarios aplicando kerf y desperdicio.
 * @param totalAreaSqm — Área neta total del grupo (m²)
 * @param kerf         — Kerf de sierra en mm (típico: 3)
 * @param wastePercent — Porcentaje de desperdicio adicional (típico: 10)
 */
function calcSheetsNeeded(totalAreaSqm: number, kerf: number, wastePercent: number): number {
  // Aproximación: el kerf agrega ~(kerf/SHEET_WIDTH_MM) de pérdida proporcional por corte
  const areaConKerf = totalAreaSqm * (1 + kerf / SHEET_WIDTH_MM)
  const areaConDesperdicio = areaConKerf * (1 + wastePercent / 100)
  return Math.ceil(areaConDesperdicio / SHEET_AREA_SQM)
}

// ─── Componente principal ─────────────────────────────────────

export default function CutListPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()
  const project = activeProject()

  // ── Estado: kerf y desperdicio ────────────────────────────
  const [kerf, setKerf] = useState<number>(3)
  const [wastePercent, setWastePercent] = useState<number>(10)

  // Handlers con validación numérica
  const handleKerfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) setKerf(Math.max(0, Math.min(10, val)))
  }

  const handleWasteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (!isNaN(val)) setWastePercent(Math.max(0, Math.min(100, val)))
  }

  if (!project) {
    return <EmptyState text={t('cutlist.no_data')} />
  }

  const furnitures = project.furnitures

  // Recopilar grupos del mueble activo (o todos si no hay activo)
  const targets = activeFurnitureId
    ? furnitures.filter(f => f.id === activeFurnitureId)
    : furnitures

  const allGroups: { furnitureName: string; group: SheetGroup }[] = []
  for (const f of targets) {
    if (f.result?.cutList?.groups) {
      for (const g of f.result.cutList.groups) {
        allGroups.push({ furnitureName: f.name, group: g })
      }
    }
  }

  if (allGroups.length === 0) {
    return <EmptyState text={t('cutlist.no_data')} />
  }

  return (
    <div className="space-y-4">
      {/* ── Configuración de kerf y desperdicio ─────────────── */}
      <div className="bg-slate-50 rounded-md border border-surface-200 px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-3">
          <label className="text-[11px] text-slate-600 w-28 shrink-0">
            {t('cutlist.kerf')}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              value={kerf}
              onChange={handleKerfChange}
              className="w-16 text-[11px] rounded border border-surface-200 bg-white
                         px-2 py-0.5 text-slate-700 text-right font-mono
                         focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <span className="text-[10px] text-slate-400">mm</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[11px] text-slate-600 w-28 shrink-0">
            {t('cutlist.waste_percent')}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={wastePercent}
              onChange={handleWasteChange}
              className="w-16 text-[11px] rounded border border-surface-200 bg-white
                         px-2 py-0.5 text-slate-700 text-right font-mono
                         focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <span className="text-[10px] text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* ── Grupos de material ───────────────────────────────── */}
      {allGroups.map(({ furnitureName, group }, idx) => (
        <CutListGroup
          key={`${furnitureName}-${group.materialId}-${group.thickness}-${idx}`}
          group={group}
          furnitureName={furnitureName}
          showFurnitureName={targets.length > 1}
          kerf={kerf}
          wastePercent={wastePercent}
        />
      ))}
    </div>
  )
}

// ─── Grupo de material ────────────────────────────────────────

function CutListGroup({ group, furnitureName, showFurnitureName, kerf, wastePercent }: {
  group: SheetGroup
  furnitureName: string
  showFurnitureName: boolean
  kerf: number
  wastePercent: number
}) {
  const { t } = useTranslation()

  // Recalcular tableros con kerf y desperdicio personalizados
  const sheetsNeeded = useMemo(
    () => calcSheetsNeeded(group.totalAreaSqm, kerf, wastePercent),
    [group.totalAreaSqm, kerf, wastePercent],
  )

  // Indicar si cambió respecto al valor original del engine
  const sheetsChanged = sheetsNeeded !== group.sheetsNeeded

  return (
    <div className="space-y-1.5">
      {/* Cabecera del grupo */}
      <div className="flex items-baseline gap-2 bg-slate-50 px-2 py-1.5 rounded-md border border-surface-200">
        <span className="text-[11px] font-semibold text-slate-700">
          {group.materialName}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {group.thickness} mm
        </span>
        {showFurnitureName && (
          <span className="text-[10px] text-slate-400 italic">
            — {furnitureName}
          </span>
        )}
        <span className={`ml-auto text-[10px] font-medium ${sheetsChanged ? 'text-amber-600' : 'text-primary-600'}`}>
          {sheetsNeeded} {t('cutlist.sheets_needed')}
        </span>
      </div>

      {/* Tabla de cortes */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-surface-50 text-slate-500">
              <Th align="left">{t('cutlist.label')}</Th>
              <Th align="left">{t('cutlist.piece')}</Th>
              <Th>{t('cutlist.length')}</Th>
              <Th>{t('cutlist.width')}</Th>
              <Th>{t('cutlist.qty')}</Th>
              <Th>{t('cutlist.grain')}</Th>
            </tr>
          </thead>
          <tbody>
            {group.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-300 py-2 italic">-</td>
              </tr>
            ) : (
              group.items.map(item => (
                <CutListRow key={`${item.label}-${item.partLabel}`} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer del grupo */}
      <div className="flex justify-between items-center text-[10px] text-slate-500 pr-1">
        <span>
          {t('cutlist.total_area')}:&nbsp;
          <span className="font-mono">{fmtArea(group.totalAreaSqm)} m²</span>
        </span>
        <span className={`font-mono ${sheetsChanged ? 'text-amber-600' : ''}`}>
          {sheetsNeeded} {t('cutlist.sheets_needed')}
          {sheetsChanged && (
            <span className="text-[9px] text-slate-400 ml-1">
              (orig. {group.sheetsNeeded})
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

// ─── Fila de corte ────────────────────────────────────────────

function CutListRow({ item }: { item: CutListItem }) {
  return (
    <tr className="border-b border-surface-100 hover:bg-surface-50">
      <td className="py-1 px-1.5 font-mono font-semibold text-slate-600">{item.label}</td>
      <td className="py-1 px-1.5 text-slate-700 truncate max-w-[80px]">{item.partLabel}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.length}</td>
      <td className="py-1 px-1.5 text-right font-mono text-slate-600">{item.width}</td>
      <td className="py-1 px-1.5 text-center text-slate-600">{item.quantity}</td>
      <td className="py-1 px-1.5 text-center">
        <GrainBadge grain={item.grain} />
      </td>
    </tr>
  )
}

// ─── Badge de veta ────────────────────────────────────────────

function GrainBadge({ grain }: { grain: GrainDirection }) {
  const { t } = useTranslation()
  const map: Record<GrainDirection, { label: string; color: string }> = {
    along:  { label: t('cutlist.grain_along'),  color: 'text-primary-600 bg-primary-50' },
    across: { label: t('cutlist.grain_across'), color: 'text-slate-600 bg-slate-100'    },
    any:    { label: t('cutlist.grain_any'),     color: 'text-slate-400 bg-surface-50'   },
  }
  const { label, color } = map[grain]
  return (
    <span className={`px-1 py-0.5 rounded text-[9px] font-medium ${color}`}>
      {label}
    </span>
  )
}

// ─── Utilitarios ─────────────────────────────────────────────

function Th({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={`py-1 px-1.5 font-semibold whitespace-nowrap text-${align}`}>
      {children}
    </th>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[60px] text-xs text-slate-400 italic">
      {text}
    </div>
  )
}
