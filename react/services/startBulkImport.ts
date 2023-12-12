import type { StartImport } from '../types/BulkImport'
import bulkImportClient from '.'

const startBulkImport = async (importId: string) => {
  const startImportResponse = await bulkImportClient.post(
    `/buyer-orgs?/${importId}`
  )

  return startImportResponse.data as StartImport
}

export default startBulkImport
