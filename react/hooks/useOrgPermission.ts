import { useMemo } from 'react'
import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import { checkUserAdminPermission } from '../services'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
  authContext?: 'admin' | 'storefront'
}

const ADMIN_SESSION_ITEMS = [
  'authentication.adminUserEmail',
  'account.accountName',
] as const

export function useOrgPermission({
  resourceCode = ORGANIZATION_VIEW,
  authContext = 'admin',
}: UseOrgPermissionParams) {
  const isStorefront = authContext === 'storefront'

  const sessionItems = useMemo(
    () =>
      isStorefront ? ['account.accountName'] : [...ADMIN_SESSION_ITEMS],
    [isStorefront]
  )

  const fullSession = useFullSession({
    variables: {
      items: [...sessionItems],
    },
  })

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  const adminUserEmail =
    fullSession.data?.session?.namespaces?.authentication?.adminUserEmail?.value

  const userEmail = adminUserEmail

  const shouldFetchGranted = !isStorefront && Boolean(userEmail && account)

  const { data, isLoading, isValidating, error } = useSWR(
    shouldFetchGranted ? `/granted?${resourceCode}` : null,
    () =>
      checkUserAdminPermission({
        account: account as string,
        userEmail: userEmail as string,
        resourceCode,
      }),
    {
      dedupingInterval: 0,
    }
  )

  if (isStorefront) {
    return {
      data: true,
      error: undefined,
      isLoading: false,
      isValidating: false,
    }
  }

  return {
    data,
    error,
    isLoading,
    isValidating,
  }
}
