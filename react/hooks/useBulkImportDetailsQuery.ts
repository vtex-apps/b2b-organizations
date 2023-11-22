import useSWR from 'swr'

import { getBulkImportDetails } from '../services'

const useBulkImportDetailsQuery = (importId: string) => {
  return useSWR(
    importId ? `/buyer-orgs/${importId}` : null,
    () => getBulkImportDetails(importId),
    {
      revalidateOnFocus: false,
    }
  )
}

export default useBulkImportDetailsQuery
