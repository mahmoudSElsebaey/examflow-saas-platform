import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en'
import ar from './locales/ar'

export const SUPPORTED_LANGS = ['en', 'ar'] as const
export type AppLanguage = (typeof SUPPORTED_LANGS)[number]

export function getDirection(lang: string): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

export function applyDocumentDirection(lang: string) {
  const dir = getDirection(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = dir
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGS],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'examflow_lang',
      caches: ['localStorage'],
    },
  })

applyDocumentDirection(i18n.language?.startsWith('ar') ? 'ar' : 'en')
i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng.startsWith('ar') ? 'ar' : 'en')
})

export default i18n
