import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { WardrobeParams } from '@/engine/types'

export default function ParamsPanel() {
  const { t } = useTranslation()
  const { activeProject, activeFurnitureId, updateFurniture } = useProjectStore()
  const project = activeProject()
  const furniture = project?.furnitures.find(f => f.id === activeFurnitureId)

  if (!furniture) {
    return (
      <div className="text-sm text-slate-400 italic">
        Selecciona un mueble primero.
      </div>
    )
  }

  const params = furniture.params as WardrobeParams

  const handleChange = (field: keyof WardrobeParams, value: number) => {
    updateFurniture(furniture.id, {
      params: { ...params, [field]: value }
    })
  }

  return (
    <div className="space-y-3">
      <ParamSlider
        label={t('params.total_width')}
        value={params.totalWidth}
        min={600} max={3600} step={1}
        onChange={v => handleChange('totalWidth', v)}
      />
      <ParamSlider
        label={t('params.total_height')}
        value={params.totalHeight}
        min={1800} max={2800} step={1}
        onChange={v => handleChange('totalHeight', v)}
      />
      <ParamSlider
        label={t('params.total_depth')}
        value={params.totalDepth}
        min={450} max={700} step={1}
        onChange={v => handleChange('totalDepth', v)}
      />
    </div>
  )
}

interface ParamSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function ParamSlider({ label, value, min, max, step, onChange }: ParamSliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs font-mono text-slate-500">{value} mm</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-primary-500 cursor-pointer"
      />
    </div>
  )
}
