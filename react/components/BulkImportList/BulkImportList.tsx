import React from 'react'
import { ImportAlertList } from '@vtex/bulk-import-ui'

import { useBulkImports, useTranslate } from '../../hooks'
import { getImportReportData } from '../../bulkImport/getImportReportData'

const BulkImportList = () => {
  const { translate } = useTranslate()

  const { data } = useBulkImports()

  return (
    <ImportAlertList
      data={data}
      getImportReportData={getImportReportData}
      translate={translate}
      onDismiss={() => {}}
    />
  )
}

export default BulkImportList
