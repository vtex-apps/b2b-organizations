import React from 'react'
import { ImportAlertError } from '@vtex/bulk-import-ui'

import { useBulkImportsQuery } from '../../hooks'
import ImportAlertList from '../ImportAlertList/ImportAlertList'

const BulkImportList = () => {
  const { data, error, mutate } = useBulkImportsQuery()

  if (error?.message)
    return (
      <ImportAlertError onTryAgainClick={mutate}>
        {JSON.stringify(error)}
      </ImportAlertError>
    )

  if (data) return <ImportAlertList data={data} onDismiss={() => {}} />

  return null
}

export default BulkImportList
