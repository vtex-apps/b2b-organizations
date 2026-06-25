import useSWRMutation from 'swr/mutation'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { startBulkImport } from '../services'

const useStartBulkImport = () => {
  const session = useSessionResponse() as Session
  const account = session?.namespaces?.account?.accountName?.value

  const { trigger, ...data } = useSWRMutation(
    account ? '/buyer-orgs' : null,
    (_, { arg }: { arg: { importId: string } }) =>
      startBulkImport(arg.importId, account!)
  )

  return { startBulkImport: trigger, ...data }
}

export default useStartBulkImport
