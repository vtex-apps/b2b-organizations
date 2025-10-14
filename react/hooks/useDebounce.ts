import { useCallback, useEffect, useRef, useState } from 'react'

export function useDebounceValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export const useDebounceFunction = <T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) => {
  const timerRef = useRef<number>()
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const fnDebounced = useCallback(
    (...args: T) => {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => fnRef.current(...args), delay)
    },
    [delay]
  )

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return fnDebounced
}
