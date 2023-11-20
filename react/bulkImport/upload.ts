import type { UploadFinishedData } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../types/BulkImport'

/**
 * Uploads a file to be imported.
 * THIS IS CURRENTLY JUST A MOCK THAT ALWAYS RETURNS
 * THE SAME FIXED RESPONSE AFTER 2s.
 */
export const uploadBulkImportFile = () => {
  const promiseData: Promise<UploadFinishedData<
    UploadFileResult
  >> = new Promise(resolve => {
    setTimeout(
      () =>
        resolve({
          status: 'error',
          showReport: true,
          data: {
            fileData: {
              uploadedDate: '11/20/2023',
              userName: 'Mayan Brown',
              fileName: 'file.xlxs',
            },
            error: [
              {
                title: 'Organizations',
                errorCount: 20,
              },
              {
                title: 'Members',
                errorCount: 2,
              },
              {
                title: 'Cost Centers',
                errorCount: 0,
              },
            ],
          },
        }),
      2000
    )
  })

  return promiseData
}
