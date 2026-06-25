import bulkImportClient, { BulkImportRequestConfig } from './bulkImportClient'

const validateBulkImport = async (
  importId: string,
  account: string
): Promise<unknown> => {
  return bulkImportClient.post(
    `/buyer-orgs/validate/${importId}`,
    undefined,
    { account } as BulkImportRequestConfig
  )
}

export default validateBulkImport
