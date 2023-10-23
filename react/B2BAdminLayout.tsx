import type { FunctionComponent } from 'react'
import React from 'react'
import { ThemeProvider, ToastProvider } from '@vtex/admin-ui'
import 'vtex.country-codes/locales'
import { BulkImportProvider } from '@vtex/bulk-import-ui'

import { useTranslate } from './hooks'

const B2BAdminLayout: FunctionComponent = ({ children }) => {
  const { translate } = useTranslate()

  return (
    <ThemeProvider>
      <BulkImportProvider value={{ translate }}>
        <ToastProvider>{children}</ToastProvider>
      </BulkImportProvider>
    </ThemeProvider>
  )
}

export default B2BAdminLayout
