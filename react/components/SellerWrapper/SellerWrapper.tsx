import React, { useEffect } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'

import { useSelectSeller } from '../../hooks/useSelectSeller'

type SellerWrapperProps = {
  children: React.ReactNode
}

const CSS_HANDLES = ['sellerWrapper', 'sellerWrapperNoSeller']

const SellerWrapper = ({ children }: SellerWrapperProps) => {
  const handles = useCssHandles(CSS_HANDLES)
  const { currentSelectedItem, selectSeller } = useSelectSeller()

  const { selectedItem } = useProduct() ?? {}

  useEffect(() => {
    selectSeller({ selectedItem })
  }, [selectedItem, selectSeller])

  const className = currentSelectedItem
    ? `${handles.sellerWrapper}`
    : `${handles.sellerWrapper} ${handles.sellerWrapperNoSeller}`

  return <div className={className}>{children}</div>
}

export default SellerWrapper
