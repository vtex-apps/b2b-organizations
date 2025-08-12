import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { checkUserAdminPermission } from '../services'

interface UseOrgPermissionParams {
  resourceCode?: 'buyer_organization_edit' | 'buyer_organization_view'
}

export function useOrgPermission({
  resourceCode = 'buyer_organization_view',
}: UseOrgPermissionParams) {
  const session = useSessionResponse() as Session
  const fullSession = useFullSession({
    variables: {
      items: ['authentication.adminUserEmail'],
    },
  })

  const account = session?.namespaces?.account?.accountName?.value
  const userEmail =
    fullSession.data?.session?.namespaces?.authentication?.adminUserEmail?.value

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
