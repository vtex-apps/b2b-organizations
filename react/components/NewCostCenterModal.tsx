import React, { useState } from 'react'
import type { FunctionComponent } from 'react'
import { Modal, Input, Button } from 'vtex.styleguide'
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

import { costCenterMessages as messages } from './utils/messages'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import { validatePhoneNumber } from '../modules/formValidators'

interface Props {
  loading: boolean
  isOpen: boolean
  handleAddNewCostCenter: ({
    name,
    address,
    phoneNumber,
    businessDocument,
  }: {
    name: string
    address: AddressFormFields
    phoneNumber: string
    businessDocument: string
  }) => void
  handleCloseModal: () => void
}

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
      <div className="w-100 mv6">
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
