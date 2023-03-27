import React, { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { Modal, Input, Button, Spinner } from 'vtex.styleguide'
import { useIntl, FormattedMessage } from 'react-intl'
import { useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import {
  AddressRules,
  AddressForm,
  AddressContainer,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'
import 'vtex.country-codes/locales'
import { useCssHandles } from 'vtex.css-handles'

import { costCenterMessages as messages } from './utils/messages'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import { validatePhoneNumber } from '../modules/formValidators'
import GET_B2B_CUSTOM_FIELDS from '../graphql/getB2BCustomFields.graphql'
import CustomFieldInput from '../admin/OrganizationDetailsCustomField'

interface Props {
  loading: boolean
  isOpen: boolean
  handleAddNewCostCenter: ({
    name,
    address,
    phoneNumber,
    businessDocument,
    customFields,
  }: {
    name: string
    address: AddressFormFields
    phoneNumber: string
    businessDocument: string
    customFields: CustomField[]
  }) => void
  handleCloseModal: () => void
}

const CSS_HANDLES = ['businessDocument'] as const

const NewCostCenterModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  handleAddNewCostCenter,
  handleCloseModal,
}) => {
  const {
    culture: { country },
  } = useRuntime()

  const { formatMessage } = useIntl()
  const [newCostCenterName, setNewCostCenterName] = useState('')
  const [newCostCenterPhoneNumber, setNewCostCenterPhoneNumber] = useState('')
  const [
    newCostCenterBusinessDocument,
    setNewCostCenterBusinessDocument,
  ] = useState('')

  const handles = useCssHandles(CSS_HANDLES)

  const [newCostCenterAddressState, setNewCostCenterAddressState] = useState(
    addValidation(getEmptyAddress(country))
  )

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const handleNewCostCenterAddressChange = (
    changedAddress: AddressFormFields
  ) => {
    const curAddress = newCostCenterAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewCostCenterAddressState(newAddress)
  }

  //! CUSTOM FIELDS
  const {
    data: defaultCustomFieldsData,
    loading: defaultCustomFieldsDataLoading,
  } = useQuery(GET_B2B_CUSTOM_FIELDS, {
    ssr: false,
  })

  const [
    costCenterCustomFieldsState,
    setCostCenterCustomFieldsState,
  ] = useState<CustomField[]>([])

  useEffect(() => {
    if (defaultCustomFieldsDataLoading) return

    const costCenterFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    setCostCenterCustomFieldsState(costCenterFieldsToDisplay)
  }, [defaultCustomFieldsData])

  const handleCostCenterCustomFieldsUpdate = (
    index: number,
    customField: CustomField
  ) => {
    const newCustomFields = [...costCenterCustomFieldsState]

    newCustomFields[index] = customField
    setCostCenterCustomFieldsState(newCustomFields)
  }
  //! CUSTOM FIELDS

  return (
    <Modal
      centered
      bottomBar={
        <div className="nowrap">
          <span className="mr4">
            <Button
              variation="tertiary"
              onClick={() => handleCloseModal()}
              disabled={loading}
            >
              {formatMessage(messages.cancel)}
            </Button>
          </span>
          <span>
            <Button
              variation="primary"
              onClick={() =>
                handleAddNewCostCenter({
                  name: newCostCenterName,
                  address: newCostCenterAddressState,
                  phoneNumber: newCostCenterPhoneNumber,
                  businessDocument: newCostCenterBusinessDocument,
                  customFields: costCenterCustomFieldsState,
                })
              }
              isLoading={loading}
              disabled={
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
      isOpen={isOpen}
      onClose={() => handleCloseModal()}
      closeOnOverlayClick={false}
    >
      <p className="f3 f1-ns fw3 gray">
        <FormattedMessage id="store/b2b-organizations.organization-details.add-costCenter" />
      </p>
      <div className="w-100 mv6">
        <Input
          autocomplete="off"
          size="large"
          label={formatMessage(messages.costCenterName)}
          value={newCostCenterName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNewCostCenterName(e.target.value)
          }}
          required
        />
      </div>
      <div className="w-100 mv6">
        <Input
          autocomplete="off"
          size="large"
          label={formatMessage(messages.phoneNumber)}
          helpText={formatMessage(messages.phoneNumberHelp)}
          value={newCostCenterPhoneNumber}
          error={
            newCostCenterPhoneNumber &&
            !validatePhoneNumber(newCostCenterPhoneNumber)
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNewCostCenterPhoneNumber(e.target.value)
          }}
        />
      </div>
      <div className={`${handles.businessDocument} w-100 mv6`}>
        <Input
          autocomplete="off"
          size="large"
          label={formatMessage(messages.businessDocument)}
          helpText={formatMessage(messages.businessDocumentHelp)}
          value={newCostCenterBusinessDocument}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNewCostCenterBusinessDocument(e.target.value)
          }}
        />
      </div>

      <div className="w-100 mv6">
        <FormattedMessage id="store/b2b-organizations.organization-details.add-costCenter.helpText" />
      </div>
      {/* //! Custom fields */}
      {defaultCustomFieldsDataLoading ? (
        <div className="mb5 flex flex-column">
          <Spinner />
        </div>
      ) : (
        <>
          {costCenterCustomFieldsState?.map(
            (customField: CustomField, index: number) => {
              return (
                <CustomFieldInput
                  key={`${customField.name}`}
                  index={index}
                  handleUpdate={handleCostCenterCustomFieldsUpdate}
                  customField={customField}
                />
              )
            }
          )}
        </>
      )}
      {/* //! Custom fields */}
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
  )
}

export default NewCostCenterModal
