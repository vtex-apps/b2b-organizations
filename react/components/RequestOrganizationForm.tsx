import type { FC } from 'react'
import React, { useState, useContext, useEffect, Fragment } from 'react'
import {
  Input,
  Button,
  ToastContext,
  Layout,
  PageHeader,
  PageBlock,
} from 'vtex.styleguide'
import {
  AddressRules,
  AddressContainer,
  PostalCodeGetter,
  CountrySelector,
  AddressForm,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'
import { useCssHandles } from 'vtex.css-handles'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import 'vtex.country-codes/locales'

import { getSession } from '../modules/session'
// import storageFactory from '../utils/storage'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

// const localStore = storageFactory(() => localStorage)

const useSessionResponse = () => {
  const [session, setSession] = useState<any>()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then((sessionResponse) => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}

// let isAuthenticated =
//   JSON.parse(String(localStore.getItem('orderquote_isAuthenticated'))) ?? false
const isAuthenticated = true

const CSS_HANDLES = [
  'newOrganizationContainer',
  'newOrganizationInput',
  'newOrganizationAddressForm',
  'newOrganizationButtonsContainer',
  'newOrganizationButtonSubmit',
] as const

let gguid = 1

function getGGUID() {
  return (gguid++ * new Date().getTime() * -1).toString()
}

const getEmptyAddress = (country: string) => {
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

const RequestOrganizationForm: FC = () => {
  const { formatMessage } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

  const { showToast } = useContext(ToastContext)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)
  const { data } = useQuery(GET_LOGISTICS, { ssr: false })
  const [createOrganizationRequest] = useMutation(CREATE_ORGANIZATION_REQUEST)

  const [addressState, setAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const [formState, setFormState] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
    email: '',
    defaultCostCenterName: '',
    isSubmitting: false,
  })

  const [hasProfile, setHasProfile] = useState(false)

  // if (sessionResponse) {
  //   isAuthenticated =
  //     sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

  //   localStore.setItem(
  //     'orderquote_isAuthenticated',
  //     JSON.stringify(isAuthenticated)
  //   )
  // }

  useEffect(() => {
    if (!sessionResponse || hasProfile) return

    if (sessionResponse.namespaces?.profile?.isAuthenticated?.value) {
      setFormState({
        ...formState,
        firstName: sessionResponse.namespaces.profile.firstName?.value,
        lastName: sessionResponse.namespaces.profile.lastName?.value,
        email: sessionResponse.namespaces.profile.email?.value,
      })
      setHasProfile(true)
    }
  }, [sessionResponse])

  const translateMessage = (message: MessageDescriptor) => {
    return formatMessage(message)
  }

  const toastMessage = (messsageKey: string) => {
    const message = translateMessage({
      id: messsageKey,
    })

    const action = undefined

    showToast({ message, action })
  }

  const translateCountries = () => {
    const { shipsTo = [] } = data?.logistics

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const handleAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = addressState

    const newAddress = { ...curAddress, ...changedAddress }

    setAddressState(newAddress)
  }

  const isValidAddress = (address: AddressFormFields) => {
    let hasInvalidField = false

    for (const field in address) {
      if (address[field].valid === false) {
        hasInvalidField = true
      }
    }

    return !hasInvalidField
  }

  const handleSubmit = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
    })

    const organizationRequest = {
      name: formState.organizationName,
      b2bCustomerAdmin: {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
      },
      defaultCostCenter: {
        name: formState.defaultCostCenterName,
        address: {
          addressId: addressState.addressId.value,
          addressType: addressState.addressType.value,
          city: addressState.city.value,
          complement: addressState.complement.value,
          country: addressState.country.value,
          receiverName: addressState.receiverName.value,
          geoCoordinates: addressState.geoCoordinates.value,
          neighborhood: addressState.neighborhood.value,
          number: addressState.number.value,
          postalCode: addressState.postalCode.value,
          reference: addressState.reference.value,
          state: addressState.state.value,
          street: addressState.street.value,
          addressQuery: addressState.addressQuery.value,
        },
      },
    }

    createOrganizationRequest({
      variables: {
        input: organizationRequest,
      },
    })
      .then(() => {
        toastMessage(
          'store/b2b-organizations.request-new-organization.submit.toast-success'
        )
      })
      .catch((error) => {
        console.error(error)
        toastMessage(
          'store/b2b-organizations.request-new-organization.submit.toast-failure'
        )
      })

    setFormState({
      ...formState,
      isSubmitting: false,
    })
  }

  if (!data) return null

  return (
    <div className={`${handles.newOrganizationContainer} pv6 ph4 mw9 center`}>
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={translateMessage({
              id: 'store/b2b-organizations.request-new-organization.title',
            })}
            subtitle={translateMessage({
              id: 'store/b2b-organizations.request-new-organization.helpText',
            })}
          />
        }
      >
        {!isAuthenticated ? (
          <PageBlock>
            <div>
              <FormattedMessage id="store/b2b-organizations.not-authenticated" />
            </div>
          </PageBlock>
        ) : (
          <Fragment>
            <PageBlock>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.organization-name.label',
                  })}
                  value={formState.organizationName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      organizationName: e.target.value,
                    })
                  }}
                />
              </div>
            </PageBlock>
            <PageBlock
              variation="full"
              title={translateMessage({
                id: 'store/b2b-organizations.request-new-organization.b2b-customer-admin.title',
              })}
              subtitle={translateMessage({
                id: 'store/b2b-organizations.request-new-organization.b2b-customer-admin.helpText',
              })}
            >
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.first-name.label',
                  })}
                  value={formState.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      firstName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.last-name.label',
                  })}
                  value={formState.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      lastName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.email.label',
                  })}
                  value={formState.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      email: e.target.value,
                    })
                  }}
                />
              </div>
            </PageBlock>
            <PageBlock
              variation="full"
              title={translateMessage({
                id: 'store/b2b-organizations.request-new-organization.default-cost-center.title',
              })}
              subtitle={translateMessage({
                id: 'store/b2b-organizations.request-new-organization.default-cost-center.helpText',
              })}
            >
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-name.label',
                  })}
                  value={formState.defaultCostCenterName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationAddressForm} mb5 flex flex-column`}
              >
                <AddressRules
                  country={addressState?.country?.value}
                  shouldUseIOFetching
                  useGeolocation={false}
                >
                  <AddressContainer
                    address={addressState}
                    Input={StyleguideInput}
                    onChangeAddress={handleAddressChange}
                    autoCompletePostalCode
                  >
                    <CountrySelector shipsTo={translateCountries()} />

                    <PostalCodeGetter />

                    <AddressForm
                      Input={StyleguideInput}
                      omitAutoCompletedFields={false}
                      omitPostalCodeFields
                      // notApplicableLabel={formatMessage({
                      //   id: 'addresses.notApplicable',
                      // })}
                    />
                  </AddressContainer>
                </AddressRules>
              </div>
              <div
                className={`${handles.newOrganizationButtonsContainer} mb5 flex flex-column items-end pt6`}
              >
                <div className="flex justify-content flex-row">
                  <div
                    className={`no-wrap ${handles.newOrganizationButtonSubmit}`}
                  >
                    <Button
                      variation="primary"
                      isLoading={formState.isSubmitting}
                      onClick={() => {
                        handleSubmit()
                      }}
                      disabled={
                        !formState.organizationName ||
                        !formState.defaultCostCenterName ||
                        !formState.firstName ||
                        !formState.lastName ||
                        !formState.email ||
                        !formState.email.includes('@') ||
                        !formState.email.includes('.') ||
                        !isValidAddress(addressState)
                      }
                    >
                      <FormattedMessage id="store/b2b-organizations.request-new-organization.submit-button.label" />
                    </Button>
                  </div>
                </div>
              </div>
            </PageBlock>
          </Fragment>
        )}
      </Layout>
    </div>
  )
}

export default RequestOrganizationForm
