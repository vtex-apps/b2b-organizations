// Dependencies
import React, { useEffect, useRef } from 'react'
import { useProduct, useProductDispatch } from 'vtex.product-context'
import { useCssHandles } from 'vtex.css-handles'

import useSeller from './hooks/useSeller'

const CSS_HANDLES = ['sellerWrapper']

const SellerWrapper = ({ children }: any) => {
  const { seller } = useSeller()
  const dispatch = useProductDispatch()
  const { selectedItem, product } = useProduct() ?? {}
  const latestItem = useRef(null as any)
  const handles = useCssHandles(CSS_HANDLES)

  const newCurrentSelectedItem = product?.items?.find((item: any) =>
    item.sellers?.find(
      (itemSeller: any) =>
        itemSeller.sellerId === seller &&
        itemSeller.commertialOffer.AvailableQuantity > 0
    )
  )

  useEffect(() => {
    if (!seller || !newCurrentSelectedItem || !selectedItem) return

    const { sellers } = newCurrentSelectedItem

    dispatch?.({
      type: 'SET_SELECTED_ITEM',
      args: {
        item: {
          ...newCurrentSelectedItem,
          sellers: sellers.map((itemSeller: any) => ({
            ...itemSeller,
            sellerDefault: itemSeller.sellerId === seller,
          })),
        },
      },
    })
  }, [seller])

  useEffect(() => {
    if (!seller || !selectedItem) return

    const { sellers } = selectedItem

    if (latestItem.current) {
      const { sellers: latestSellers } = latestItem.current

      if (JSON.stringify(sellers) === JSON.stringify(latestSellers)) return
    }

    const newItem = {
      ...selectedItem,
      sellers: sellers.map(itemSeller => ({
        ...itemSeller,
        sellerDefault: itemSeller.sellerId === seller,
      })),
    }

    dispatch?.({
      type: 'SET_SELECTED_ITEM',
      args: {
        item: newItem,
      },
    })
    latestItem.current = newItem
  }, [selectedItem])

  if (!seller || !selectedItem) return null

  return <div className={`${handles.sellerWrapper}`}>{children}</div>
}

export default SellerWrapper
