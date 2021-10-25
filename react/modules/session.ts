interface KeyValue {
  value: string
}

interface Session {
  id: string
  namespaces: {
    store: {
      channel: string
    }
    profile: {
      isAuthenticated: KeyValue
      email?: KeyValue
    }
  }
}

interface SessionUnauthorized {
  type: 'Unauthorized'
  message: string
}

interface SessionForbidden {
  type: 'Forbidden'
  message: string
}

interface SessionPromise {
  response: Session | SessionUnauthorized | SessionForbidden
}

export function getSession() {
  return window &&
    (window as any).__RENDER_8_SESSION__ &&
    (window as any).__RENDER_8_SESSION__.sessionPromise
    ? ((window as any).__RENDER_8_SESSION__.sessionPromise as Promise<
        SessionPromise
      >)
    : null
}
