import { useTranslation } from 'react-i18next'

export default function ModulesPanel() {
  const { t } = useTranslation()
  return (
    <div className="text-sm text-slate-400 italic">
      {t('modules.title')} — Fase 1
    </div>
  )
}
