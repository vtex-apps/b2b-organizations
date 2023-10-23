import React from 'react'
import {
  BulkImportProvider,
  ImportAlertError,
  ImportAlertList,
} from '@vtex/bulk-import-ui'

import { useBulkImports, useTranslate } from '../../hooks'
import { getImportReportData } from '../../bulkImport/getImportReportData'

const BulkImportList = () => {
  const { translate } = useTranslate()

  const { data, error } = useBulkImports()

  return (
    <>
      {error && (
        <BulkImportProvider value={{ translate }}>
          <ImportAlertError>{error}</ImportAlertError>
        </BulkImportProvider>
      )}
      {data && (
        <ImportAlertList
          data={data}
          getImportReportData={getImportReportData}
          translate={translate}
          onDismiss={() => {}}
        />
      )}
    </>
  )
}

export default BulkImportList
