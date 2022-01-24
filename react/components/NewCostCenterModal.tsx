import React, { useState } from 'react'
import type { FunctionComponent } from 'react'
import { Modal, Input, Button } from 'vtex.styleguide'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
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

import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

interface Props {
  loading: boolean
  isOpen: boolean
  handleAddNewCostCenter: (name: string, address: AddressFormFields) => void
  handleCloseModal: () => void
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  add: {
    id: `${storePrefix}organization-details.button.add`,
  },
  cancel: {
    id: `${storePrefix}organization-details.button.cancel`,
  },
  costCenterName: {
    id: `${storePrefix}costCenter-details.costCenter-name`,
  },
})

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
              isLoading={loading}
            >
              {formatMessage(messages.cancel)}
            </Button>
          </span>
          <span>
            <Button
              variation="primary"
              onClick={() =>
                handleAddNewCostCenter(
                  newCostCenterName,
                  newCostCenterAddressState
                )
              }
              isLoading={loading}
              disabled={
                !newCostCenterName || !isValidAddress(newCostCenterAddressState)
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
