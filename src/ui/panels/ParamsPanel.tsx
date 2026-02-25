import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { WardrobeParams, DoorType, FurnitureTypeId } from '@/engine/types'

// ─── Tipos de mueble disponibles ─────────────────────────────
const FURNITURE_TYPES: FurnitureTypeId[] = ['wardrobe', 'kitchen_base', 'kitchen_wall']

// ─── Componente principal ─────────────────────────────────────

export default function ParamsPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId, updateFurniture } = useProjectStore()
  const project = activeProject()
  const furniture = project?.furnitures.find(f => f.id === activeFurnitureId)

  if (!furniture) {
    return (
      <div className="text-sm text-slate-400 italic py-2">
        {t('params.no_furniture')}
      </div>
    )
  }

  // Solo WardrobeParams tiene todos los campos — los otros tipos comparten campos base
  const params = furniture.params as WardrobeParams

  const handleNum = (field: keyof WardrobeParams, value: number) => {
    updateFurniture(furniture.id, { params: { ...params, [field]: value } })
  }

  const handleBool = (field: keyof WardrobeParams, value: boolean) => {
    updateFurniture(furniture.id, { params: { ...params, [field]: value } })
  }

  const handleDoorType = (value: DoorType) => {
    updateFurniture(furniture.id, { params: { ...params, doorType: value } })
  }

  const handleFurnitureType = (type: FurnitureTypeId) => {
    updateFurniture(furniture.id, { furnitureType: type })
  }

  const isWardrobe = furniture.furnitureType === 'wardrobe'

  return (
    <div className="space-y-4">
      {/* Tipo de mueble */}
      <ParamSelect<FurnitureTypeId>
        label={t('params.furniture_type')}
        value={furniture.furnitureType}
        options={FURNITURE_TYPES.map(id => ({ value: id, label: t(`furniture.types.${id}`) }))}
        onChange={handleFurnitureType}
      />

      <hr className="border-surface-200" />

      {/* Dimensiones principales */}
      <div className="space-y-3">
        <ParamSlider
          label={t('params.total_width')}
          value={params.totalWidth}
          min={600} max={3600} step={50}
          onChange={v => handleNum('totalWidth', v)}
        />
        <ParamSlider
          label={t('params.total_height')}
          value={params.totalHeight}
          min={1800} max={2800} step={50}
          onChange={v => handleNum('totalHeight', v)}
        />
        <ParamSlider
          label={t('params.total_depth')}
          value={params.totalDepth}
          min={450} max={700} step={10}
          onChange={v => handleNum('totalDepth', v)}
        />
      </div>

      <hr className="border-surface-200" />

      {/* Tableros */}
      <div className="space-y-3">
        <ParamSelect<number>
          label={t('params.board_thickness')}
          value={params.boardThickness}
          options={[
            { value: 15, label: '15 mm' },
            { value: 18, label: '18 mm' },
            { value: 25, label: '25 mm' },
          ]}
          onChange={v => handleNum('boardThickness', v)}
        />
        <ParamSelect<number>
          label={t('params.back_panel_thickness')}
          value={params.backPanelThickness}
          options={[
            { value: 3, label: '3 mm' },
            { value: 6, label: '6 mm' },
            { value: 9, label: '9 mm' },
          ]}
          onChange={v => handleNum('backPanelThickness', v)}
        />
      </div>

      <hr className="border-surface-200" />

      {/* Toggles */}
      <div className="space-y-2">
        <ParamToggle
          label={t('params.has_back')}
          value={params.hasBack}
          onChange={v => handleBool('hasBack', v)}
        />
        <ParamToggle
          label={t('params.has_socle')}
          value={params.hasSocle}
          onChange={v => handleBool('hasSocle', v)}
        />
        {params.hasSocle && (
          <div className="pl-4 border-l-2 border-primary-100">
            <ParamSlider
              label={t('params.socle_height')}
              value={params.socleHeight}
              min={60} max={200} step={5}
              onChange={v => handleNum('socleHeight', v)}
            />
          </div>
        )}
      </div>

      <hr className="border-surface-200" />

      {/* Tipo de puerta */}
      <ParamSelect<DoorType>
        label={t('params.door_type')}
        value={params.doorType}
        options={[
          { value: 'none',   label: t('params.door_types.none')   },
          { value: 'hinged', label: t('params.door_types.hinged') },
          { value: 'sliding',label: t('params.door_types.sliding')},
        ]}
        onChange={handleDoorType}
      />

      {/* Barra colgadora — solo para ropero */}
      {isWardrobe && (
        <>
          <hr className="border-surface-200" />
          <ParamSlider
            label={t('params.hanging_rail_height')}
            value={params.hangingRailHeight}
            min={800} max={2200} step={50}
            onChange={v => handleNum('hangingRailHeight', v)}
          />
        </>
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────

interface ParamSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

export function ParamSlider({ label, value, min, max, step, onChange }: ParamSliderProps) {
  const inRange = value >= min && value <= max
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center gap-2">
        <label className="text-xs font-medium text-slate-600 truncate">{label}</label>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono text-slate-500">{value} mm</span>
          {inRange && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-primary-50 text-primary-600 font-medium leading-none">
              ✓
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary-500 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-300">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

interface ParamSelectProps<T extends string | number> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

function ParamSelect<T extends string | number>({ label, value, options, onChange }: ParamSelectProps<T>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={e => {
          const raw = e.target.value
          // Detectar si los valores son numéricos
          const parsed = options.find(o => String(o.value) === raw)
          if (parsed !== undefined) onChange(parsed.value)
        }}
        className="w-full text-xs rounded-md border border-surface-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
      >
        {options.map(opt => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface ParamToggleProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}

function ParamToggle({ label, value, onChange }: ParamToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={value}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-8 h-4 rounded-full transition-colors ${
            value ? 'bg-primary-500' : 'bg-slate-200'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800">
        {label}
      </span>
    </label>
  )
}
