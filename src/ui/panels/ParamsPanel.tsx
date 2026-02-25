import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type {
  WardrobeParams,
  KitchenBaseParams,
  KitchenWallParams,
  TvUnitParams,
  EntertainmentCenterParams,
  BookcaseParams,
  DoorType,
  FurnitureTypeId,
  ParamSet,
} from '@/engine/types'

// ─── Tipos de mueble disponibles ─────────────────────────────
const FURNITURE_TYPES: FurnitureTypeId[] = [
  'wardrobe',
  'kitchen_base',
  'kitchen_wall',
  'tv_unit',
  'entertainment_center',
  'bookcase',
]

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

  const params = furniture.params as ParamSet

  const handleChange = (field: string, value: number | boolean | string) => {
    updateFurniture(furniture.id, { params: { ...params, [field]: value } })
  }

  const handleFurnitureType = (type: FurnitureTypeId) => {
    updateFurniture(furniture.id, { furnitureType: type })
  }

  const renderTypeFields = () => {
    switch (furniture.furnitureType) {
      case 'wardrobe':
        return (
          <WardrobeParamFields
            params={params as WardrobeParams}
            onChange={handleChange}
          />
        )
      case 'kitchen_base':
        return (
          <KitchenBaseParamFields
            params={params as KitchenBaseParams}
            onChange={handleChange}
          />
        )
      case 'kitchen_wall':
        return (
          <KitchenWallParamFields
            params={params as KitchenWallParams}
            onChange={handleChange}
          />
        )
      case 'tv_unit':
        return (
          <TvUnitParamFields
            params={params as TvUnitParams}
            onChange={handleChange}
          />
        )
      case 'entertainment_center':
        return (
          <EntertainmentCenterParamFields
            params={params as EntertainmentCenterParams}
            onChange={handleChange}
          />
        )
      case 'bookcase':
        return (
          <BookcaseParamFields
            params={params as BookcaseParams}
            onChange={handleChange}
          />
        )
      default:
        return null
    }
  }

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

      {renderTypeFields()}
    </div>
  )
}

// ─── Tipo auxiliar para los onChange ─────────────────────────

type OnChange = (field: string, value: number | boolean | string) => void

// ─── Campos comunes (width, height, depth, boardThickness, doorType) ─────────

interface CommonParamFieldsProps {
  params: {
    totalWidth: number
    totalHeight: number
    totalDepth: number
    boardThickness: number
    backPanelThickness: number
    hasBack: boolean
    hasSocle?: boolean
    socleHeight?: number
    doorType: DoorType
  }
  widthRange?: [number, number]
  heightRange?: [number, number]
  depthRange?: [number, number]
  onChange: OnChange
}

function CommonParamFields({
  params,
  widthRange = [600, 3600],
  heightRange = [300, 2800],
  depthRange = [200, 700],
  onChange,
}: CommonParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      {/* Dimensiones */}
      <div className="space-y-3">
        <ParamSlider
          label={t('params.total_width')}
          value={params.totalWidth}
          min={widthRange[0]} max={widthRange[1]} step={50}
          onChange={v => onChange('totalWidth', v)}
        />
        <ParamSlider
          label={t('params.total_height')}
          value={params.totalHeight}
          min={heightRange[0]} max={heightRange[1]} step={50}
          onChange={v => onChange('totalHeight', v)}
        />
        <ParamSlider
          label={t('params.total_depth')}
          value={params.totalDepth}
          min={depthRange[0]} max={depthRange[1]} step={10}
          onChange={v => onChange('totalDepth', v)}
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
          onChange={v => onChange('boardThickness', v)}
        />
        <ParamSelect<number>
          label={t('params.back_panel_thickness')}
          value={params.backPanelThickness}
          options={[
            { value: 3, label: '3 mm' },
            { value: 6, label: '6 mm' },
            { value: 9, label: '9 mm' },
          ]}
          onChange={v => onChange('backPanelThickness', v)}
        />
      </div>

      <hr className="border-surface-200" />

      {/* Toggles */}
      <div className="space-y-2">
        <ParamToggle
          label={t('params.has_back')}
          value={params.hasBack}
          onChange={v => onChange('hasBack', v)}
        />
        {params.hasSocle !== undefined && (
          <>
            <ParamToggle
              label={t('params.has_socle')}
              value={params.hasSocle}
              onChange={v => onChange('hasSocle', v)}
            />
            {params.hasSocle && params.socleHeight !== undefined && (
              <div className="pl-4 border-l-2 border-primary-100">
                <ParamSlider
                  label={t('params.socle_height')}
                  value={params.socleHeight}
                  min={60} max={200} step={5}
                  onChange={v => onChange('socleHeight', v)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <hr className="border-surface-200" />

      {/* Tipo de puerta */}
      <ParamSelect<DoorType>
        label={t('params.door_type')}
        value={params.doorType}
        options={[
          { value: 'none',    label: t('params.door_types.none')    },
          { value: 'hinged',  label: t('params.door_types.hinged')  },
          { value: 'sliding', label: t('params.door_types.sliding') },
        ]}
        onChange={v => onChange('doorType', v)}
      />
    </>
  )
}

// ─── WardrobeParamFields ──────────────────────────────────────

interface WardrobeParamFieldsProps {
  params: WardrobeParams
  onChange: OnChange
}

function WardrobeParamFields({ params, onChange }: WardrobeParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <CommonParamFields
        params={params}
        widthRange={[600, 3600]}
        heightRange={[1800, 2800]}
        depthRange={[450, 700]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      <ParamSlider
        label={t('params.hanging_rail_height')}
        value={params.hangingRailHeight}
        min={800} max={2200} step={50}
        onChange={v => onChange('hangingRailHeight', v)}
      />
    </>
  )
}

// ─── KitchenBaseParamFields ───────────────────────────────────

interface KitchenBaseParamFieldsProps {
  params: KitchenBaseParams
  onChange: OnChange
}

function KitchenBaseParamFields({ params, onChange }: KitchenBaseParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <CommonParamFields
        params={params}
        widthRange={[300, 1200]}
        heightRange={[700, 950]}
        depthRange={[450, 700]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      {/* Encimera */}
      <div className="space-y-2">
        <ParamToggle
          label={t('params.has_countertop')}
          value={params.hasCountertop}
          onChange={v => onChange('hasCountertop', v)}
        />
        {params.hasCountertop && (
          <div className="pl-4 border-l-2 border-primary-100 space-y-3">
            <ParamSlider
              label={t('params.countertop_thickness')}
              value={params.countertopThickness}
              min={15} max={40} step={1}
              onChange={v => onChange('countertopThickness', v)}
            />
            <ParamSlider
              label={t('params.countertop_overhang')}
              value={params.countertopOverhang}
              min={0} max={50} step={5}
              onChange={v => onChange('countertopOverhang', v)}
            />
          </div>
        )}
      </div>
    </>
  )
}

// ─── KitchenWallParamFields ───────────────────────────────────

interface KitchenWallParamFieldsProps {
  params: KitchenWallParams
  onChange: OnChange
}

function KitchenWallParamFields({ params, onChange }: KitchenWallParamFieldsProps) {
  const { t } = useTranslation()
  // KitchenWallParams no tiene hasSocle/socleHeight — los omitimos usando spread parcial
  const baseParams = {
    totalWidth: params.totalWidth,
    totalHeight: params.totalHeight,
    totalDepth: params.totalDepth,
    boardThickness: params.boardThickness,
    backPanelThickness: params.backPanelThickness,
    hasBack: params.hasBack,
    doorType: params.doorType,
  }
  return (
    <>
      <CommonParamFields
        params={baseParams}
        widthRange={[300, 1200]}
        heightRange={[300, 900]}
        depthRange={[200, 400]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      {/* Altura de montaje */}
      <ParamSlider
        label={t('params.mounting_height')}
        value={params.mountingHeight}
        min={600} max={1800} step={50}
        onChange={v => onChange('mountingHeight', v)}
      />
    </>
  )
}

// ─── TvUnitParamFields ────────────────────────────────────────

interface TvUnitParamFieldsProps {
  params: TvUnitParams
  onChange: OnChange
}

function TvUnitParamFields({ params, onChange }: TvUnitParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <CommonParamFields
        params={params}
        widthRange={[900, 2400]}
        heightRange={[400, 600]}
        depthRange={[350, 550]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      {/* Nicho TV */}
      <div className="space-y-3">
        <ParamSlider
          label={t('params.tv_niche_width')}
          value={params.tvNicheWidth}
          min={400} max={1600} step={50}
          onChange={v => onChange('tvNicheWidth', v)}
        />
        <ParamSlider
          label={t('params.tv_niche_height')}
          value={params.tvNicheHeight}
          min={200} max={500} step={10}
          onChange={v => onChange('tvNicheHeight', v)}
        />
      </div>
    </>
  )
}

// ─── EntertainmentCenterParamFields ──────────────────────────

interface EntertainmentCenterParamFieldsProps {
  params: EntertainmentCenterParams
  onChange: OnChange
}

function EntertainmentCenterParamFields({ params, onChange }: EntertainmentCenterParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <CommonParamFields
        params={params}
        widthRange={[1200, 2800]}
        heightRange={[1800, 2400]}
        depthRange={[350, 550]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      {/* Columna lateral */}
      <div className="space-y-3">
        <ParamSlider
          label={t('params.side_column_width')}
          value={params.sideColumnWidth}
          min={0} max={600} step={50}
          onChange={v => onChange('sideColumnWidth', v)}
        />
      </div>
      {/* Panel trasero elevado */}
      <div className="space-y-2 mt-3">
        <ParamToggle
          label={t('params.has_back_panel')}
          value={params.hasBackPanel}
          onChange={v => onChange('hasBackPanel', v)}
        />
        {params.hasBackPanel && (
          <div className="pl-4 border-l-2 border-primary-100">
            <ParamSlider
              label={t('params.back_panel_height')}
              value={params.backPanelHeight}
              min={800} max={2000} step={50}
              onChange={v => onChange('backPanelHeight', v)}
            />
          </div>
        )}
      </div>
    </>
  )
}

// ─── BookcaseParamFields ──────────────────────────────────────

interface BookcaseParamFieldsProps {
  params: BookcaseParams
  onChange: OnChange
}

function BookcaseParamFields({ params, onChange }: BookcaseParamFieldsProps) {
  const { t } = useTranslation()
  return (
    <>
      <CommonParamFields
        params={params}
        widthRange={[600, 1800]}
        heightRange={[900, 2400]}
        depthRange={[200, 400]}
        onChange={onChange}
      />
      <hr className="border-surface-200" />
      {/* Estantería abierta: openBack = !hasBack */}
      <ParamToggle
        label={t('params.open_back')}
        value={!params.hasBack}
        onChange={v => onChange('hasBack', !v)}
      />
    </>
  )
}

// ─── Sub-componentes primitivos ───────────────────────────────

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

export function ParamSelect<T extends string | number>({ label, value, options, onChange }: ParamSelectProps<T>) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value}
        onChange={e => {
          const raw = e.target.value
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

export function ParamToggle({ label, value, onChange }: ParamToggleProps) {
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
