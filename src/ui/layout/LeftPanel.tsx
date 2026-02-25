import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import type { ActiveTab } from '@/App'

// Paneles livianos — importados de forma estática (pequeños, siempre visibles)
import ProjectPanel from '@/ui/panels/ProjectPanel'
import FurniturePanel from '@/ui/panels/FurniturePanel'
import ParamsPanel from '@/ui/panels/ParamsPanel'

// Paneles pesados — lazy: solo se cargan al activar su tab
const ModulesPanel  = lazy(() => import('@/ui/panels/ModulesPanel'))
const MaterialsPanel = lazy(() => import('@/ui/panels/MaterialsPanel'))
const AssemblyPanel  = lazy(() => import('@/ui/panels/AssemblyPanel'))

const PanelFallback = <div className="p-4 text-sm text-gray-400">Cargando...</div>

interface LeftPanelProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

const TABS: { id: ActiveTab; icon: string; labelKey: string }[] = [
  { id: 'project',   icon: '📁', labelKey: 'nav.project'   },
  { id: 'furniture', icon: '🪑', labelKey: 'nav.furniture'  },
  { id: 'params',    icon: '⚙️', labelKey: 'nav.params'    },
  { id: 'modules',   icon: '📦', labelKey: 'nav.modules'   },
  { id: 'materials', icon: '🎨', labelKey: 'nav.materials' },
  { id: 'assembly',  icon: '🔧', labelKey: 'nav.assembly'  },
]

export default function LeftPanel({ activeTab, onTabChange }: LeftPanelProps) {
  const { t } = useTranslation()

  return (
    <aside
      className="flex shrink-0 border-r border-surface-200 bg-white overflow-hidden"
      style={{ width: '320px' }}
    >
      {/* Tabs verticales */}
      <nav className="flex flex-col gap-0.5 p-2 border-r border-surface-100 shrink-0 w-[52px]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={t(tab.labelKey)}
            className={`panel-tab flex-col !px-1 !py-2 text-center text-lg ${
              activeTab === tab.id ? 'active' : ''
            }`}
          >
            <span>{tab.icon}</span>
          </button>
        ))}
      </nav>

      {/* Contenido de la tab activa */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-3 py-3">
          {/* Título de la tab */}
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {t(TABS.find(t => t.id === activeTab)?.labelKey ?? '')}
          </h2>

          {/* Panel activo */}
          {activeTab === 'project'   && <ProjectPanel />}
          {activeTab === 'furniture' && <FurniturePanel />}
          {activeTab === 'params'    && <ParamsPanel />}
          {activeTab === 'modules'   && (
            <Suspense fallback={PanelFallback}>
              <ModulesPanel />
            </Suspense>
          )}
          {activeTab === 'materials' && (
            <Suspense fallback={PanelFallback}>
              <MaterialsPanel />
            </Suspense>
          )}
          {activeTab === 'assembly'  && (
            <Suspense fallback={PanelFallback}>
              <AssemblyPanel />
            </Suspense>
          )}
        </div>
      </div>
    </aside>
  )
}
