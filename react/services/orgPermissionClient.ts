import axios from 'axios'

import { B2B_LM_PRODUCT_CODE } from '../utils/constants'

const LICENSE_MANAGER_BASE_URL = `/api/license-manager/pvt/accounts/`

const orgPermissionClient = axios.create()

orgPermissionClient.defaults.baseURL = LICENSE_MANAGER_BASE_URL
orgPermissionClient.defaults.withCredentials = true

const licenseManagerClient = axios.create()

licenseManagerClient.defaults.baseURL = '/api/license-manager'
licenseManagerClient.defaults.withCredentials = true

interface CheckUserAdminPermissionParams {
  account: string
  userEmail: string
  resourceCode: string
}

interface AdminRole {
  id?: number | string
  name?: string
}

export const parseGrantedResponse = (data: unknown): boolean => {
  if (typeof data === 'boolean') {
    return data
  }

  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>

    if (typeof payload.granted === 'boolean') {
      return payload.granted
    }

    if (typeof payload.data === 'boolean') {
      return payload.data
    }
  }

  return false
}

const isOwnerAdminRole = (role: AdminRole): boolean => {
  const name = role.name?.toLowerCase() ?? ''

  return name.includes('owner') || name.includes('admin super')
}

export const checkUserIsAdminSuper = async (userId: string): Promise<boolean> => {
  const response = await licenseManagerClient.get<
    AdminRole[] | { roles?: AdminRole[] }
  >(`/users/${encodeURIComponent(userId)}/roles`)

  const roles = Array.isArray(response.data)
    ? response.data
    : response.data?.roles ?? []

  return roles.some(isOwnerAdminRole)
}

const checkUserAdminPermission = async ({
  account,
  userEmail,
  resourceCode,
}: CheckUserAdminPermissionParams) => {
  const checkOrgPermission = await orgPermissionClient.get(
    `${account}/products/${B2B_LM_PRODUCT_CODE}/logins/${userEmail}/resources/${resourceCode}/granted`
  )

  return parseGrantedResponse(checkOrgPermission.data)
}

export default checkUserAdminPermission
