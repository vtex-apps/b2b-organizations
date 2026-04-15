import axios from 'axios'

import { B2B_LM_PRODUCT_CODE } from '../utils/constants'

const LICENSE_MANAGER_BASE_URL = `/api/license-manager/pvt/accounts/`
const VTEX_ID_CLIENT_AUT_COOKIE_PREFIX = 'VtexIdclientAutCookie'

const orgPermissionClient = axios.create()

orgPermissionClient.defaults.baseURL = LICENSE_MANAGER_BASE_URL
orgPermissionClient.defaults.withCredentials = true

interface CheckUserAdminPermissionParams {
  account: string
  userEmail: string
  resourceCode: string
  authCookie: string
}

const checkUserAdminPermission = async ({
  account,
  userEmail,
  resourceCode,
  authCookie,
}: CheckUserAdminPermissionParams) => {
  if (authCookie) {
    orgPermissionClient.defaults.headers.common[
      VTEX_ID_CLIENT_AUT_COOKIE_PREFIX
    ] = authCookie
  } else {
    delete orgPermissionClient.defaults.headers.common[
      VTEX_ID_CLIENT_AUT_COOKIE_PREFIX
    ]
  }

  const checkOrgPermission = await orgPermissionClient.get(
    `${account}/products/${B2B_LM_PRODUCT_CODE}/logins/${userEmail}/resources/${resourceCode}/granted`
  )

  return checkOrgPermission.data
}

export default checkUserAdminPermission
