import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { translateApiError } from '@/lib/apiError'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  variant: ToastVariant
  title?: string
  message: string
}

type ToastContextValue = {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  fromError: (err: unknown) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const noopToast: ToastContextValue = {
  toasts: [],
  push: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  fromError: () => {},
  dismiss: () => {},
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
      const id = toast.id || uid()
      setToasts((prev) => [...prev.slice(-4), { ...toast, id }])
      window.setTimeout(() => dismiss(id), toast.variant === 'error' ? 6000 : 4000)
    },
    [dismiss]
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      push,
      success: (message, title) =>
        push({ variant: 'success', message, title: title || t('toast.success', { defaultValue: 'Success' }) }),
      error: (message, title) =>
        push({ variant: 'error', message, title: title || t('toast.error', { defaultValue: 'Error' }) }),
      info: (message, title) =>
        push({ variant: 'info', message, title: title || t('toast.info', { defaultValue: 'Info' }) }),
      fromError: (err) =>
        push({
          variant: 'error',
          title: t('toast.error', { defaultValue: 'Error' }),
          message: translateApiError(err, t),
        }),
      dismiss,
    }),
    [toasts, push, dismiss, t]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-16 z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:pe-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3 py-3 shadow-lg',
              toast.variant === 'success' &&
                'border-success/30 bg-success-muted text-success-foreground',
              toast.variant === 'error' &&
                'border-error/30 bg-error-muted text-error-foreground',
              toast.variant === 'info' &&
                'border-info/30 bg-info-muted text-info-foreground'
            )}
            role="status"
          >
            {toast.variant === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />}
            {toast.variant === 'error' && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" />}
            {toast.variant === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />}
            <div className="min-w-0 flex-1">
              {toast.title && <p className="text-sm font-semibold text-foreground">{toast.title}</p>}
              <p className="text-sm text-foreground">{toast.message}</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1 text-muted hover:bg-black/5 hover:text-foreground"
              onClick={() => dismiss(toast.id)}
              aria-label={t('common.close', { defaultValue: 'Close' })}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Safe: returns no-op helpers if provider is missing (avoids blank crash screens). */
export function useToast() {
  const ctx = useContext(ToastContext)
  return ctx ?? noopToast
}
