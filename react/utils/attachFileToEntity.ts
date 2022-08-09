async function attachFileToEntity(AcronymId: any, field: string, file: File) {
  try {
    const form = new FormData()

    form.append('file', file)

    const options = {
      method: 'POST',
      body: form,
    }

    const acceptedStatus = [200, 201, 204]

    const request = await fetch(
      `/api/dataentities/${AcronymId.acronym}/documents/${AcronymId.id}/${field}/attachments`,
      options
    )

    if (!acceptedStatus.includes(request.status)) throw new Error('')

    return request.json()
  } catch (__) {
    return false
  }
}

export default attachFileToEntity
