import useLocalStorage from './useLocalStorage'

const useClosedAlerts = () => {
  const [closedAlerts, setClosedAlerts] = useLocalStorage(
    'bulk-import-closed-alerts',
    [] as string[]
  )

  const addClosedAlert = (importId: string) => {
    if (closedAlerts.find(alertId => alertId === importId)) {
      return
    }

    setClosedAlerts([...closedAlerts, importId])
  }

  const removeClosedAlert = (importId: string) => {
    const filteredAlerts = closedAlerts.filter(alertId => alertId !== importId)

    setClosedAlerts(filteredAlerts)
  }

  return { closedAlerts, addClosedAlert, removeClosedAlert }
}

export default useClosedAlerts
