// ============================================================
// FURNITURE STUDIO — MaterialsPanel
// Panel para asignar materiales y acabados a las piezas del
// mueble activo. Permite asignación global y por pieza.
// ============================================================

import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import { useCatalogStore } from '@/store/catalogStore'
import type { Part, FurnitureResult } from '@/engine/types'

// ─── Selector de color inline ─────────────────────────────────

interface ColorDotProps {
  colorHex: string
}

function ColorDot({ colorHex }: ColorDotProps) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm border border-slate-300 shrink-0"
      style={{ backgroundColor: colorHex }}
      aria-hidden="true"
    />
  )
}

// ─── Fila de pieza individual ─────────────────────────────────

interface PartRowProps {
  part: Part
  partIndex: number
  onMaterialChange: (partIndex: number, materialId: string) => void
  onFinishChange: (partIndex: number, finishId: string) => void
}

function PartRow({ part, partIndex, onMaterialChange, onFinishChange }: PartRowProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language.startsWith('es') ? 'es' : 'en'
  const { getMaterialList, getFinishList, getMaterial, getFinish } = useCatalogStore()

  const materials = useMemo(() => getMaterialList(), [getMaterialList])
  const finishes = useMemo(() => getFinishList(), [getFinishList])

  const currentMaterial = getMaterial(part.materialId)
  const currentFinish = getFinish(part.finishId)

  const handleMaterialChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onMaterialChange(partIndex, e.target.value)
    },
    [partIndex, onMaterialChange],
  )

  const handleFinishChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFinishChange(partIndex, e.target.value)
    },
    [partIndex, onFinishChange],
  )

  return (
    <div className="border border-slate-100 rounded-md p-2 space-y-1.5 bg-slate-50">
      {/* Código + etiqueta */}
      <div className="flex items-center gap-1.5">
        {part.partCode && (
          <span className="text-xs font-bold text-slate-500 bg-slate-200 rounded px-1.5 py-0.5 shrink-0">
            {part.partCode}
          </span>
        )}
        <span className="text-xs font-medium text-slate-700 truncate" title={part.label}>
          {part.label}
        </span>
        <span className="text-xs text-slate-400 ml-auto shrink-0">
          {part.length}×{part.width}×{part.thickness}
        </span>
      </div>

      {/* Selector de material */}
      <div className="flex items-center gap-1.5">
        {currentMaterial && <ColorDot colorHex={currentMaterial.name.es.startsWith('HDF') ? '#C8B89A' : '#D2B48C'} />}
        <select
          value={part.materialId}
          onChange={handleMaterialChange}
          aria-label={`Material de ${part.label}`}
          className="flex-1 text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          {materials.map(m => (
            <option key={m.id} value={m.id}>
              {m.name[lang]}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de acabado */}
      <div className="flex items-center gap-1.5 pl-0.5">
        <span className="text-xs text-slate-400 shrink-0">└</span>
        {currentFinish && <ColorDot colorHex={currentFinish.colorHex} />}
        <select
          value={part.finishId}
          onChange={handleFinishChange}
          aria-label={`Acabado de ${part.label}`}
          className="flex-1 text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
        >
          {finishes.map(f => (
            <option key={f.id} value={f.id}>
              {f.name[lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────

export default function MaterialsPanel() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith('es') ? 'es' : 'en'

  const { activeFurnitures, activeFurnitureId, updateFurniture } = useProjectStore()
  const { getMaterialList, getFinishList, getMaterial, getFinish } = useCatalogStore()

  const [globalMaterialId, setGlobalMaterialId] = useState('mdf_18')
  const [globalFinishId, setGlobalFinishId] = useState('raw')

  // Mueble activo
  const furniture = useMemo(
    () => activeFurnitures().find(f => f.id === activeFurnitureId) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFurnitureId, activeFurnitures],
  )

  const parts: Part[] = furniture?.result?.parts ?? []

  // Listas del catálogo
  const materials = useMemo(() => getMaterialList(), [getMaterialList])
  const finishes = useMemo(() => getFinishList(), [getFinishList])

  const currentGlobalMaterial = getMaterial(globalMaterialId)
  const currentGlobalFinish = getFinish(globalFinishId)

  // ── Handler: cambiar material de una pieza individual ────────
  const handlePartMaterialChange = useCallback(
    (partIndex: number, materialId: string) => {
      if (!furniture?.result) return
      const updatedParts = furniture.result.parts.map((p, i) =>
        i === partIndex ? { ...p, materialId } : p,
      )
      const updatedResult: FurnitureResult = {
        ...furniture.result,
        parts: updatedParts,
      }
      updateFurniture(furniture.id, { result: updatedResult })
    },
    [furniture, updateFurniture],
  )

  // ── Handler: cambiar acabado de una pieza individual ─────────
  const handlePartFinishChange = useCallback(
    (partIndex: number, finishId: string) => {
      if (!furniture?.result) return
      const updatedParts = furniture.result.parts.map((p, i) =>
        i === partIndex ? { ...p, finishId } : p,
      )
      const updatedResult: FurnitureResult = {
        ...furniture.result,
        parts: updatedParts,
      }
      updateFurniture(furniture.id, { result: updatedResult })
    },
    [furniture, updateFurniture],
  )

  // ── Handler: aplicar material+acabado global a todas las piezas
  const handleApplyAll = useCallback(() => {
    if (!furniture?.result) return
    const updatedParts = furniture.result.parts.map(p => ({
      ...p,
      materialId: globalMaterialId,
      finishId: globalFinishId,
    }))
    const updatedResult: FurnitureResult = {
      ...furniture.result,
      parts: updatedParts,
    }
    updateFurniture(furniture.id, { result: updatedResult })
  }, [furniture, globalMaterialId, globalFinishId, updateFurniture])

  // ── Sin mueble activo o sin result ───────────────────────────
  if (!furniture || parts.length === 0) {
    return (
      <div className="text-sm text-slate-400 italic py-2">
        {t('materials_panel.no_furniture')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Nombre del mueble activo */}
      <div className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{furniture.name}</span>
        {' — '}
        <span>{parts.length} {t('materials_panel.pieces').toLowerCase()}</span>
      </div>

      {/* ── Controles globales ───────────────────────────────── */}
      <div className="space-y-2 rounded-md border border-blue-100 bg-blue-50 p-3">
        {/* Dropdown material global */}
        <div className="flex items-center gap-1.5">
          {currentGlobalMaterial && (
            <ColorDot colorHex="#D2B48C" />
          )}
          <select
            value={globalMaterialId}
            onChange={e => setGlobalMaterialId(e.target.value)}
            aria-label={t('materials_panel.global_material')}
            className="flex-1 text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            {materials.map(m => (
              <option key={m.id} value={m.id}>
                {m.name[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown acabado global */}
        <div className="flex items-center gap-1.5">
          {currentGlobalFinish && (
            <ColorDot colorHex={currentGlobalFinish.colorHex} />
          )}
          <select
            value={globalFinishId}
            onChange={e => setGlobalFinishId(e.target.value)}
            aria-label={t('materials_panel.global_finish')}
            className="flex-1 text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            {finishes.map(f => (
              <option key={f.id} value={f.id}>
                {f.name[lang]}
              </option>
            ))}
          </select>
        </div>

        {/* Botón aplicar a todas */}
        <button
          onClick={handleApplyAll}
          className="w-full text-xs font-medium bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded px-3 py-1.5 transition-colors"
        >
          {t('materials_panel.apply_all')}
        </button>
      </div>

      {/* ── Separador ────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('materials_panel.pieces')}
        </span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* ── Lista de piezas con scroll ────────────────────────── */}
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] pr-0.5">
        {parts.map((part, index) => (
          <PartRow
            key={part.id}
            part={part}
            partIndex={index}
            onMaterialChange={handlePartMaterialChange}
            onFinishChange={handlePartFinishChange}
          />
        ))}
      </div>
    </div>
  )
}
