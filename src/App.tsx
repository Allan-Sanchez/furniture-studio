import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppHeader from '@/ui/layout/AppHeader'
import LeftPanel from '@/ui/layout/LeftPanel'
import SceneArea from '@/ui/layout/SceneArea'
import BottomPanel from '@/ui/layout/BottomPanel'

// Layout principal de la aplicación
// ┌─────────────────────────────────────────────────────────┐
// │ HEADER 48px                                             │
// ├──────────┬──────────────────────────────────────────────┤
// │          │ VISOR 3D (60% alto)                          │
// │ PANEL    ├─── divisor arrastrable ─────────────────────┤
// │ IZQ      │ PANEL INFERIOR: BOM | Cortes | Costos (40%) │
// │ 320px    │                                              │
// └──────────┴──────────────────────────────────────────────┘

export type ActiveTab = 'project' | 'furniture' | 'params' | 'modules' | 'materials'
export type BottomTab = 'bom' | 'cutlist' | 'cost'

export default function App() {
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState<ActiveTab>('project')
  const [bottomTab, setBottomTab] = useState<BottomTab>('bom')
  // Altura del panel inferior en px (resize vertical)
  const [bottomHeight, setBottomHeight] = useState(260)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-50 overflow-hidden">
      {/* Header */}
      <AppHeader onToggleLanguage={toggleLanguage} />

      {/* Cuerpo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo — 320px fijo */}
        <LeftPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Área derecha: visor 3D + panel inferior */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Visor 3D */}
          <SceneArea bottomHeight={bottomHeight} />

          {/* Divisor arrastrable */}
          <div
            className="resizer"
            onMouseDown={(e) => {
              e.preventDefault()
              const startY = e.clientY
              const startH = bottomHeight

              const onMove = (ev: MouseEvent) => {
                const delta = startY - ev.clientY
                const newH = Math.min(Math.max(startH + delta, 120), 500)
                setBottomHeight(newH)
              }
              const onUp = () => {
                window.removeEventListener('mousemove', onMove)
                window.removeEventListener('mouseup', onUp)
              }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          />

          {/* Panel inferior: BOM / Cortes / Costos */}
          <BottomPanel
            activeTab={bottomTab}
            onTabChange={setBottomTab}
            height={bottomHeight}
          />
        </div>
      </div>
    </div>
  )
}
