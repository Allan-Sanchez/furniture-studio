import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import { generateId } from '@/utils/generateId'
import type {
  Module,
  ModuleType,
  ModuleParams,
  ShelfModuleParams,
  DrawerModuleParams,
  HingedDoorModuleParams,
  SlidingDoorModuleParams,
  HangingRailModuleParams,
  VerticalDividerModuleParams,
  SocleModuleParams,
} from '@/engine/types'

// ─── Iconos y orden de tipos de módulo ───────────────────────

const MODULE_TYPES: ModuleType[] = [
  'shelf',
  'drawer',
  'hinged_door',
  'sliding_door',
  'hanging_rail',
  'vertical_divider',
  'socle',
]

const MODULE_ICON: Record<ModuleType, string> = {
  shelf:            '📋',
  drawer:           '🗂️',
  hinged_door:      '🚪',
  sliding_door:     '🔲',
  hanging_rail:     '👕',
  vertical_divider: '📏',
  socle:            '▬',
}

// ─── Params por defecto por tipo de módulo ────────────────────

function defaultModuleParams(type: ModuleType): ModuleParams {
  switch (type) {
    case 'shelf':
      return { count: 2, adjustable: true, materialId: '' } satisfies ShelfModuleParams
    case 'drawer':
      return { height: 200, slideType: 'soft_close', frontMaterialId: '', bodyMaterialId: '' } satisfies DrawerModuleParams
    case 'hinged_door':
      return { count: 1, openDirection: 'right', materialId: '', handleType: '' } satisfies HingedDoorModuleParams
    case 'sliding_door':
      return { panelCount: 2, materialId: '' } satisfies SlidingDoorModuleParams
    case 'hanging_rail':
      return { height: 1600 } satisfies HangingRailModuleParams
    case 'vertical_divider':
      return { position: 600, materialId: '' } satisfies VerticalDividerModuleParams
    case 'socle':
      return { height: 100, materialId: '' } satisfies SocleModuleParams
  }
}

// ─── Componente principal ─────────────────────────────────────

export default function ModulesPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId, updateFurniture } = useProjectStore()

  const project  = activeProject()
  const furniture = project?.furnitures.find(f => f.id === activeFurnitureId)

  // ID del módulo expandido (para edición inline)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddMenu, setShowAddMenu] = useState(false)

  if (!furniture) {
    return (
      <div className="text-sm text-slate-400 italic py-2">
        {t('modules.no_furniture')}
      </div>
    )
  }

  const modules = [...furniture.modules].sort((a, b) => a.order - b.order)

  const saveModules = (updated: Module[]) => {
    updateFurniture(furniture.id, { modules: updated })
  }

  const handleAddModule = (type: ModuleType) => {
    const maxOrder = modules.reduce((m, mod) => Math.max(m, mod.order), 0)
    const newModule: Module = {
      id: generateId(),
      type,
      order: maxOrder + 1,
      params: defaultModuleParams(type),
    }
    saveModules([...furniture.modules, newModule])
    setShowAddMenu(false)
    setExpandedId(newModule.id)
  }

  const handleDeleteModule = (id: string) => {
    saveModules(furniture.modules.filter(m => m.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleUpdateParams = (id: string, params: ModuleParams) => {
    saveModules(
      furniture.modules.map(m => m.id === id ? { ...m, params } : m)
    )
  }

  const handleMoveUp = (id: string) => {
    const sorted = [...modules]
    const idx = sorted.findIndex(m => m.id === id)
    if (idx <= 0) return
    const prev = sorted[idx - 1]
    const curr = sorted[idx]
    // Intercambiar órdenes
    const newModules = furniture.modules.map(m => {
      if (m.id === curr.id) return { ...m, order: prev.order }
      if (m.id === prev.id) return { ...m, order: curr.order }
      return m
    })
    saveModules(newModules)
  }

  const handleMoveDown = (id: string) => {
    const sorted = [...modules]
    const idx = sorted.findIndex(m => m.id === id)
    if (idx >= sorted.length - 1) return
    const next = sorted[idx + 1]
    const curr = sorted[idx]
    const newModules = furniture.modules.map(m => {
      if (m.id === curr.id) return { ...m, order: next.order }
      if (m.id === next.id) return { ...m, order: curr.order }
      return m
    })
    saveModules(newModules)
  }

  return (
    <div className="space-y-2">
      {/* Lista de módulos */}
      {modules.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">{t('modules.no_modules')}</p>
      ) : (
        <div className="space-y-1">
          {modules.map((mod, idx) => {
            const isExpanded = expandedId === mod.id
            return (
              <div
                key={mod.id}
                className="border border-surface-200 rounded-md overflow-hidden"
              >
                {/* Cabecera del módulo */}
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-primary-50' : 'bg-white hover:bg-surface-50'
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : mod.id)}
                >
                  {/* Orden */}
                  <span className="text-[10px] font-mono text-slate-300 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>
                  {/* Icono + tipo */}
                  <span className="text-sm leading-none">{MODULE_ICON[mod.type]}</span>
                  <span className="text-xs font-medium text-slate-700 flex-1">
                    {t(`modules.types.${mod.type}`)}
                  </span>

                  {/* Chevron */}
                  <span className={`text-[10px] text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>

                  {/* Flechas orden */}
                  <div className="flex flex-col gap-0" onClick={e => e.stopPropagation()}>
                    <button
                      className="text-[9px] text-slate-300 hover:text-slate-600 leading-none px-0.5"
                      onClick={() => handleMoveUp(mod.id)}
                      disabled={idx === 0}
                    >▲</button>
                    <button
                      className="text-[9px] text-slate-300 hover:text-slate-600 leading-none px-0.5"
                      onClick={() => handleMoveDown(mod.id)}
                      disabled={idx === modules.length - 1}
                    >▼</button>
                  </div>

                  {/* Eliminar */}
                  <button
                    className="text-slate-300 hover:text-red-400 text-xs w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
                    onClick={e => { e.stopPropagation(); handleDeleteModule(mod.id) }}
                    title={t('actions.delete')}
                  >
                    ✕
                  </button>
                </div>

                {/* Parámetros expandidos */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 bg-surface-50 border-t border-surface-100">
                    <ModuleParamsEditor
                      module={mod}
                      onChange={params => handleUpdateParams(mod.id, params)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Botón agregar módulo */}
      <div className="relative">
        <button
          className="btn-secondary w-full justify-center text-xs"
          onClick={() => setShowAddMenu(v => !v)}
        >
          + {t('modules.add')}
        </button>

        {/* Dropdown de tipos */}
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-surface-200 rounded-md shadow-lg py-1">
            {MODULE_TYPES.map(type => (
              <button
                key={type}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-primary-50 hover:text-primary-700 text-left transition-colors"
                onClick={() => handleAddModule(type)}
              >
                <span>{MODULE_ICON[type]}</span>
                <span>{t(`modules.types.${type}`)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cerrar dropdown si se hace clic fuera */}
      {showAddMenu && (
        <div
          className="fixed inset-0 z-[9]"
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  )
}

// ─── Editor de parámetros por tipo ───────────────────────────

interface ModuleParamsEditorProps {
  module: Module
  onChange: (params: ModuleParams) => void
}

function ModuleParamsEditor({ module, onChange }: ModuleParamsEditorProps) {
  const { t } = useTranslation()

  switch (module.type) {
    case 'shelf': {
      const p = module.params as ShelfModuleParams
      return (
        <div className="space-y-2">
          <MiniSlider
            label={t('modules.shelf.count')}
            value={p.count} min={1} max={10} step={1}
            onChange={v => onChange({ ...p, count: v })}
          />
          <MiniToggle
            label={t('modules.shelf.adjustable')}
            value={p.adjustable}
            onChange={v => onChange({ ...p, adjustable: v })}
          />
          <MiniInput
            label={t('modules.shelf.material_id')}
            value={p.materialId}
            onChange={v => onChange({ ...p, materialId: v })}
          />
        </div>
      )
    }

    case 'drawer': {
      const p = module.params as DrawerModuleParams
      return (
        <div className="space-y-2">
          <MiniSlider
            label={t('modules.drawer.height')}
            value={p.height} min={100} max={400} step={10}
            onChange={v => onChange({ ...p, height: v })}
          />
          <MiniSelect
            label={t('modules.drawer.slide_type')}
            value={p.slideType}
            options={[
              { value: 'basic',      label: t('modules.drawer.slide_types.basic')      },
              { value: 'soft_close', label: t('modules.drawer.slide_types.soft_close') },
            ]}
            onChange={v => onChange({ ...p, slideType: v as 'basic' | 'soft_close' })}
          />
          <MiniInput
            label={t('modules.drawer.front_material')}
            value={p.frontMaterialId}
            onChange={v => onChange({ ...p, frontMaterialId: v })}
          />
          <MiniInput
            label={t('modules.drawer.body_material')}
            value={p.bodyMaterialId}
            onChange={v => onChange({ ...p, bodyMaterialId: v })}
          />
        </div>
      )
    }

    case 'hinged_door': {
      const p = module.params as HingedDoorModuleParams
      return (
        <div className="space-y-2">
          <MiniSelect
            label={t('modules.hinged_door.count')}
            value={String(p.count)}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
            ]}
            onChange={v => onChange({ ...p, count: Number(v) as 1 | 2 })}
          />
          <MiniSelect
            label={t('modules.hinged_door.open_direction')}
            value={p.openDirection}
            options={[
              { value: 'left',  label: t('modules.hinged_door.directions.left')  },
              { value: 'right', label: t('modules.hinged_door.directions.right') },
              { value: 'both',  label: t('modules.hinged_door.directions.both')  },
            ]}
            onChange={v => onChange({ ...p, openDirection: v as 'left' | 'right' | 'both' })}
          />
          <MiniInput
            label={t('modules.hinged_door.material_id')}
            value={p.materialId}
            onChange={v => onChange({ ...p, materialId: v })}
          />
          <MiniInput
            label={t('modules.hinged_door.handle_type')}
            value={p.handleType}
            onChange={v => onChange({ ...p, handleType: v })}
          />
        </div>
      )
    }

    case 'sliding_door': {
      const p = module.params as SlidingDoorModuleParams
      return (
        <div className="space-y-2">
          <MiniSelect
            label={t('modules.sliding_door.panel_count')}
            value={String(p.panelCount)}
            options={[
              { value: '2', label: '2' },
              { value: '3', label: '3' },
            ]}
            onChange={v => onChange({ ...p, panelCount: Number(v) as 2 | 3 })}
          />
          <MiniInput
            label={t('modules.sliding_door.material_id')}
            value={p.materialId}
            onChange={v => onChange({ ...p, materialId: v })}
          />
        </div>
      )
    }

    case 'hanging_rail': {
      const p = module.params as HangingRailModuleParams
      return (
        <MiniSlider
          label={t('modules.hanging_rail.height')}
          value={p.height} min={800} max={2200} step={50}
          onChange={v => onChange({ ...p, height: v })}
        />
      )
    }

    case 'vertical_divider': {
      const p = module.params as VerticalDividerModuleParams
      return (
        <div className="space-y-2">
          <MiniSlider
            label={t('modules.vertical_divider.position')}
            value={p.position} min={50} max={3000} step={10}
            onChange={v => onChange({ ...p, position: v })}
          />
          <MiniInput
            label={t('modules.vertical_divider.material_id')}
            value={p.materialId}
            onChange={v => onChange({ ...p, materialId: v })}
          />
        </div>
      )
    }

    case 'socle': {
      const p = module.params as SocleModuleParams
      return (
        <div className="space-y-2">
          <MiniSlider
            label={t('modules.socle.height')}
            value={p.height} min={60} max={200} step={5}
            onChange={v => onChange({ ...p, height: v })}
          />
          <MiniInput
            label={t('modules.socle.material_id')}
            value={p.materialId}
            onChange={v => onChange({ ...p, materialId: v })}
          />
        </div>
      )
    }

    default:
      return null
  }
}

// ─── Micro-componentes de formulario ─────────────────────────

function MiniSlider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between">
        <span className="text-[10px] text-slate-500">{label}</span>
        <span className="text-[10px] font-mono text-slate-400">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary-500 cursor-pointer"
      />
    </div>
  )
}

function MiniToggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="accent-primary-500 w-3 h-3"
      />
      <span className="text-[10px] text-slate-500">{label}</span>
    </label>
  )
}

function MiniInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] text-slate-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] rounded border border-surface-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
    </div>
  )
}

function MiniSelect({ label, value, options, onChange }: {
  label: string; value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-0.5">
      <label className="text-[10px] text-slate-500">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-[11px] rounded border border-surface-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
