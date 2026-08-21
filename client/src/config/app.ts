/**
 * Centralized Application Configuration
 * Change APP_NAME, branding, languages, etc. from this single place.
 */

export const appConfig = {
  // Branding
  APP_NAME: 'ExamFlow',
  APP_SHORT_NAME: 'ExamFlow',
  APP_DESCRIPTION:
    'Multi-tenant SaaS platform for online examinations, assessments, question banks, and student performance analytics.',
  APP_TAGLINE: 'Smart Assessments. Real Insights.',

  // Assets (paths relative to public/)
  APP_LOGO: '/logo.svg',
  APP_FAVICON: '/favicon.svg',

  // Localization
  DEFAULT_LANGUAGE: 'en' as const,
  SUPPORTED_LANGUAGES: ['en', 'ar'] as const,
  DEFAULT_DIRECTION: 'ltr' as const, // 'rtl' when language is 'ar'

  // Contact & Social
  CONTACT_EMAIL: 'support@examflow.app',
  SUPPORT_URL: 'https://examflow.app/support',
  SOCIAL_LINKS: {
    twitter: 'https://twitter.com/examflow',
    linkedin: 'https://linkedin.com/company/examflow',
    github: 'https://github.com/mahmoudSElsebaey/examflow-saas-platform',
  },

  // API
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',

  // Feature flags (can later be driven by remote config / subscription)
  FEATURES: {
    certificates: true,
    analytics: true,
    questionImport: true,
    multiLanguage: true,
    aiQuestionGeneration: false, // Phase 13+
    liveMonitoring: false,
    parentAccounts: false,
    gamification: false,
  },

  // Limits (default / free plan – later driven by subscription)
  DEFAULTS: {
    maxQuestionsPerExam: 100,
    maxAttempts: 3,
    examDurationMinutes: 60,
  },
} as const

export type AppConfig = typeof appConfig
export type SupportedLanguage = (typeof appConfig.SUPPORTED_LANGUAGES)[number]
