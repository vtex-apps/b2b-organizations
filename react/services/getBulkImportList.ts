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
    .filter(item =>
      ['InProgress', 'Completed', 'CompletedWithError'].some(
        status => status === item.importState
      )
    )
    .map(item => ({
      importId: item.importId,
      progress: Number(item.percentage),
      status: statusMap[item.importState as keyof typeof statusMap],
      importedAt: new Date(item.importedAt),
      file: {
        name: item.fileName,
      },
    }))
    .sort(
      (currentImport, nextImport) =>
        nextImport.importedAt.getTime() - currentImport.importedAt.getTime()
    )
    .slice(0, 1)
}

export default getBulkImportList
