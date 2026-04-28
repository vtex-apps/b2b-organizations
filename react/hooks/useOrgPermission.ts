import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import { checkUserAdminPermission } from '../services'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
  authContext?: 'admin' | 'storefront'
}

const VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX = 'VtexIdclientAutCookie'

const STOREFRONT_SESSION_ITEMS_BASE = [
  'authentication.adminUserEmail',
  'authentication.storeUserEmail',
  'profile.email',
  'account.accountName',
] as const

export function useOrgPermission({
  resourceCode = ORGANIZATION_VIEW,
  authContext = 'admin',
}: UseOrgPermissionParams) {
  const [accountForSessionItems, setAccountForSessionItems] = useState<
    string | undefined
  >()

  const isStorefrontPublicSession = authContext === 'storefront'

  const sessionItems = useMemo(() => {
    if (!isStorefrontPublicSession) {
      return [
        'authentication.adminUserEmail',
        'account.accountName',
      ] as const
    }

    if (!accountForSessionItems) {
      return [...STOREFRONT_SESSION_ITEMS_BASE]
    }

    return [
      ...STOREFRONT_SESSION_ITEMS_BASE,
      `cookie.${VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX}_${accountForSessionItems}`,
    ]
  }, [accountForSessionItems, isStorefrontPublicSession])

  const fullSession = useFullSession({
    variables: {
      items: [...sessionItems],
    },
  })

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  useEffect(() => {
    if (
      !isStorefrontPublicSession ||
      !(account && account !== accountForSessionItems)
    ) {
      return
    }

    setAccountForSessionItems(account)
  }, [account, accountForSessionItems, isStorefrontPublicSession])

  const namespaces = fullSession.data?.session?.namespaces

  const adminUserEmail =
    namespaces?.authentication?.adminUserEmail?.value
  const storeUserEmail =
    namespaces?.authentication?.storeUserEmail?.value
  const profileEmail = namespaces?.profile?.email?.value

  const userEmail = isStorefrontPublicSession
    ? adminUserEmail || storeUserEmail || profileEmail
    : adminUserEmail

  const vtexAuthCookie =
    isStorefrontPublicSession && account
      ? namespaces?.cookie?.[`${VTEX_ID_CLIENT_AUT_COOKIE_KEY_PREFIX}_${account}`]
          ?.value
      : undefined

  const shouldFetchGranted = isStorefrontPublicSession
    ? userEmail && account && vtexAuthCookie
    : userEmail && account

  const { data, isLoading, isValidating, error } = useSWR<{ data: boolean }>(
    shouldFetchGranted ? `/granted?${resourceCode}` : null,
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
