import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { SheetGroup, CutListItem, GrainDirection } from '@/engine/types'

// ─── Helpers ─────────────────────────────────────────────────

function fmtArea(n: number): string {
  return n.toFixed(4)
}

// ─── Componente principal ─────────────────────────────────────

export default function CutListPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId } = useProjectStore()
  const project = activeProject()

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
      {allGroups.map(({ furnitureName, group }, idx) => (
        <CutListGroup
          key={`${furnitureName}-${group.materialId}-${group.thickness}-${idx}`}
          group={group}
          furnitureName={furnitureName}
          showFurnitureName={targets.length > 1}
        />
      ))}
    </div>
  )
}

// ─── Grupo de material ────────────────────────────────────────

function CutListGroup({ group, furnitureName, showFurnitureName }: {
  group: SheetGroup
  furnitureName: string
  showFurnitureName: boolean
}) {
  const { t } = useTranslation()

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
        <span className="ml-auto text-[10px] font-medium text-primary-600">
          {group.sheetsNeeded} {t('cutlist.sheets_needed')}
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
      <div className="flex justify-end text-[10px] text-slate-500 pr-1">
        <span>{t('cutlist.total_area')}: </span>
        <span className="font-mono ml-1">{fmtArea(group.totalAreaSqm)} m²</span>
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
