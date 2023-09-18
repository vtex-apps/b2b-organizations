import type { UploadFileFunction } from '@vtex/bulk-import-ui'

/**
 * Uploads a file to be imported.
 * THIS IS CURRENTLY JUST A MOCK THAT ALWAYS RETURNS
 * THE SAME FIXED RESPONSE AFTER 2s.
 */
export const uploadBulkImportFile: UploadFileFunction = async () =>
  new Promise(resolve => {
    setTimeout(() => resolve({}), 2000)
  })
