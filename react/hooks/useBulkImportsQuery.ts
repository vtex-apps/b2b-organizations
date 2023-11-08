import useSWR from 'swr'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { getBulkImportList } from '../services'

const useBulkImportQuery = () => {
  const session = useSessionResponse() as Session

  const account = session?.namespaces?.account?.accountName?.value

  return useSWR(
    account ? 'bulk-import-list' : null,
    () => getBulkImportList(account),
    {
      refreshInterval: 30 * 1000, // 30 seconds
    }
  )
}

export default useBulkImportQuery
