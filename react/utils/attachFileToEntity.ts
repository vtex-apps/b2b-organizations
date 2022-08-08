const attachFileToEntity = async (acronym: String, id: string, field: string, file: File) => {
  try {
    const form = new FormData();
    form.append('file', file);

    const options = {
      method: 'POST',
      body: form
    };


    const request = await fetch(`/api/dataentities/${acronym}/documents/${id}/${field}/attachments`, options)
    const acceptedStatus = [200, 201, 204]
    if(!acceptedStatus.includes(request.status)) throw new Error('')

    return request.json()
  } catch(__) {
    return false
  }
}

export default attachFileToEntity
