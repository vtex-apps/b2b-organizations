import React from 'react'

import { useBulkImportsQuery } from '../../hooks'
import ImportAlertList from '../ImportAlertList/ImportAlertList'

const BulkImportList = () => {
  const { data, error } = useBulkImportsQuery({
    shouldPoll: true,
  })

  if (error?.message) {
    console.error(error)
  }

  if (data) return <ImportAlertList data={data} />

  return null
}

export default BulkImportList
