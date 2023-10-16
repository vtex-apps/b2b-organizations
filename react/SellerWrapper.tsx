import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'
import type { Item } from 'vtex.product-context/react/ProductTypes'

import useSeller from './hooks/useSeller'

const CSS_HANDLES = ['sellerWrapper', 'loadingSeller']
const SELECT_ITEM_EVENT = 'SET_SELECTED_ITEM'

type SellerWrapperProps = {
  children: React.ReactNode
}

const SellerWrapper = ({ children }: SellerWrapperProps) => {
  const { seller } = useSeller()
  const dispatch = useProductDispatch()
  const { selectedItem, product } = useProduct() ?? {}
  const latestItem = useRef((null as unknown) as Item)
  const handles = useCssHandles(CSS_HANDLES)
  const [loadingSeller, setLoadingSeller] = useState(true)

  const addSellerDefaultToItem = useCallback(
    itemSeller => ({
      ...itemSeller,
      sellerDefault: seller?.includes(itemSeller.sellerId),
    }),
    [seller]
  )

  useEffect(() => {
    const shouldDispatchSelectItem =
      !!seller && !!product && !!selectedItem && !!dispatch

    if (!shouldDispatchSelectItem) return
    const newCurrentSelectedItem =
      product?.items?.find(item =>
        item.sellers?.find(
          itemSeller =>
            seller?.includes(itemSeller.sellerId) &&
            itemSeller.commertialOffer.AvailableQuantity > 0
        )
      ) || ({} as Item)

    if (!newCurrentSelectedItem) {
      return
    }

    const { sellers } = newCurrentSelectedItem
    const selectedItemWithSeller = {
      ...newCurrentSelectedItem,
      sellers: sellers.map(addSellerDefaultToItem),
    }

    if (
      JSON.stringify(latestItem.current) ===
      JSON.stringify(selectedItemWithSeller)
    ) {
      return
    }

    dispatch?.({
      type: SELECT_ITEM_EVENT,
      args: {
        item: selectedItemWithSeller,
      },
    })

    setLoadingSeller(false)

    latestItem.current = selectedItemWithSeller
  }, [seller, product, selectedItem, dispatch, addSellerDefaultToItem])

  return (
    <div
      className={`${handles.sellerWrapper} ${
        loadingSeller ? handles.loadingSeller : ''
      }`}
    >
      {children}
    </div>
  )
}

export default SellerWrapper
