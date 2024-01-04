import React from 'react'
import { ImportAlertError } from '@vtex/bulk-import-ui'

import { useBulkImportsQuery, useTranslate } from '../../hooks'
import ImportAlertList from '../ImportAlertList/ImportAlertList'

const BulkImportList = () => {
  const { data, error, mutate } = useBulkImportsQuery()

  const { translate: t } = useTranslate()

  if (error?.message) {
    console.error(error?.message)

    return (
      <ImportAlertError onTryAgainClick={mutate}>
        {t('errorMessage')}
      </ImportAlertError>
    )
  }

  if (data) return <ImportAlertList data={data} />

  return <></>
}

export default BulkImportList
