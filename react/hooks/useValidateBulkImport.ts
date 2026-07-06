import useSWRMutation from 'swr/mutation'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { validateBulkImport } from '../services'

const useValidateBulkImport = ({ onSuccess }: { onSuccess?: () => void }) => {
  const session = useSessionResponse() as Session
  const account = session?.namespaces?.account?.accountName?.value

  const { trigger } = useSWRMutation(
    account ? '/buyer-orgs/start' : null,
    (_, { arg }: { arg: { importId: string } }) =>
      validateBulkImport(arg.importId, account!),
    {
      onSuccess,
    }
  )

  return { startBulkImportValidation: trigger }
}

export default useValidateBulkImport
