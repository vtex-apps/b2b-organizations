import type { ImportDetails } from '../types/BulkImport'
import bulkImportClient from '.'

const statusMap = {
  InProgress: 'pending',
  Completed: 'success',
  CompletedWithError: 'error',
} as const

const getBulkImportList = async (account: string) => {
  const importListResponse = await bulkImportClient.get(
    `/buyer-orgs?an=${account}`
  )

  const importListData = importListResponse.data as ImportDetails[]

  return importListData
    .filter(
      item =>
        !['ReadyToImport', 'Failed'].some(status => status === item.importState)
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
    .reverse()
    .slice(0, 5)
}

export default getBulkImportList
