import { useTranslation } from 'react-i18next'
import { useProjectStore } from '@/store/projectStore'

interface AppHeaderProps {
  onToggleLanguage: () => void
}

export default function AppHeader({ onToggleLanguage }: AppHeaderProps) {
  const { t, i18n } = useTranslation()
  const { activeProject, updateProjectName } = useProjectStore()
  const project = activeProject()

  return (
    <header
      className="flex items-center justify-between px-4 h-12 bg-white border-b border-surface-200 shrink-0 z-10"
      style={{ height: '48px' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 bg-primary-600 rounded flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="white" className="w-4 h-4">
            <rect x="2" y="2" width="5" height="12" rx="0.5" />
            <rect x="9" y="2" width="5" height="7" rx="0.5" />
            <rect x="9" y="11" width="5" height="3" rx="0.5" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-slate-800 hidden sm:block">
          {t('app.name')}
        </span>
      </div>

      {/* Nombre del proyecto — editable */}
      <div className="flex-1 flex justify-center px-4 max-w-md">
        {project ? (
          <input
            type="text"
            value={project.name}
            onChange={e => updateProjectName(e.target.value)}
            className="text-sm font-medium text-slate-700 text-center bg-transparent
                       border-b border-transparent hover:border-surface-200
                       focus:outline-none focus:border-primary-400
                       w-full max-w-xs transition-colors"
            placeholder={t('project.name_placeholder')}
          />
        ) : (
          <span className="text-sm text-slate-400">{t('app.tagline')}</span>
        )}
      </div>

      {/* Acciones globales */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle de idioma */}
        <button
          onClick={onToggleLanguage}
          className="btn-secondary text-xs px-2 py-1"
          title="Cambiar idioma / Change language"
        >
          {i18n.language === 'es' ? 'EN' : 'ES'}
        </button>

        {/* Exportar */}
        <button
          className="btn-secondary text-xs"
          disabled={!project}
        >
          {t('actions.export')}
        </button>

        {/* Guardar visual (auto-save en localStorage) */}
        <button
          className="btn-primary text-xs"
          disabled={!project}
        >
          {t('actions.save')}
        </button>
      </div>
    </header>
  )
}
