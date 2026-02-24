import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'

export default function ProjectPanel() {
  const { t } = useTranslation()
  const {
    projects, activeProject, activeProjectId,
    createProject, loadProject, deleteProject,
    addFurniture,
  } = useProjectStore()
  const project = activeProject()

  return (
    <div className="space-y-4">
      {/* Crear nuevo proyecto */}
      <div>
        <button
          className="btn-primary w-full justify-center text-xs"
          onClick={() => createProject('Nuevo proyecto')}
        >
          + {t('actions.new')} {t('project.title')}
        </button>
      </div>

      {/* Lista de proyectos guardados */}
      {projects.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Proyectos guardados
          </p>
          {projects.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer
                ${p.id === activeProjectId
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-surface-50 text-slate-600'
                }`}
              onClick={() => loadProject(p.id)}
            >
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <button
                className="text-slate-300 hover:text-red-400 text-xs"
                onClick={e => { e.stopPropagation(); deleteProject(p.id) }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Muebles del proyecto activo */}
      {project && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {t('project.furniture_list')}
          </p>

          {project.furnitures.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              {t('project.no_furniture')}
            </p>
          ) : (
            <div className="space-y-1">
              {project.furnitures.map(f => (
                <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-surface-50 text-sm text-slate-700">
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-slate-400">{f.furnitureType}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-secondary w-full justify-center text-xs mt-1"
            onClick={() => addFurniture('wardrobe', 'Ropero 1')}
          >
            + {t('project.add_furniture')}
          </button>
        </div>
      )}
    </div>
  )
}
