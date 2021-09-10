import type { FunctionComponent } from 'react'
import React from 'react'
import { createSystem } from '@vtex/admin-ui'
import 'vtex.country-codes/locales'

const B2BAdminLayout: FunctionComponent = ({ children }) => {
  const [ThemeProvider] = createSystem({ key: 'btob-organizations' })

  return <ThemeProvider>{children}</ThemeProvider>
}

export default B2BAdminLayout
