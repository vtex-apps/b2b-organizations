interface FilterStatement {
  subject: string
  verb: string
  object: Record<string, unknown>
}

interface AddressFormFields {
  [key: string]: {
    value: null | string | number | number[]
    valid?: boolean
    geolocationAutoCompleted?: boolean
    postalCodeAutoCompleted?: boolean
  }
}

interface Address {
  addressId: string
  addressType: string
  addressQuery: string
  postalCode: string
  country: string
  receiverName: string
  city: string
  state: string
  street: string
  number: string
  complement: string
  neighborhood: string
  geoCoordinates: number[]
  reference: string
  checked?: boolean
}

interface MessageDescriptor {
  id: string
  description?: string | Record<string, unknown>
  defaultMessage?: string
  values?: Record<string, unknown>
}

interface UserInput {
  name: string
  email: string
  orgId: string
  costId: string
  roleId: string
}

interface UserDetails {
  id: string
  roleId: string
  userId: string
  clId: string
  orgId: string
  costId: string
  name: string
  email: string
  canImpersonate: boolean
}

interface CustomField {
  name: string
  type: 'text' | 'dropdown'
  value?: string
  dropdownValues?: Array<{ label: string; value: string }>
  useOnRegistration?: boolean
}

interface CustomFieldSetting {
  name: string
  type: 'text' | 'dropdown'
}

interface Window {
  __RUNTIME__: any
}
