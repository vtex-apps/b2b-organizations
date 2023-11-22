import bulkImportClient from '.'
import type { ImportDetails, ImportReportData } from '../types/BulkImport'

type BulkImportList = Omit<ImportDetails, 'percentage'> & {
  importReportList: ImportReportData[]
  percentage: number
}

const getBulkImportList = async (importId: string): Promise<BulkImportList> => {
  const importListResponse = await bulkImportClient.get<ImportDetails>(
    `/buyer-orgs/${importId}`
  )

  const { data } = importListResponse

  if (!data?.importResult) throw Error('Import result not provided')

  const { importResult } = data

  const totalImports = importResult.importedRows + importResult.rowsWithError

  const errorPercentage = (importResult.rowsWithError * 100) / totalImports || 0
  const successPercentage =
    (importResult.importedRows * 100) / totalImports || 0

  return {
    ...data,
    importReportList: [
      {
        title: 'Report',
        success: {
          percentage: successPercentage,
          imports: importResult.importedRows,
        },
        error: {
          percentage: errorPercentage,
          imports: importResult.rowsWithError,
        },
      },
    ],
    percentage: successPercentage,
  }
}

export default getBulkImportList
