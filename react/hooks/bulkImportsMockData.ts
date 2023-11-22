import type { ImportReportData } from '../types/BulkImport'

/**
 * Return import report data.
 * THIS IS CURRENTLY JUST A MOCK.
 */
export const getImportReportData = (name: string) => {
  const data: ImportReportData = {
    title: name,
    success: {
      percentage: 90,
      imports: 900,
    },
    error: {
      percentage: 10,
      imports: 100,
    },
  }

  return new Array(10).fill(data)
}
