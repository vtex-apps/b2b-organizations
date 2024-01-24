import bulkImportClient from '.'

const validateBulkImport = async (importId?: string): Promise<unknown> => {
  return bulkImportClient.post(`/buyer-orgs/validate/${importId}`)
}

export default validateBulkImport
