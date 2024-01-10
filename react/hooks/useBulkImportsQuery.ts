import useSWR from 'swr'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { getBulkImportList } from '../services'

type UseBulkImportQueryProps = {
  shouldPoll?: boolean
  onError?: () => void
}

const useBulkImportQuery = (
  { shouldPoll, onError }: UseBulkImportQueryProps = { shouldPoll: false }
) => {
  const session = useSessionResponse() as Session

  const account = session?.namespaces?.account?.accountName?.value

  return useSWR(
    account ? '/buyer-orgs' : null,
    () => getBulkImportList(account),
    {
      refreshInterval: shouldPoll ? 30 * 1000 : 0, // 30 seconds
      onError,
    }
  )
}

export default useBulkImportQuery
