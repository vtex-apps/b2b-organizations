import type { ImportStatus } from '@vtex/bulk-import-ui'
import { useEffect, useMemo, useState } from 'react'

import type { ImportDetails } from '../types/BulkImport'
import { bulkImports as bulkImportsMock } from './bulkImportsMockData'

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

  const bulkImports: { items: ImportDetails[] } = { items: bulkImportsMock }

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
    const interval = setTimeout(() => {
      setBulkImportData({ data: importStatusList, loading: false })
    }, 1000 * 5)

    return () => clearTimeout(interval)
  }, [])

  return bulkImportData
}

export default useBulkImports
