import { useCallback, useEffect, useRef } from 'react'

import { useDebounceFunction } from './useDebounce'

type UseScrollArgs = Readonly<{ onScrollEnd: () => void }>

const SCROLL_DELAY = 150
const SCROLL_END_TOLERANCE = 10

export function useScroll<T extends HTMLElement>({
  onScrollEnd,
}: UseScrollArgs) {
  const ref = useRef<T>(null)
  const onScrollEndDebounced = useDebounceFunction(onScrollEnd, SCROLL_DELAY)

  const handleScroll = useCallback(() => {
    if (!ref.current) return

    const scrollTop: number = Math.ceil(ref.current.scrollTop)
    const scrollHeight: number = Math.round(ref.current.scrollHeight)
    const clientHeight: number = Math.round(ref.current.clientHeight)

    const isScrollEnd =
      scrollTop + SCROLL_END_TOLERANCE >= scrollHeight - clientHeight

    if (isScrollEnd) {
      onScrollEndDebounced()
    }
  }, [onScrollEndDebounced])

  useEffect(() => {
    if (!ref.current) return

    ref.current.addEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(
    () => () => ref.current?.removeEventListener('scroll', handleScroll),
    []
  )

  return ref
}
