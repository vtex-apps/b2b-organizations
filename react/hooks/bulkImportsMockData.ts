import type { ImportDetails } from '../types/BulkImport'

const FILE_WITH_ERROR = 'customers-buyer-orgs-error.csv'

/**
 * Return import report data.
 * THIS IS CURRENTLY JUST A MOCK.
 */
export const getImportReportData = (name: string) => ({
  success: [
    {
      rowNumber: 32,
      rowDisplayTitle: 'Buyer Organization 1',
    },
    {
      rowNumber: 84,
      rowDisplayTitle: 'Buyer Organization 2',
    },
  ],
  totalRows: 2,
  error:
    name === FILE_WITH_ERROR
      ? [
          {
            rowNumber: 2,
            rowDisplayTitle: `Buyer Organization 2`,
            errors: [
              { column: 'A', errorCode: 'invalid-name' },
              { column: 'D', errorCode: 'missing-email' },
            ],
          },
        ]
      : undefined,
})

export const bulkImports: ImportDetails[] = [
  {
    id: '1',
    filename: 'customers-buyer-orgs-pending.csv',
    progressPercentage: 40,
    status: 'InProgress',
  },
  {
    id: '2',
    filename: 'customers-buyer-orgs-success.csv',
    status: 'Completed',
  },
  {
    id: 'id',
    filename: 'customers-buyer-orgs-error.csv',
    status: 'CompletedWithError',
  },
]
