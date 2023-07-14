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
  Spinner,
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

import { organizationRequestMessages as messages } from './utils/messages'
import storageFactory from '../utils/storage'
import { getSession } from '../modules/session'
import { validateEmail, validatePhoneNumber } from '../modules/formValidators'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import GET_B2B_CUSTOM_FIELDS from '../graphql/getB2BCustomFields.graphql'
import IMPERSONATE_USER from '../graphql/impersonateUser.graphql'
import CustomFieldInputList from './CustomFieldInputList/CustomFieldInputList'

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

const CreateNewOrganizationRequest = (props: any) => {
  return (
    <Fragment>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variation="primary" {...props}>
          <FormattedMessage id="store/b2b-organizations.request-new-organization.submit-button.create-new-request" />
        </Button>
      </div>
    </Fragment>
  )
}

const RequestOrganizationForm: FC = () => {
  const { formatMessage, formatDate } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

  const { showToast } = useContext(ToastContext)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)
  const { data } = useQuery(GET_LOGISTICS, { ssr: false })
  const { data: existingRequestData, refetch, loading } = useQuery(
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

  const formStateModel = {
    organizationName: '',
    tradeName: '',
    firstName: '',
    lastName: '',
    email: '',
    defaultCostCenterName: '',
    phoneNumber: '',
    businessDocument: '',
    stateRegistration: '',
    isSubmitting: false,
    submitted: true,
  }

  const [formState, setFormState] = useState(formStateModel)

  const [hasProfile, setHasProfile] = useState(false)

  const [impersonateUser] = useMutation(IMPERSONATE_USER)

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

  const handleNewOrganizationRequest = () => {
    localStore.removeItem('b2b-organizations_orgRequestId')
    setFormState({
      ...formStateModel,
      submitted: false,
    })
    setAddressState(() => addValidation(getEmptyAddress(country)))
  }

  //! CUSTOM FIELDS
  const {
    data: defaultCustomFieldsData,
    loading: defaultCustomFieldsDataLoading,
  } = useQuery(GET_B2B_CUSTOM_FIELDS, {
    ssr: false,
  })

  const [orgCustomFieldsState, setOrgCustomFieldsState] = useState<
    CustomField[]
  >([])

  const [
    costCenterCustomFieldsState,
    setCostCenterCustomFieldsState,
  ] = useState<CustomField[]>([])

  useEffect(() => {
    if (defaultCustomFieldsDataLoading) return

    const organizationFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.organizationCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    const costCenterFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    setOrgCustomFieldsState(organizationFieldsToDisplay)
    setCostCenterCustomFieldsState(costCenterFieldsToDisplay)
  }, [defaultCustomFieldsData])

  //! CUSTOM FIELDS

  const handleImpersonation = () => {
    impersonateUser({
      variables: { userId: '' },
    })
      .then(result => {
        if (result?.data?.impersonateUser?.status === 'error') {
          console.error(
            'Impersonation error:',
            result.data.impersonateUser.message
          )
          toastMessage(messages.toastFailure)
        } else {
          window.location.reload()
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  const handleSubmit = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
      submitted: true,
    })

    const organizationRequest = {
      name: formState.organizationName,
      tradeName: formState.tradeName,
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
        phoneNumber: formState.phoneNumber,
        businessDocument: formState.businessDocument,
        customFields: costCenterCustomFieldsState,
        stateRegistration: formState.stateRegistration,
      },
      customFields: orgCustomFieldsState,
    }

    createOrganizationRequest({
      variables: {
        input: organizationRequest,
      },
    })
      .then(response => {
        const statusRequest = response.data.createOrganizationRequest.status

        if (statusRequest === 'approved') {
          toastMessage(messages.toastApproved)
          setFormState({
            ...formState,
            isSubmitting: false,
          })
        } else {
          requestId = response.data.createOrganizationRequest.id
          localStore.setItem('b2b-organizations_orgRequestId', requestId)
          toastMessage(messages.toastSuccess)
          refetch({ id: requestId }).then(res => {
            if (
              res.data?.getOrganizationRequestById.status !== 'pending' &&
              sessionResponse.namespaces?.profile?.isAuthenticated?.value ===
                'true'
            ) {
              handleImpersonation()
            }
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setFormState({
            ...formState,
            isSubmitting: false,
            submitted: true,
          })
        }
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastFailure)
        setFormState({
          ...formState,
          isSubmitting: false,
        })
      })
  }

  if (!data) return null

  const renderIfSubmitted =
    formState.submitted &&
    existingRequestData?.getOrganizationRequestById?.status ? (
      <PageBlock>
        {existingRequestData.getOrganizationRequestById.status ===
          'pending' && (
          <Fragment>
            <div className="mb5">
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
            </div>
            <CreateNewOrganizationRequest
              onClick={handleNewOrganizationRequest}
            />
          </Fragment>
        )}
        {existingRequestData.getOrganizationRequestById.status ===
          'approved' && (
          <Fragment>
            <div className="mb5">
              <Alert type="success">
                <FormattedMessage id="store/b2b-organizations.request-new-organization.approved-request" />
              </Alert>
            </div>
            <CreateNewOrganizationRequest
              onClick={handleNewOrganizationRequest}
            />
          </Fragment>
        )}
        {existingRequestData.getOrganizationRequestById.status ===
          'declined' && (
          <Fragment>
            <div className="mb5">
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
            </div>
            <CreateNewOrganizationRequest
              onClick={handleNewOrganizationRequest}
            />
          </Fragment>
        )}
      </PageBlock>
    ) : (
      <Fragment>
        <PageBlock>
          <div
            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
          >
            <Input
              autocomplete="off"
              size="large"
              label={translateMessage(messages.organizationName)}
              value={formState.organizationName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  organizationName: e.target.value,
                })
              }}
              required
            />
          </div>
          <div
            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
          >
            <Input
              autocomplete="off"
              size="large"
              label={translateMessage(messages.tradeName)}
              helpText={translateMessage(messages.tradeNameHelp)}
              value={formState.tradeName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  tradeName: e.target.value,
                })
              }}
            />
          </div>
          <CustomFieldInputList
            customFields={
              defaultCustomFieldsDataLoading ? null : orgCustomFieldsState
            }
            onChange={setOrgCustomFieldsState}
          />
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
              autocomplete="off"
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
            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
          >
            <Input
              autocomplete="off"
              size="large"
              label={translateMessage(messages.phoneNumber)}
              helpText={translateMessage(messages.phoneNumberHelp)}
              value={formState.phoneNumber}
              error={
                formState.phoneNumber &&
                !validatePhoneNumber(formState.phoneNumber)
              }
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  phoneNumber: e.target.value,
                })
              }}
            />
          </div>
          <div
            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
          >
            <Input
              autocomplete="off"
              size="large"
              label={translateMessage(messages.businessDocument)}
              helpText={translateMessage(messages.businessDocumentHelp)}
              value={formState.businessDocument}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  businessDocument: e.target.value,
                })
              }}
            />
          </div>
          <CustomFieldInputList
            customFields={
              defaultCustomFieldsDataLoading
                ? null
                : costCenterCustomFieldsState
            }
            onChange={setCostCenterCustomFieldsState}
          />
          <div
            className={`${handles.newOrganizationInput} mb5 flex flex-column`}
          >
            <Input
              autocomplete="off"
              size="large"
              label={translateMessage(messages.stateRegistration)}
              helpText={translateMessage(messages.stateRegistrationHelp)}
              value={formState.stateRegistration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormState({
                  ...formState,
                  stateRegistration: e.target.value,
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
              <div className={`no-wrap ${handles.newOrganizationButtonSubmit}`}>
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
                    !validateEmail(formState.email) ||
                    !isValidAddress(addressState) ||
                    (formState.phoneNumber &&
                      !validatePhoneNumber(formState.phoneNumber))
                  }
                >
                  <FormattedMessage id="store/b2b-organizations.request-new-organization.submit-button.label" />
                </Button>
              </div>
            </div>
          </div>
        </PageBlock>
      </Fragment>
    )

  const renderIfAuthenticated = !isAuthenticated ? (
    <PageBlock>
      <div>
        <FormattedMessage id="store/b2b-organizations.not-authenticated" />
      </div>
    </PageBlock>
  ) : (
    renderIfSubmitted
  )

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
        {loading ? (
          <span style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size={40} />
          </span>
        ) : (
          <Fragment>{renderIfAuthenticated}</Fragment>
        )}
      </Layout>
    </div>
  )
}

export default RequestOrganizationForm
