import useSWR from 'swr'
import { useFullSession } from 'vtex.session-client'

import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import { checkUserAdminPermission } from '../services'

interface UseOrgPermissionParams {
  resourceCode: 'buyer_organization_edit' | 'buyer_organization_view'
}

export function useOrgPermission({ resourceCode }: UseOrgPermissionParams) {
  const session = useSessionResponse() as Session
  const fullSession = useFullSession({
    variables: {
      items: ['authentication.adminUserEmail'],
    },
  })

  const account = session?.namespaces?.account?.accountName?.value
  const userEmail =
    fullSession.data?.session?.namespaces?.authentication?.adminUserEmail?.value

  const { data } = useSWR<{ data: boolean }>(
    userEmail && account ? '/granted' : null,
    () =>
      checkUserAdminPermission({
        account,
        userEmail: 'josmar.junior+semeditview@cubos.io',
        resourceCode,
      })
  )

  return data
}
