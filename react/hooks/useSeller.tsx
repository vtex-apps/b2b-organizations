import { useEffect, useState } from 'react'
import { useProduct } from 'vtex.product-context'

const decode = (str: string): string =>
  Buffer.from(str, 'base64').toString('binary')

export default function useSeller() {
  const [seller, setSeller] = useState<string[] | null>(null)
  const { selectedItem, product } = useProduct() ?? {}

  useEffect(() => {
    try {
      const { facets } = JSON.parse(decode(window?.__RUNTIME__?.segmentToken))

      if (facets) {
        const facetsList = facets.split(';')
        const sellerFacet = facetsList.filter((facet: string) =>
          facet.includes('private-seller')
        )

        const sellers = sellerFacet.map((facet: string) => {
          const [, value] = facet?.split('=') ?? []

          return value
        })

        if (sellers?.length) {
          setSeller(sellers)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [selectedItem, product])

  return { seller }
}
