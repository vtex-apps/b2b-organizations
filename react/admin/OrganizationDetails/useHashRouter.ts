import React, { useEffect, useState } from 'react'

const useHashRouter = ({ routerRef, sessionKey }: any) => {
  const [tab, setTab] = React.useState('')
  const [location, setLocation] = useState(null as any)

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

  useEffect(() => {
    if (!location) return

    setupTab(location.pathname.replace('/', ''))
  }, [location])

  useEffect(() => {
    if (!routerRef?.current) return
    if (routerRef.current?.history?.location.pathname === '/') {
      const sessionTab = sessionStorage.getItem('organization-tab')

      routerRef.current?.history?.push(
        sessionTab ? `/${sessionTab}` : '/organizations'
      )
    }

    setLocation(routerRef.current?.history?.location)
  }, [routerRef])

  return {
    tab,
    handleTabChange,
  }
}

export default useHashRouter
