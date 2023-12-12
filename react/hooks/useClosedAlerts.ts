import { useCallback } from 'react'

import useLocalStorage from './useLocalStorage'

const useClosedAlerts = () => {
  const [getClosedAlerts, setClosedAlerts] = useLocalStorage(
    'closed-alerts-x',
    [] as string[]
  )

  const addClosedAlert = useCallback((importId: string) => {
    if (getClosedAlerts().find(alertId => alertId === importId)) {
      return
    }

    setClosedAlerts([...getClosedAlerts(), importId])
  }, [])

  const removeClosedAlert = useCallback((importId: string) => {
    const filteredAlerts = getClosedAlerts().filter(
      alertId => alertId !== importId
    )

    setClosedAlerts(filteredAlerts)
  }, [])

  return { getClosedAlerts, addClosedAlert, removeClosedAlert }
}

export default useClosedAlerts
