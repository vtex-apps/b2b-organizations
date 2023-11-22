import { useCallback } from 'react'

import type { ErrorRowReportData } from '../types/BulkImport'

const useErrorCount = () => {
  return useCallback((errorRowReportDataList: ErrorRowReportData[]) => {
    return errorRowReportDataList.reduce(
      (acc, error) => acc + error.errorCount,
      0
    )
  }, [])
}

export default useErrorCount
