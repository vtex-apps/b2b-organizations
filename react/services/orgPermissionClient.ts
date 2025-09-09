import axios from 'axios'

const LICENSE_MANAGER_BASE_URL = `/api/license-manager/pvt/accounts/`

const orgPermissionClient = axios.create()

orgPermissionClient.defaults.baseURL = LICENSE_MANAGER_BASE_URL

interface CheckUserAdminPermissionParams {
  account: string
  userEmail: string
  resourceCode: string
}
const productCode = '97'

const checkUserAdminPermission = async ({
  account,
  userEmail,
  resourceCode,
}: CheckUserAdminPermissionParams) => {
  const checkOrgPermission = await orgPermissionClient.get(
    `${account}/products/${productCode}/logins/${userEmail}/resources/${resourceCode}/granted`
  )

  return checkOrgPermission.data
}

export default checkUserAdminPermission
