import axios from 'axios'

export const LICENSE_MANAGER_BASE_URL = `/api/license-manager/pvt/accounts/`

const orgPermissionClient = axios.create()

orgPermissionClient.defaults.baseURL = LICENSE_MANAGER_BASE_URL

export const B2B_LM_PRODUCT_CODE = '97'

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
  const productCode = B2B_LM_PRODUCT_CODE

  const checkOrgPermission = await orgPermissionClient.get(
    `${account}/products/${productCode}/logins/${userEmail}/resources/${resourceCode}/granted`
  )

  return checkOrgPermission.data
}

export default checkUserAdminPermission
