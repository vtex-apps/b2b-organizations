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
        .filter(
          item =>
            !['ReadyToImport', 'Failed'].some(
              status => status === item.importState
            )
        )
        .map(item => ({
          importId: item.importId,
          progress: Number(item.percentage),
          status: statusMap[item.importState as keyof typeof statusMap],
          lastUpdateDate: new Date(item.lastUpdateDate),
          file: {
            name: item.fileName,
          },
        }))
    )

export default getBulkImportList
