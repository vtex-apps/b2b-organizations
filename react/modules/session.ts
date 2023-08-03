import { useState, useEffect } from 'react'

interface KeyValue {
  value: string
}

export interface Session {
  type?: 'Session'
  id: string
  namespaces: {
    store: {
      channel: string
    }
    profile: {
      isAuthenticated: KeyValue
      email?: KeyValue
    }
    account: {
      accountName: KeyValue
    }
    authentication: {
      storeUserEmail: KeyValue
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

export const useSessionResponse = () => {
  const [session, setSession] = useState<unknown>()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then(sessionResponse => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}
