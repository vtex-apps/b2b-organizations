import type { FC } from 'react'
import React, { useState, useContext, useEffect, Fragment } from 'react'
import {
  Input,
  Button,
  ToastContext,
  Layout,
  PageHeader,
  PageBlock,
  Alert,
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
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import 'vtex.country-codes/locales'

import storageFactory from '../utils/storage'
import { getSession } from '../modules/session'
import { getEmptyAddress } from '../utils/addresses'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

const localStore = storageFactory(() => localStorage)
let requestId = localStore.getItem('b2b-organizations_orgRequestId') ?? ''

const useSessionResponse = () => {
  const [session, setSession] = useState<any>()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then(sessionResponse => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}

const isAuthenticated = true

const CSS_HANDLES = [
  'newOrganizationContainer',
  'newOrganizationInput',
  'newOrganizationAddressForm',
  'newOrganizationButtonsContainer',
  'newOrganizationButtonSubmit',
] as const

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  toastSuccess: {
    id: `${storePrefix}request-new-organization.submit.toast-success`,
  },
  toastFailure: {
    id: `${storePrefix}request-new-organization.submit.toast-failure`,
  },
  pageTitle: {
    id: `${storePrefix}request-new-organization.title`,
  },
  helpText: {
    id: `${storePrefix}request-new-organization.helpText`,
  },
  organizationName: {
    id: `${storePrefix}request-new-organization.organization-name.label`,
  },
  b2bCustomerAdmin: {
    id: `${storePrefix}request-new-organization.b2b-customer-admin.title`,
  },
  b2bCustomerAdminHelpText: {
    id: `${storePrefix}request-new-organization.b2b-customer-admin.helpText`,
  },
  firstName: {
    id: `${storePrefix}request-new-organization.first-name.label`,
  },
  lastName: {
    id: `${storePrefix}request-new-organization.last-name.label`,
  },
  email: {
    id: `${storePrefix}request-new-organization.email.label`,
  },
  defaultCostCenter: {
    id: `${storePrefix}request-new-organization.default-cost-center.title`,
  },
  defaultCostCenterHelpText: {
    id: `${storePrefix}request-new-organization.default-cost-center.helpText`,
  },
  defaultCostCenterName: {
    id: `${storePrefix}request-new-organization.default-cost-center-name.label`,
  },
})

const RequestOrganizationForm: FC = () => {
  const { formatMessage, formatDate } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

  const { showToast } = useContext(ToastContext)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)
  const { data } = useQuery(GET_LOGISTICS, { ssr: false })
  const { data: existingRequestData, refetch } = useQuery(
    GET_ORGANIZATION_REQUEST,
    {
      variables: { id: requestId },
      skip: !requestId,
    }
  )

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

  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = translateMessage(message)
    const action = undefined

    showToast({ message: translatedMessage, action })
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
      .then(response => {
        requestId = response.data.createOrganizationRequest.id
        localStore.setItem('b2b-organizations_orgRequestId', requestId)
        toastMessage(messages.toastSuccess)
        refetch({ id: requestId })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastFailure)
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
            title={translateMessage(messages.pageTitle)}
            subtitle={translateMessage(messages.helpText)}
          />
        }
      >
        {!isAuthenticated ? (
          <PageBlock>
            <div>
              <FormattedMessage id="store/b2b-organizations.not-authenticated" />
            </div>
          </PageBlock>
        ) : existingRequestData?.getOrganizationRequestById?.status ? (
          <PageBlock>
            {existingRequestData.getOrganizationRequestById.status ===
              'pending' && (
              <Alert type="warning">
                <FormattedMessage
                  id="store/b2b-organizations.request-new-organization.pending-request"
                  values={{
                    created: formatDate(
                      existingRequestData.getOrganizationRequestById.created,
                      {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                      }
                    ),
                  }}
                />
              </Alert>
            )}
            {existingRequestData.getOrganizationRequestById.status ===
              'approved' && (
              <Alert type="success">
                <FormattedMessage id="store/b2b-organizations.request-new-organization.approved-request" />
              </Alert>
            )}
            {existingRequestData.getOrganizationRequestById.status ===
              'declined' && (
              <Alert type="error">
                <FormattedMessage
                  id="store/b2b-organizations.request-new-organization.declined-request"
                  values={{
                    created: formatDate(
                      existingRequestData.getOrganizationRequestById.created,
                      {
                        day: 'numeric',
                        month: 'numeric',
                        year: 'numeric',
                      }
                    ),
                  }}
                />
              </Alert>
            )}
          </PageBlock>
        ) : (
          <Fragment>
            <PageBlock>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.organizationName)}
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
              title={translateMessage(messages.b2bCustomerAdmin)}
              subtitle={translateMessage(messages.b2bCustomerAdminHelpText)}
            >
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.firstName)}
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
                  label={translateMessage(messages.lastName)}
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
                  label={translateMessage(messages.email)}
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
              title={translateMessage(messages.defaultCostCenter)}
              subtitle={translateMessage(messages.defaultCostCenterHelpText)}
            >
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage(messages.defaultCostCenterName)}
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
