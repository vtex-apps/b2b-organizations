import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { Button, Modal, Toggle } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { useQuery } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'
import {
  AddressContainer,
  AddressForm,
  AddressRules,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'
import 'vtex.country-codes/locales'

import { costCenterMessages as messages } from './utils/messages'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

interface Props {
  loading: boolean
  isOpen: boolean
  handleAddNewAddress: (address: AddressFormFields) => void
  handleCloseModals: () => void
}

const NewAddressModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  handleAddNewAddress,
  handleCloseModals,
}) => {
  const {
    culture: { country },
  } = useRuntime()

  const { formatMessage } = useIntl()

  const [newAddressState, setNewAddressState] = useState(() => {
    return {
      ...addValidation(getEmptyAddress(country)),
      checked: false,
    }
  })

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  useEffect(() => {
    if (isOpen) {
      setNewAddressState({
        ...addValidation(getEmptyAddress(country)),
        checked: false,
      })
    }
  }, [isOpen])

  const handleNewAddressChange = (changedAddress: AddressFormFields) => {
    const newAddress = {
      ...newAddressState,
      ...changedAddress,
    }

    setNewAddressState(newAddress)
  }

  return (
    <Modal
      centered
      bottomBar={
        <div className="nowrap">
          <span className="mr4">
            <Button
              variation="tertiary"
              onClick={() => handleCloseModals()}
              disabled={loading}
            >
              {formatMessage(messages.cancel)}
            </Button>
          </span>
          <span>
            <Button
              variation="primary"
              onClick={() => handleAddNewAddress(newAddressState)}
              isLoading={loading}
              disabled={!isValidAddress(newAddressState)}
            >
              {formatMessage(messages.add)}
            </Button>
          </span>
        </div>
      }
      isOpen={isOpen}
      onClose={() => handleCloseModals()}
      closeOnOverlayClick={false}
    >
      <AddressRules
        country={newAddressState?.country?.value}
        shouldUseIOFetching
        useGeolocation={false}
      >
        <AddressContainer
          address={newAddressState}
          Input={StyleguideInput}
          onChangeAddress={handleNewAddressChange}
          autoCompletePostalCode
        >
          <CountrySelector shipsTo={translateCountries()} />

          <PostalCodeGetter />

          <AddressForm
            Input={StyleguideInput}
            omitAutoCompletedFields={false}
            omitPostalCodeFields
          />
          <div className="mb6">
            <Toggle
              checked={newAddressState.checked}
              onChange={() =>
                setNewAddressState((prevState: AddressFormFields) => ({
                  ...newAddressState,
                  checked: !prevState.checked,
                }))
              }
              label={formatMessage(messages.defaultAddress)}
            />
          </div>
        </AddressContainer>
      </AddressRules>
    </Modal>
  )
}

export default NewAddressModal
