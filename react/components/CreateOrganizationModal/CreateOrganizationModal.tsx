import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { FormattedMessage, useIntl } from 'react-intl'
import { useToast } from '@vtex/admin-ui'
import { Button, Input, Modal } from 'vtex.styleguide'
import {
  AddressContainer,
  AddressForm,
  AddressRules,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'
import { useRuntime } from 'vtex.render-runtime'

import { getEmptyAddress, isValidAddress } from '../../utils/addresses'
import { validatePhoneNumber } from '../../modules/formValidators'
import { organizationMessages as messages } from '../../admin/utils/messages'
import GET_LOGISTICS from '../../graphql/getLogistics.graphql'
import CREATE_ORGANIZATION from '../../graphql/createOrganization.graphql'
import GET_B2B_CUSTOM_FIELDS from '../../graphql/getB2BCustomFields.graphql'
import {
  INITIAL_FETCH_LIST_OPTIONS,
  useOrganizationsList,
} from '../../organizations/hooks'
import CustomFieldInputList from '../CustomFieldInputList/CustomFieldInputList'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateOrganizationModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const { formatMessage } = useIntl()
  const {
    culture: { country },
  } = useRuntime()

  const showToast = useToast()

  const [loadingState, setLoadingState] = useState(false)

  const [newOrganizationName, setNewOrganizationName] = useState('')
  const [newCostCenterName, setNewCostCenterName] = useState('')
  const [newCostCenterPhoneNumber, setNewCostCenterPhoneNumber] = useState('')
  const [
    newCostCenterBusinessDocument,
    setNewCostCenterBusinessDocument,
  ] = useState('')

  const [
    newCostCenterStateRegistration,
    setNewCostCenterStateRegistration,
  ] = useState('')

  const [newCostCenterAddressState, setNewCostCenterAddressState] = useState(
    addValidation(getEmptyAddress(country))
  )

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })
  const [createOrganization] = useMutation(CREATE_ORGANIZATION)
  const { refetch } = useOrganizationsList()

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
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

  const resetNewOrganizationForm = () => {
    setNewOrganizationName('')
    setNewCostCenterName('')
    setNewCostCenterPhoneNumber('')
    setNewCostCenterBusinessDocument('')
    setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
  }

  const handleAddNewOrganization = () => {
    setLoadingState(true)
    const newAddress = {
      addressId: newCostCenterAddressState.addressId.value,
      addressType: newCostCenterAddressState.addressType.value,
      city: newCostCenterAddressState.city.value,
      complement: newCostCenterAddressState.complement.value,
      country: newCostCenterAddressState.country.value,
      receiverName: newCostCenterAddressState.receiverName.value,
      geoCoordinates: newCostCenterAddressState.geoCoordinates.value,
      neighborhood: newCostCenterAddressState.neighborhood.value,
      number: newCostCenterAddressState.number.value,
      postalCode: newCostCenterAddressState.postalCode.value,
      reference: newCostCenterAddressState.reference.value,
      state: newCostCenterAddressState.state.value,
      street: newCostCenterAddressState.street.value,
      addressQuery: newCostCenterAddressState.addressQuery.value,
    }

    const variables = {
      input: {
        name: newOrganizationName,
        customFields: orgCustomFieldsState,
        defaultCostCenter: {
          name: newCostCenterName,
          address: newAddress,
          phoneNumber: newCostCenterPhoneNumber,
          businessDocument: newCostCenterBusinessDocument,
          customFields: costCenterCustomFieldsState,
          stateRegistration: newCostCenterStateRegistration,
        },
      },
    }

    createOrganization({ variables })
      .then(() => {
        onOpenChange(false)
        setLoadingState(false)
        resetNewOrganizationForm()
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastAddOrgSuccess),
        })
        refetch(INITIAL_FETCH_LIST_OPTIONS)
      })
      .catch(error => {
        onOpenChange(false)
        setLoadingState(false)
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastAddOrgFailure),
        })
      })
  }

  const handleNewCostCenterAddressChange = (
    changedAddress: AddressFormFields
  ) => {
    const curAddress = newCostCenterAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewCostCenterAddressState(newAddress)
  }

  const handleCloseModal = () => {
    onOpenChange(false)
    resetNewOrganizationForm()
  }

  return (
    <>
      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModal()}
                disabled={loadingState}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button
                variation="primary"
                onClick={() => handleAddNewOrganization()}
                isLoading={loadingState}
                disabled={
                  !newOrganizationName ||
                  !newCostCenterName ||
                  !isValidAddress(newCostCenterAddressState) ||
                  (newCostCenterPhoneNumber &&
                    !validatePhoneNumber(newCostCenterPhoneNumber))
                }
              >
                {formatMessage(messages.add)}
              </Button>
            </span>
          </div>
        }
        isOpen={open}
        onClose={() => handleCloseModal()}
        closeOnOverlayClick={false}
      >
        <p className="f3 f1-ns fw3 gray">
          <FormattedMessage id="admin/b2b-organizations.organizations-admin.add-organization" />
        </p>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.organizationName)}
            value={newOrganizationName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewOrganizationName(e.target.value)
            }}
            required
          />
        </div>
        <CustomFieldInputList
          customFields={
            defaultCustomFieldsDataLoading ? null : orgCustomFieldsState
          }
          onChange={setOrgCustomFieldsState}
        />
        <div className="w-100 mv6">
          <FormattedMessage id="admin/b2b-organizations.organizations-admin.add-organization.default-costCenter.helpText" />
        </div>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.defaultCostCenterName)}
            value={newCostCenterName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterName(e.target.value)
            }}
            required
          />
        </div>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.phoneNumber)}
            value={newCostCenterPhoneNumber}
            error={
              newCostCenterPhoneNumber &&
              !validatePhoneNumber(newCostCenterPhoneNumber)
            }
            helpText={formatMessage(messages.phoneNumberHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterPhoneNumber(e.target.value)
            }}
          />
        </div>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.businessDocument)}
            value={newCostCenterBusinessDocument}
            helpText={formatMessage(messages.businessDocumentHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterBusinessDocument(e.target.value)
            }}
          />
        </div>
        <CustomFieldInputList
          customFields={
            defaultCustomFieldsDataLoading ? null : costCenterCustomFieldsState
          }
          onChange={setCostCenterCustomFieldsState}
        />
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.stateRegistration)}
            value={newCostCenterStateRegistration}
            helpText={formatMessage(messages.stateRegistrationHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterStateRegistration(e.target.value)
            }}
          />
        </div>
        <AddressRules
          country={newCostCenterAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newCostCenterAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewCostCenterAddressChange}
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
      </Modal>
    </>
  )
}

export default CreateOrganizationModal
