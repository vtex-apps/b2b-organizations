import type { ImportDetails } from '../types/BulkImport'
import bulkImportClient from '.'

const startBulkImport = async (importId: string) => {
  const startImportResponse = await bulkImportClient.post(
    `/buyer-orgs/${importId}`
  )

  return startImportResponse.data as ImportDetails
}

export default startBulkImport
