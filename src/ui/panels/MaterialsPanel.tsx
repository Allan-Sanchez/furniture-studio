import { useTranslation } from 'react-i18next'

export default function MaterialsPanel() {
  const { t } = useTranslation()
  return (
    <div className="text-sm text-slate-400 italic">
      {t('materials.title')} — Fase 1
    </div>
  )
}
