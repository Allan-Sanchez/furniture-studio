import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'
import type { FurnitureTypeId } from '@/engine/types'

const FURNITURE_TYPES: FurnitureTypeId[] = [
  'wardrobe',
  'kitchen_base',
  'kitchen_wall',
  'tv_unit',
  'entertainment_center',
  'bookcase',
]

const TYPE_ICON: Record<FurnitureTypeId, string> = {
  wardrobe:              '🪑',
  kitchen_base:          '🍳',
  kitchen_wall:          '🗄️',
  tv_unit:               '📺',
  entertainment_center:  '🎬',
  bookcase:              '📚',
}

export default function FurniturePanel() {
  const { t } = useTranslation()
  const {
    activeProject,
    activeFurnitureId,
    addFurniture,
    duplicateFurniture,
    deleteFurniture,
    setActiveFurniture,
  } = useProjectStore()

  const project = activeProject()

  // Estado del formulario inline para agregar mueble
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName]         = useState('')
  const [newType, setNewType]         = useState<FurnitureTypeId>('wardrobe')

  if (!project) {
    return (
      <div className="text-sm text-slate-400 italic py-2">
        {t('furniture.no_project')}
      </div>
    )
  }

  const furnitures = project.furnitures

  const handleAdd = () => {
    const name = newName.trim() || t(`furniture.types.${newType}`)
    addFurniture(newType, name)
    setNewName('')
    setNewType('wardrobe')
    setShowAddForm(false)
  }

  const handleCancel = () => {
    setNewName('')
    setNewType('wardrobe')
    setShowAddForm(false)
  }

  return (
    <div className="space-y-3">
      {/* Lista de muebles */}
      {furnitures.length === 0 && !showAddForm ? (
        <div className="py-6 text-center space-y-3">
          <p className="text-xs text-slate-400 italic">{t('furniture.no_furniture')}</p>
          <button
            className="btn-primary text-xs"
            onClick={() => setShowAddForm(true)}
          >
            + {t('furniture.add_furniture')}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {furnitures.map(f => {
              const isActive = f.id === activeFurnitureId
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFurniture(f.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary-50 border border-primary-300 text-primary-700'
                      : 'border border-transparent hover:bg-surface-50 text-slate-700'
                  }`}
                >
                  {/* Icono de tipo */}
                  <span className="text-base leading-none shrink-0">
                    {TYPE_ICON[f.furnitureType]}
                  </span>

                  {/* Nombre y tipo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {t(`furniture.types.${f.furnitureType}`)}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                       onClick={e => e.stopPropagation()}>
                    <ActionBtn
                      title={t('actions.duplicate')}
                      icon="⧉"
                      onClick={() => duplicateFurniture(f.id)}
                    />
                    <ActionBtn
                      title={t('actions.delete')}
                      icon="✕"
                      danger
                      onClick={() => {
                        if (confirm(`¿Eliminar "${f.name}"?`)) deleteFurniture(f.id)
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Botón para agregar */}
          {!showAddForm && (
            <button
              className="btn-secondary w-full justify-center text-xs mt-1"
              onClick={() => setShowAddForm(true)}
            >
              + {t('furniture.add_furniture')}
            </button>
          )}
        </>
      )}

      {/* Formulario inline para agregar */}
      {showAddForm && (
        <div className="border border-primary-200 rounded-lg p-3 space-y-2 bg-primary-50">
          {/* Selector de tipo */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              {t('furniture.type_label')}
            </label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as FurnitureTypeId)}
              className="w-full text-xs rounded border border-surface-200 bg-white px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              {FURNITURE_TYPES.map(id => (
                <option key={id} value={id}>
                  {TYPE_ICON[id]} {t(`furniture.types.${id}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              {t('furniture.name_label')}
            </label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t(`furniture.types.${newType}`)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancel()
              }}
              autoFocus
              className="w-full text-xs rounded border border-surface-200 bg-white px-2 py-1.5 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button
              className="btn-primary flex-1 text-xs justify-center"
              onClick={handleAdd}
            >
              {t('furniture.add_confirm')}
            </button>
            <button
              className="btn-secondary flex-1 text-xs justify-center"
              onClick={handleCancel}
            >
              {t('furniture.add_cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Botón de acción pequeño ──────────────────────────────────

interface ActionBtnProps {
  title: string
  icon: string
  onClick: () => void
  danger?: boolean
}

function ActionBtn({ title, icon, onClick, danger }: ActionBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-5 h-5 flex items-center justify-center rounded text-[11px] transition-colors ${
        danger
          ? 'text-slate-300 hover:text-red-400 hover:bg-red-50'
          : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
      }`}
    >
      {icon}
    </button>
  )
}
