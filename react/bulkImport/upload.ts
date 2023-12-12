import type { UploadFinishedData } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../types/BulkImport'

/**
 * Uploads a file to be imported.
 * THIS IS CURRENTLY JUST A MOCK THAT ALWAYS RETURNS
 * THE SAME FIXED RESPONSE AFTER 2s.
 */
export const uploadBulkImportFile = (): Promise<
  UploadFinishedData<UploadFileResult>
> => {
  return new Promise(resolve => {
    setTimeout(
      () =>
        resolve({
          status: 'error',
          showReport: true,
          data: {
            fileData: {
              accountName: 'b2bstoreqa',
              importId: '046e6440-28cc-447a-9483-1cf91523517d',
              importState: 'Completed',
              percentage: '100',
              lastUpdateDate: '2023-12-12T18:14:41+00:00',
              fileName: 'bulk-import-front-test.xlsx',
              importResult: {
                imports: [
                  {
                    name: 'Organizations',
                    importedRows: 2,
                    rowsWithError: 0,
                  },
                  {
                    name: 'Cost Centers',
                    importedRows: 3,
                    rowsWithError: 0,
                  },
                  {
                    name: 'Members',
                    importedRows: 3,
                    rowsWithError: 0,
                  },
                ],
                reportDownloadLink: '',
              },
              importedAt: '2023-12-12T18:14:30+00:00',
              importedUserEmail: 'arthur.andrade@vtex.com',
              importedUserName: 'arthur.andrade',
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
}
