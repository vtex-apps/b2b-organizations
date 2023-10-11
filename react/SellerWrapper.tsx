// Dependencies
import React, { useCallback, useEffect, useRef } from 'react'
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'
import type { Item } from 'vtex.product-context/react/ProductTypes'

import useSeller from './hooks/useSeller'

const CSS_HANDLES = ['sellerWrapper']
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

  const memoizedCallback = useCallback(
    itemSeller => ({
      ...itemSeller,
      sellerDefault: itemSeller.sellerId === seller,
    }),
    [seller]
  )

  const newCurrentSelectedItem = product?.items?.find(item =>
    item.sellers?.find(
      itemSeller =>
        itemSeller.sellerId === seller &&
        itemSeller.commertialOffer.AvailableQuantity > 0
    )
  )

  useEffect(() => {
    if (!seller || !newCurrentSelectedItem || !selectedItem || !dispatch) return

    const { sellers } = newCurrentSelectedItem

    dispatch?.({
      type: SELECT_ITEM_EVENT,
      args: {
        item: {
          ...newCurrentSelectedItem,
          sellers: sellers.map(memoizedCallback),
        },
      },
    })
  }, [seller, newCurrentSelectedItem, selectedItem, dispatch])

  useEffect(() => {
    if (!seller || !selectedItem) return

    const { sellers } = selectedItem

    if (latestItem.current) {
      const { sellers: latestSellers } = latestItem.current

      if (JSON.stringify(sellers) === JSON.stringify(latestSellers)) return
    }

    const newItem = {
      ...selectedItem,
      sellers: sellers.map(memoizedCallback),
    }

    dispatch?.({
      type: SELECT_ITEM_EVENT,
      args: {
        item: newItem,
      },
    })
    latestItem.current = newItem
  }, [seller, selectedItem, dispatch])

  if (!seller || !selectedItem) return <div></div>

  return <div className={`${handles.sellerWrapper}`}>{children}</div>
}

export default SellerWrapper
