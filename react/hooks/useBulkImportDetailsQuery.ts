import useSWR from 'swr'

import { getBulkImportDetails } from '../services'
import type { BulkImportDetails } from '../services/getBulkImportDetails'

export type UseBulkImportDetailsQueryProps = {
  importId?: string
  onSuccess?: (data: BulkImportDetails) => void
  refreshInterval?: number
}

const useBulkImportDetailsQuery = ({
  importId,
  onSuccess = () => {},
  refreshInterval = 0,
}: UseBulkImportDetailsQueryProps) => {
  return useSWR(
    importId ? `/buyer-orgs/${importId}` : null,
    () => getBulkImportDetails(importId),
    {
      refreshInterval,
      revalidateOnFocus: false,
      onSuccess,
    }
  )
}

export default useBulkImportDetailsQuery
