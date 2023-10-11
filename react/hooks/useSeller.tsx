import { useState, useEffect } from 'react'
import { useProduct } from 'vtex.product-context'

const decode = (str: string): string =>
  Buffer.from(str, 'base64').toString('binary')

export default function useSeller() {
  const [seller, setSeller] = useState<string | null>(null)
  const { selectedItem, product } = useProduct() ?? {}

  useEffect(() => {
    try {
      const { facets } = JSON.parse(decode(window?.__RUNTIME__?.segmentToken))

      if (facets) {
        const facetsList = facets.split(';')
        const sellerFacet = facetsList.find((facet: string) =>
          facet.includes('private-seller')
        )

        const [, sessionSeller] = sellerFacet?.split('=') ?? []

        if (sessionSeller) {
          setSeller(sessionSeller)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [selectedItem, product])

  return { seller }
}
