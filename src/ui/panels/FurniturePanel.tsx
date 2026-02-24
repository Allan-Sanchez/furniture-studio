import { useTranslation } from 'react-i18next'

export default function FurniturePanel() {
  const { t } = useTranslation()
  return (
    <div className="text-sm text-slate-400 italic">
      {t('furniture.select_type')} — Fase 1
    </div>
  )
}
