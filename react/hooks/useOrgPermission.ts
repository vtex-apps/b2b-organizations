import useSWR from 'swr'
import { useQuery } from 'react-apollo'
import { useFullSession } from 'vtex.session-client'

import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import {
  checkUserAdminPermission,
  checkUserIsAdminSuper,
} from '../services'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
  /** Admin: License Manager `granted`. Storefront: `checkUserPermission` (storefront-permissions). */
  authContext?: 'admin' | 'storefront'
}

const ADMIN_SESSION_ITEMS = [
  'authentication.adminUserEmail',
  'authentication.adminUserId',
  'account.accountName',
] as const

/** Permissions that imply buyer-organization *edit* actions on the storefront (aligns with LM `buyer_organization_edit` usage in UI). */
const STOREFRONT_ORG_EDIT_PERMISSIONS: string[] = [
  'manage-organization',
  'create-cost-center-organization',
  'add-users-organization',
  'remove-users-organization',
  'add-sales-users-all',
  'add-sales-users-current',
]

/** Any B2B storefront feature from org settings — used for `buyer_organization_view`-style gating on the storefront. */
const STOREFRONT_ORG_VIEW_PERMISSIONS: string[] = [
  ...STOREFRONT_ORG_EDIT_PERMISSIONS,
  'remove-sales-users-all',
  'impersonate-users-costcenter',
  'impersonate-users-organization',
  'impersonate-users-all',
]

function hasStorefrontPermissionForResource(
  permissions: string[] | undefined,
  resourceCode: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
) {
  const list =
    resourceCode === 'buyer_organization_edit'
      ? STOREFRONT_ORG_EDIT_PERMISSIONS
      : STOREFRONT_ORG_VIEW_PERMISSIONS

  return (permissions ?? []).some(p => list.includes(p))
}

export function useOrgPermission({
  resourceCode = ORGANIZATION_VIEW,
  authContext = 'admin',
}: UseOrgPermissionParams) {
  const isStorefront = authContext === 'storefront'

  const {
    data: storefrontPermData,
    loading: storefrontPermLoading,
    error: storefrontPermError,
  } = useQuery(GET_PERMISSIONS, {
    ssr: false,
    skip: !isStorefront,
  })

  const fullSession = useFullSession({
    variables: {
      items: isStorefront
        ? ['account.accountName']
        : [...ADMIN_SESSION_ITEMS],
    },
  })

  const sessionLoading = fullSession.loading

  const account =
    fullSession.data?.session?.namespaces?.account?.accountName?.value

  const adminUserEmail =
    fullSession.data?.session?.namespaces?.authentication?.adminUserEmail
      ?.value

  const adminUserId =
    fullSession.data?.session?.namespaces?.authentication?.adminUserId?.value

  const shouldFetchGranted =
    !isStorefront && Boolean(adminUserEmail && account)

  const {
    data: grantedData,
    isLoading: grantedLoading,
    isValidating,
    error,
  } = useSWR(
    shouldFetchGranted ? `/granted?${resourceCode}` : null,
    () =>
      checkUserAdminPermission({
        account: account as string,
        userEmail: adminUserEmail as string,
        resourceCode,
      }),
    {
      dedupingInterval: 0,
    }
  )

  const shouldCheckAdminSuper =
    shouldFetchGranted && grantedData === false && Boolean(adminUserId)

  const {
    data: isAdminSuper,
    isLoading: adminSuperLoading,
  } = useSWR(
    shouldCheckAdminSuper
      ? `/admin-super/${adminUserId}?${resourceCode}`
      : null,
    () => checkUserIsAdminSuper(adminUserId as string),
    {
      dedupingInterval: 60_000,
    }
  )

  if (isStorefront) {
    const permissions =
      storefrontPermData?.checkUserPermission?.permissions ?? undefined

    const allowed = hasStorefrontPermissionForResource(
      permissions,
      resourceCode
    )

    return {
      data: storefrontPermLoading ? undefined : allowed,
      error: storefrontPermError,
      isLoading: storefrontPermLoading,
      isValidating: false,
    }
  }

  const isLoading =
    sessionLoading || grantedLoading || (shouldCheckAdminSuper && adminSuperLoading)

  let data: boolean | undefined

  if (isLoading) {
    data = undefined
  } else if (grantedData === true || isAdminSuper === true) {
    data = true
  } else if (grantedData === false && (!shouldCheckAdminSuper || isAdminSuper === false)) {
    data = false
  } else {
    data = grantedData
  }

  return {
    data,
    error,
    isLoading,
    isValidating,
  }
}
