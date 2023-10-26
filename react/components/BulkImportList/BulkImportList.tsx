import React from 'react'
import { ImportAlertError } from '@vtex/bulk-import-ui'

import { useBulkImports } from '../../hooks'
import ImportAlertList from '../ImportAlertList/ImportAlertList'

const BulkImportList = () => {
  const { data, error } = useBulkImports()

  return (
    <>
      {error && <ImportAlertError>{error}</ImportAlertError>}
      {data && <ImportAlertList data={data} onDismiss={() => {}} />}
    </>
  )
}

export default BulkImportList
