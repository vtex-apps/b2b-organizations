import React, { useState } from 'react'

import { useBulkImportsQuery } from '../../hooks'
import ImportAlertList from '../ImportAlertList/ImportAlertList'

const BulkImportList = () => {
  const [shouldPoll, setShouldPoll] = useState(true)
  const { data, error } = useBulkImportsQuery({
    shouldPoll,
    onError: () => setShouldPoll(false),
  })

  if (error?.message) {
    console.error(error)
  }

  if (data) return <ImportAlertList data={data} />

  return null
}

export default BulkImportList
