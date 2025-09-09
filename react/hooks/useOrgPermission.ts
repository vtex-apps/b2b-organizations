import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import { checkUserAdminPermission } from '../services'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
}

export function useOrgPermission({
  resourceCode = ORGANIZATION_VIEW,
}: UseOrgPermissionParams) {
  const fullSession = useFullSession({
    variables: {
      items: ['authentication.adminUserEmail', 'account.accountName'],
    },
  })

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  const userEmail =
    fullSession.data?.session?.namespaces?.authentication?.adminUserEmail?.value

  const { data, isLoading, isValidating, error } = useSWR<{ data: boolean }>(
    userEmail && account ? `/granted?${resourceCode}` : null,
    () => {
      if (!userEmail || !account) {
        throw new Error('Missing required parameters for permission check')
      }

      return checkUserAdminPermission({
        account,
        userEmail,
        resourceCode,
      })
    },
    {
      dedupingInterval: 0,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
  }
}
