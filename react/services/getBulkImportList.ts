import type { ImportDetails } from '../types/BulkImport'
import bulkImportClient from '.'

const statusMap = {
  InProgress: 'pending',
  Completed: 'success',
  CompletedWithError: 'error',
} as const

const getBulkImportList = (account: string) =>
  bulkImportClient
    .get(`/buyer-orgs?an=${account}`)
    .then(v => (v.data as unknown) as ImportDetails[])
    .then(bulkImports =>
      bulkImports
        .filter(item => item.status !== 'ReadyToImport')
        .map(item => ({
          ...item,
          progress: item.progressPercentage,
          status: statusMap[item.status as keyof typeof statusMap],
          file: {
            name: item.filename,
          },
        }))
    )

export default getBulkImportList
