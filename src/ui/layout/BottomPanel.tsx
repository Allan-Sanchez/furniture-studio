import { useTranslation } from 'react-i18next'
import type { BottomTab } from '@/App'
import BOMPanel from '@/ui/panels/BOMPanel'
import CutListPanel from '@/ui/panels/CutListPanel'
import CostPanel from '@/ui/panels/CostPanel'

interface BottomPanelProps {
  activeTab: BottomTab
  onTabChange: (tab: BottomTab) => void
  height: number
}

const TABS: { id: BottomTab; labelKey: string }[] = [
  { id: 'bom',     labelKey: 'bom.title'     },
  { id: 'cutlist', labelKey: 'cutlist.title' },
  { id: 'cost',    labelKey: 'cost.title'    },
]

export default function BottomPanel({ activeTab, onTabChange, height }: BottomPanelProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex flex-col bg-white border-t border-surface-200 shrink-0 overflow-hidden"
      style={{ height }}
    >
      {/* Tabs del panel inferior */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 border-b border-surface-100 shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-primary-700 border-primary-500'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}

        {/* Botones de export en el lado derecho */}
        <div className="ml-auto flex gap-1.5">
          {activeTab === 'bom' && (
            <button className="btn-secondary text-xs py-1">
              CSV
            </button>
          )}
          {activeTab === 'cutlist' && (
            <button className="btn-secondary text-xs py-1">
              PDF
            </button>
          )}
          {activeTab === 'cost' && (
            <button className="btn-secondary text-xs py-1">
              {t('cost.export_pdf')}
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-3">
        {activeTab === 'bom'     && <BOMPanel />}
        {activeTab === 'cutlist' && <CutListPanel />}
        {activeTab === 'cost'    && <CostPanel />}
      </div>
    </div>
  )
}
