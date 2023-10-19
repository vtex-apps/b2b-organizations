import type { ImportStatus } from '@vtex/bulk-import-ui'
import { useEffect, useMemo, useState } from 'react'

import type { ImportDetails } from '../types/BulkImport'

const statusMap = {
  InProgress: 'pending',
  Completed: 'success',
  CompletedWithError: 'error',
} as const

type UseBulkImports =
  | {
      loading: true
      data?: null
      error?: null
    }
  | {
      loading: false
      data: ImportStatus[]
      error?: null
    }
  | {
      loading: false
      data?: null
      error: string
    }

/**
 * Return initial bulk imports.
 * THIS IS CURRENTLY JUST A MOCK OF BULK IMPORT HOOK.
 */
const useBulkImports = () => {
  const [bulkImportData, setBulkImportData] = useState<UseBulkImports>({
    loading: true,
  })

  const bulkImports: { items: ImportDetails[] } = {
    items: [
      {
        id: '1',
        filename: 'customers-buyer-orgs-pending.csv',
        progressPercentage: 40,
        status: 'InProgress',
      },
      {
        id: '2',
        filename: 'customers-buyer-orgs-success.csv',
        status: 'Completed',
      },
      {
        id: 'id',
        filename: 'customers-buyer-orgs-error.csv',
        status: 'CompletedWithError',
      },
    ],
  }

  const importStatusList: ImportStatus[] = useMemo(() => {
    return bulkImports.items
      .filter(item => item.status !== 'ReadyToImport')
      .map(item => ({
        ...item,
        progress: item.progressPercentage,
        status: statusMap[item.status as keyof typeof statusMap],
        file: {
          name: item.filename,
        },
      }))
  }, [bulkImports.items])

  useEffect(() => {
    const interval = setInterval(() => {
      setBulkImportData(oldBulkImportData => {
        return oldBulkImportData.data
          ? { data: importStatusList, loading: false }
          : { error: 'Something went wrong with the import', loading: false }
      })
    }, 1000 * 5)

    return () => clearInterval(interval)
  }, [])

  return bulkImportData
}

export default useBulkImports
