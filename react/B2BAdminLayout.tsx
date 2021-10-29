import type { FunctionComponent } from 'react'
import React from 'react'
import { createSystem, ToastProvider } from '@vtex/admin-ui'
import 'vtex.country-codes/locales'

const B2BAdminLayout: FunctionComponent = ({ children }) => {
  const [SystemProvider] = createSystem({ key: 'btob-organizations' })

  return (
    <SystemProvider>
      <ToastProvider>{children}</ToastProvider>
    </SystemProvider>
  )
}

export default B2BAdminLayout
