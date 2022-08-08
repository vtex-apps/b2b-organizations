import { masterData, types } from "../config/masterdata"

type createOrganizationDataType = {
  name: string,
  cnpj: string,
  phone: string,
  ie: string,
  icms: string,
  area: string,
  areaOthers: string
}

const createOrganization = async (data: createOrganizationDataType) => {
  try {

    const url = `/api/dataentities/${masterData[types.ORGANIZATION].acronym}/documents`
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }

    const request = await fetch(url, options)
    const acceptedStatus = [200, 201, 204]
    if(!acceptedStatus.includes(request.status)) throw new Error('')

    return request.json()

  } catch(__) {
    return
  }
}

export default createOrganization
