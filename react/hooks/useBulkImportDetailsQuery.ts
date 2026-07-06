import useSWR from 'swr'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
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
  const session = useSessionResponse() as Session
  const account = session?.namespaces?.account?.accountName?.value

  return useSWR(
    importId && account ? `/buyer-orgs/${importId}` : null,
    () => getBulkImportDetails(importId!, account!),
    {
      refreshInterval,
      revalidateOnFocus: false,
      onSuccess,
    }
  )
}

export default useBulkImportDetailsQuery
