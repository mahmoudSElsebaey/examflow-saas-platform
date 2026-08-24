import type { TFunction } from 'i18next'

type ApiLikeError = {
  message?: string
  errorCode?: string
  status?: number
}

export function translateApiError(err: unknown, t: TFunction): string {
  const e = err as ApiLikeError
  const code = e?.errorCode
  if (code) {
    const key = `errors.codes.${code}`
    const translated = t(key)
    if (translated && translated !== key) return translated
  }
  if (e?.status === 401) return t('errors.unauthorized')
  if (e?.status === 403) return t('errors.forbidden')
  if (e?.status === 404) return t('errors.notFound')
  if (e?.status === 429) return t('errors.rateLimited')
  if (typeof e?.message === 'string' && e.message.trim()) {
    const msgKey = `errors.messages.${e.message}`
    const byMessage = t(msgKey, { defaultValue: '' })
    if (byMessage) return byMessage
  }
  return t('errors.generic')
}
