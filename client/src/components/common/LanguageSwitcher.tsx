import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppLanguage } from '@/i18n'

const options: { code: AppLanguage; labelKey: string }[] = [
  { code: 'en', labelKey: 'common.english' },
  { code: 'ar', labelKey: 'common.arabic' },
]

interface LanguageSwitcherProps {
  className?: string
  variant?: 'buttons' | 'compact'
}

export function LanguageSwitcher({ className, variant = 'buttons' }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation()
  const current = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as AppLanguage

  const change = (code: AppLanguage) => {
    void i18n.changeLanguage(code)
  }

  if (variant === 'compact') {
    const next = current === 'en' ? 'ar' : 'en'
    return (
      <button
        type="button"
        onClick={() => change(next)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background',
          className
        )}
        aria-label={t('common.language')}
      >
        <Languages className="h-3.5 w-3.5" />
        {current === 'en' ? t('common.arabic') : t('common.english')}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border bg-surface p-0.5',
        className
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => change(opt.code)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            current === opt.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted hover:text-foreground'
          )}
        >
          {t(opt.labelKey)}
        </button>
      ))}
    </div>
  )
}
