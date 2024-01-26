import useSWRMutation from 'swr/mutation'

import { validateBulkImport } from '../services'

const useValidateBulkImport = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { trigger } = useSWRMutation(
    '/buyer-orgs/start',
    (_, { arg }: { arg: { importId: string } }) =>
      validateBulkImport(arg.importId),
    {
      onSuccess,
    }
  )

  return { startBulkImportValidation: trigger }
}

export default useValidateBulkImport
