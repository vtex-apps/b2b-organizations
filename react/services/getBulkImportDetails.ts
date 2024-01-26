import bulkImportClient from '.'
import type { ImportDetails, ImportReportData } from '../types/BulkImport'

export type BulkImportDetails = Omit<ImportDetails, 'percentage'> & {
  importReportList: ImportReportData[]
  percentage: number
}

const getBulkImportDetails = async (
  importId?: string
): Promise<BulkImportDetails> => {
  const importListResponse = await bulkImportClient.get<ImportDetails>(
    `/buyer-orgs/${importId}`
  )

  const { data } = importListResponse

  const { importResult } = data

  const importList = importResult?.imports ?? []

  const [totalSuccess, totalError] = importList.reduce(
    ([successAcc, errorAcc], { importedRows, rowsWithError }) => {
      return [successAcc + importedRows, errorAcc + rowsWithError]
    },
    [0, 0] as [number, number]
  )

  const percentage = (totalSuccess * 100) / (totalSuccess + totalError)

  const fullPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100

  return {
    ...data,
    importReportList: importList.map(
      ({ importedRows, rowsWithError, name }) => ({
        title: name,
        success: {
          percentage: fullPercentage,
          imports: importedRows,
        },
        error: {
          percentage: 100 - fullPercentage,
          imports: rowsWithError,
        },
      })
    ),
    percentage: fullPercentage,
  }
}

export default getBulkImportDetails
