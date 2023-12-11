import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { Item } from 'vtex.product-context/react/ProductTypes'

import useSeller from './useSeller'

const SELECT_ITEM_EVENT = 'SET_SELECTED_ITEM'

export const useSelectSeller = () => {
  const { seller } = useSeller()
  const { product } = useProduct() ?? {}
  const latestItem = useRef((null as unknown) as Item)
  const [loading, setLoading] = useState(true)
  const productDispatch = useProductDispatch()

  const addSellerDefaultToItem = useCallback(
    itemSeller => ({
      ...itemSeller,
      sellerDefault: seller?.includes(itemSeller.sellerId),
    }),
    [seller]
  )

  const currentSelectedItem = useMemo(
    () =>
      product?.items?.find(item =>
        item.sellers?.find(
          itemSeller =>
            seller?.includes(itemSeller.sellerId) &&
            itemSeller.commertialOffer.AvailableQuantity > 0
        )
      ) ?? null,

    [seller, product]
  )

  const selectSeller = ({
    selectedItem,
  }: {
    selectedItem: Item | null | undefined
  }) => {
    if (!currentSelectedItem || !selectedItem) {
      return
    }

    // just to keep the dependency
    setLoading(true)
    const { sellers } = (currentSelectedItem as unknown) as Item
    const selectedItemWithSeller = {
      ...((currentSelectedItem as unknown) as Item),
      sellers: sellers.map(addSellerDefaultToItem),
    }

    if (
      JSON.stringify(latestItem.current) ===
      JSON.stringify(selectedItemWithSeller)
    ) {
      return
    }

    productDispatch?.({
      type: SELECT_ITEM_EVENT,
      args: {
        item: selectedItemWithSeller,
      },
    })
    setLoading(false)
    latestItem.current = selectedItemWithSeller
  }

  return { loading, seller, currentSelectedItem, selectSeller }
}
