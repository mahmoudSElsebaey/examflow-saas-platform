import { useEffect, useRef } from 'react'
import * as examApi from '../api/examApi'

type Options = {
  accessToken: string | null | undefined
  orgId: string | undefined
  attemptId: string | undefined
  enabled: boolean
  trackTabSwitch?: boolean
  trackPaste?: boolean
  warnOnLeave?: boolean
}

/**
 * Phase 07 — monitors focus/visibility/paste during an in-progress attempt
 * and reports events to the API (rate-limited client-side).
 */
export function useExamSecurity({
  accessToken,
  orgId,
  attemptId,
  enabled,
  trackTabSwitch = true,
  trackPaste = true,
  warnOnLeave = true,
}: Options) {
  const lastSent = useRef<Record<string, number>>({})

  useEffect(() => {
    if (!enabled || !accessToken || !orgId || !attemptId) return

    const report = (
      type: 'focus_loss' | 'tab_switch' | 'visibility_hidden' | 'paste' | 'copy' | 'leave_warn',
      meta?: string
    ) => {
      const now = Date.now()
      const key = type
      // throttle same event type to once per 2s
      if (lastSent.current[key] && now - lastSent.current[key]! < 2000) return
      lastSent.current[key] = now
      void examApi.logSecurityEventApi(accessToken, orgId, attemptId, type, meta).catch(() => {
        /* non-blocking */
      })
    }

    const onVisibility = () => {
      if (!trackTabSwitch) return
      if (document.visibilityState === 'hidden') {
        report('visibility_hidden')
      }
    }

    const onBlur = () => {
      if (!trackTabSwitch) return
      report('focus_loss')
    }

    const onPaste = () => {
      if (!trackPaste) return
      report('paste')
    }

    const onCopy = () => {
      if (!trackPaste) return
      report('copy')
    }

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!warnOnLeave) return
      report('leave_warn')
      e.preventDefault()
      e.returnValue = ''
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    document.addEventListener('paste', onPaste)
    document.addEventListener('copy', onCopy)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('copy', onCopy)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [accessToken, orgId, attemptId, enabled, trackTabSwitch, trackPaste, warnOnLeave])
}
