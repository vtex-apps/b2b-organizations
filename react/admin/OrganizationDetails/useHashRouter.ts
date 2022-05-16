import React, { useEffect, useRef, useState } from 'react'

const useHashRouter = ({
  sessionKey,
  defaultPath,
  routes,
}: {
  sessionKey: string
  defaultPath: string
  routes: string[]
}) => {
  const [tab, setTab] = React.useState('')
  const [location, setLocation] = useState(null as any)
  const routerRef = useRef(null as any)

  const setupTab = (_tab: string) => {
    sessionStorage.setItem(sessionKey, _tab)
    setTab(_tab)
  }

  const handleTabChange = (_tab: string) => {
    if (!routerRef?.current) {
      return
    }

    routerRef.current?.history?.push(`/${_tab}`)
    setupTab(_tab)
  }

  const onHashChange = () => {
    const hash = window.location.hash.replace('#/', '')

    if (routes.includes(hash)) {
      setupTab(hash)
    }
  }

  useEffect(() => {
    if (!location) return
    setupTab(location.pathname.replace('/', ''))
  }, [location?.pathname])

  useEffect(() => {
    let lastHash = window.location.hash
    const handleHashChange = () => {
      if (lastHash !== window.location.hash) {
        lastHash = window.location.hash
        onHashChange()
      }
    }

    const interval = setInterval(handleHashChange, 400)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!routerRef?.current) return
    const { pathname } = routerRef.current?.history?.location

    if (pathname === '/' || !routes.includes(pathname.replace('/', ''))) {
      const sessionTab = sessionStorage.getItem(sessionKey)

      routerRef.current?.history?.push(
        sessionTab ? `/${sessionTab}` : `/${defaultPath}`
      )
    }

    setLocation(routerRef.current?.history?.location)
  }, [routerRef.current])

  return {
    tab,
    handleTabChange,
    routerRef,
  }
}

export default useHashRouter
