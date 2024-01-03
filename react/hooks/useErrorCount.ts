import { useCallback } from 'react'

import type { ValidationResult } from '../types/BulkImport'

const useErrorCount = () => {
  return useCallback((errorRowReportDataList: ValidationResult[] = []) => {
    return errorRowReportDataList.reduce(
      (acc, error) => acc + error.invalidRows,
      0
    )
  }, [])
}

export default useErrorCount
