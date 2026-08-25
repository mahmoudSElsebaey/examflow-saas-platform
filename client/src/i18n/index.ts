import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en'
import ar from './locales/ar'
import { gradingExtraEn, gradingExtraAr } from './locales/grading-extra'

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

const examExtraEn = {
  pendingReview: 'Pending review',
  preStartTitle: 'Before you begin',
  preStartBody:
    'Please read carefully. Once you start, the attempt is recorded and cannot be cancelled.',
  preStartTime: 'Time limit: {{minutes}} minutes',
  preStartNoTime: 'No fixed time limit',
  preStartRules1: 'Do not switch tabs or leave the exam window.',
  preStartRules2: 'Copy/paste may be recorded for integrity review.',
  preStartRules3: 'Answers are autosaved; submit when finished.',
  preStartRules4: 'You cannot undo starting this attempt.',
  preStartConfirm: 'I understand — start exam',
  preStartCancel: 'Not now',
  integrityTitle: 'Integrity (staff only)',
  tabSwitches: 'Tab / focus events',
  pasteEvents: 'Paste events',
  confirmSubmit: 'Submit this exam now? You cannot change answers after submission.',
}

const examExtraAr = {
  pendingReview: 'بانتظار المراجعة',
  preStartTitle: 'قبل البدء',
  preStartBody:
    'يرجى القراءة بعناية. بعد البدء تُسجَّل المحاولة ولا يمكن إلغاؤها.',
  preStartTime: 'المدة الزمنية: {{minutes}} دقيقة',
  preStartNoTime: 'لا يوجد حد زمني ثابت',
  preStartRules1: 'لا تبدّل التبويبات ولا تغادر نافذة الامتحان.',
  preStartRules2: 'قد يُسجَّل النسخ/اللصق لمراجعة النزاهة.',
  preStartRules3: 'تُحفظ الإجابات تلقائيًا؛ سلّم عند الانتهاء.',
  preStartRules4: 'لا يمكن التراجع عن بدء هذه المحاولة.',
  preStartConfirm: 'فهمت — ابدأ الامتحان',
  preStartCancel: 'ليس الآن',
  integrityTitle: 'النزاهة (للطاقم فقط)',
  tabSwitches: 'تبديل التبويب / فقدان التركيز',
  pasteEvents: 'أحداث اللصق',
  confirmSubmit: 'تسليم الاختبار الآن؟ لا يمكن تعديل الإجابات بعد التسليم.',
}

const enMerged = {
  ...en,
  grading: { ...(en as any).grading, ...gradingExtraEn },
  exam: { ...(en as any).exam, ...examExtraEn },
  common: {
    ...(en as any).common,
    edit: (en as any).common?.edit || 'Edit',
    delete: (en as any).common?.delete || 'Delete',
    refresh: 'Refresh',
    search: (en as any).common?.search || 'Search',
  },
}

const arMerged = {
  ...ar,
  grading: { ...(ar as any).grading, ...gradingExtraAr },
  exam: { ...(ar as any).exam, ...examExtraAr },
  common: {
    ...(ar as any).common,
    edit: (ar as any).common?.edit || 'تعديل',
    delete: (ar as any).common?.delete || 'حذف',
    refresh: 'تحديث',
    search: (ar as any).common?.search || 'بحث',
  },
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enMerged },
      ar: { translation: arMerged },
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
