let gguid = 1

function getGGUID() {
  return (gguid++ * new Date().getTime() * -1).toString()
}

export const getEmptyAddress = (country: string) => {
  return {
    addressId: getGGUID(),
    addressType: 'commercial',
    city: null,
    complement: null,
    country,
    receiverName: '',
    geoCoordinates: [],
    neighborhood: null,
    number: null,
    postalCode: null,
    reference: null,
    state: null,
    street: null,
    addressQuery: null,
  }
}

export const isValidAddress = (address: AddressFormFields) => {
  // check for empty address
  if (!address.street.value || !address.receiverName.value) return false

  for (const field in address) {
    if (address[field].valid === false) {
      return false
    }
  }

  return true
}
