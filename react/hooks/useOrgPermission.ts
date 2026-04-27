import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import { checkUserAdminPermission } from '../services'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
}

const VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX = 'VtexIdclientAutCookie'

const BASE_SESSION_ITEMS = [
  'authentication.adminUserEmail',
  'authentication.storeUserEmail',
  'profile.email',
  'account.accountName',
] as const

export function useOrgPermission({
  resourceCode = ORGANIZATION_VIEW,
}: UseOrgPermissionParams) {
  const [accountForSessionItems, setAccountForSessionItems] = useState<
    string | undefined
  >()

  const sessionItems = useMemo(() => {
    if (!accountForSessionItems) {
      return [...BASE_SESSION_ITEMS]
    }

    return [
      ...BASE_SESSION_ITEMS,
      `cookie.${VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX}_${accountForSessionItems}`,
    ]
  }, [accountForSessionItems])

  const fullSession = useFullSession({
    variables: {
      items: sessionItems,
    },
  })

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  useEffect(() => {
    if (account && account !== accountForSessionItems) {
      setAccountForSessionItems(account)
    }
  }, [account, accountForSessionItems])

  const namespaces = fullSession.data?.session?.namespaces

  const adminUserEmail =
    namespaces?.authentication?.adminUserEmail?.value
  const storeUserEmail =
    namespaces?.authentication?.storeUserEmail?.value
  const profileEmail = namespaces?.profile?.email?.value

  const userEmail = adminUserEmail || storeUserEmail || profileEmail

  const vtexAuthCookie = account
    ? namespaces?.cookie?.[`${VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX}_${account}`]
        ?.value
    : undefined

  const { data, isLoading, isValidating, error } = useSWR<{ data: boolean }>(
    userEmail && account && vtexAuthCookie
      ? `/granted?${resourceCode}`
      : null,
    () =>
      checkUserAdminPermission({
        account,
        userEmail,
        resourceCode,
        authCookie: vtexAuthCookie,
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
