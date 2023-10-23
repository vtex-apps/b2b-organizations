import React from 'react'
import { ImportAlertError, ImportAlertList } from '@vtex/bulk-import-ui'

import { useBulkImports } from '../../hooks'
import { getImportReportData } from '../../bulkImport/getImportReportData'

const BulkImportList = () => {
  const { data, error } = useBulkImports()

  return (
    <>
      {error && <ImportAlertError>{error}</ImportAlertError>}
      {data && (
        <ImportAlertList
          data={data}
          getImportReportData={getImportReportData}
          onDismiss={() => {}}
        />
      )}
    </>
  )
}

export default BulkImportList
