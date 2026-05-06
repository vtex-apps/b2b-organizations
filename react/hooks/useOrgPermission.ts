import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface UseOrgPermissionParams {
  resourceCode?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
  authContext?: 'admin' | 'storefront'
}

export function useOrgPermission(_?: UseOrgPermissionParams) {
  return {
    data: true as const,
    error: undefined,
    isLoading: false,
    isValidating: false,
  }
}
