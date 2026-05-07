const EVENT_NAME = 'admin:toast'

export function notifyAdminToast(message, tone = 'success') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        message,
        tone,
      },
    }),
  )
}

export function getAdminToastEventName() {
  return EVENT_NAME
}
