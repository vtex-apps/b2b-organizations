import { useState } from 'react'

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const storedValue = localStorage.getItem(key)

  const [value, setValue] = useState(
    (storedValue ? JSON.parse(storedValue) : initialValue) as T
  )

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }

  return [value, setStoredValue] as const
}

export default useLocalStorage
