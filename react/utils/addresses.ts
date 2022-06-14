const hashCode = function hash(arg: null | string | number | number[]) {
  const str = arg === null ? '' : arg.toString()

  if (str.length === 0) {
    return 0
  }

  return str.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
}

export const setGUID = (address: AddressFormFields) => {
  return (
    hashCode(address.street.value) +
    hashCode(address.complement.value) +
    hashCode(address.city.value) +
    hashCode(address.state.value)
  ).toString()
}

export const getEmptyAddress = (country: string) => {
  return {
    addressId: '0',
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
