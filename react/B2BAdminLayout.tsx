import type { FunctionComponent } from 'react'
import React from 'react'
import { ThemeProvider, ToastProvider } from '@vtex/admin-ui'
import 'vtex.country-codes/locales'

const B2BAdminLayout: FunctionComponent = ({ children }) => {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}

export default B2BAdminLayout
