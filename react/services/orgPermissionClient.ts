import axios from 'axios'

import { B2B_LM_PRODUCT_CODE } from '../utils/constants'

const LICENSE_MANAGER_BASE_URL = `/api/license-manager/pvt/accounts/`

const orgPermissionClient = axios.create()

orgPermissionClient.defaults.baseURL = LICENSE_MANAGER_BASE_URL

interface CheckUserAdminPermissionParams {
  account: string
  userEmail: string
  resourceCode: string
}

const checkUserAdminPermission = async ({
  account,
  userEmail,
  resourceCode,
}: CheckUserAdminPermissionParams) => {
  const checkOrgPermission = await orgPermissionClient.get(
    `${account}/products/${B2B_LM_PRODUCT_CODE}/logins/${userEmail}/resources/${resourceCode}/granted`
  )

  return checkOrgPermission.data
}

export default checkUserAdminPermission
