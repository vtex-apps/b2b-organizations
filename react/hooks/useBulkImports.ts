import type { ImportStatus } from '@vtex/bulk-import-ui'
import { useMemo } from 'react'

import type { ImportDetails } from '../types/BulkImport'

const statusMap = {
  InProgress: 'pending',
  Completed: 'success',
  CompletedWithError: 'error',
} as const

/**
 * Return initial bulk imports.
 * THIS IS CURRENTLY JUST A MOCK OF BULK IMPORT HOOK.
 */
const useBulkImports = () => {
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

  const data: ImportStatus[] = useMemo(() => {
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

  return { data, bulkImports }
}

export default useBulkImports
