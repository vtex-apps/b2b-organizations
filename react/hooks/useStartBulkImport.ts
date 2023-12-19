import useSWRMutation from 'swr/mutation'

import { startBulkImport } from '../services'

const useStartBulkImport = () => {
  const { trigger, ...data } = useSWRMutation(
    '/buyer-orgs',
    (_, { arg }: { arg: { importId: string } }) => startBulkImport(arg.importId)
  )

  return { startBulkImport: trigger, ...data }
}

export default useStartBulkImport
