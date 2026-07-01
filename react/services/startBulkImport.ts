import type { ImportDetails } from '../types/BulkImport'
import bulkImportClient, { BulkImportRequestConfig } from './bulkImportClient'

const startBulkImport = async (importId: string, account: string) => {
  const startImportResponse = await bulkImportClient.post(
    `/buyer-orgs/${importId}`,
    undefined,
    { account } as BulkImportRequestConfig
  )

  return startImportResponse.data as ImportDetails
}

export default startBulkImport
