import useSWR from 'swr'
import { useState } from 'react'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { getBulkImportList } from '../services'

type UseBulkImportQueryProps = {
  shouldPoll?: boolean
}

const useBulkImportQuery = (
  { shouldPoll: initialShouldPoll }: UseBulkImportQueryProps = {
    shouldPoll: false,
  }
) => {
  const session = useSessionResponse() as Session

  const [shouldPoll, setShouldPoll] = useState(initialShouldPoll)

  const account = session?.namespaces?.account?.accountName?.value

  return useSWR(
    account ? '/buyer-orgs' : null,
    () => getBulkImportList(account),
    {
      refreshInterval: shouldPoll ? 30 * 1000 : 0, // 30 seconds
      onError: errorData => {
        const status = errorData?.response?.status ?? 0

        if (status >= 400 && status < 500) {
          setShouldPoll(false)
        }
      },
    }
  )
}

export default useBulkImportQuery
