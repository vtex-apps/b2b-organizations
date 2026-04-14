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
      items: [
        'authentication.adminUserEmail',
        'authentication.storeUserEmail',
        'profile.email',
        'account.accountName',
      ],
    },
  })

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  const namespaces = fullSession.data?.session?.namespaces

  const adminUserEmail =
    namespaces?.authentication?.adminUserEmail?.value
  const storeUserEmail =
    namespaces?.authentication?.storeUserEmail?.value
  const profileEmail = namespaces?.profile?.email?.value

  const userEmail = adminUserEmail || storeUserEmail || profileEmail

  const { data, isLoading, isValidating, error } = useSWR<{ data: boolean }>(
    userEmail && account ? `/granted?${resourceCode}` : null,
    () =>
      checkUserAdminPermission({
        account,
        userEmail,
        resourceCode,
      }),
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
