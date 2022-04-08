import React, { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { Modal, Button } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
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

interface Props {
  loading: boolean
  isOpen: boolean
  address: Address | null
  handleEditAddress: (address: AddressFormFields) => void
  handleCloseModals: () => void
}

const EditAddressModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  address,
  handleEditAddress,
  handleCloseModals,
}) => {
  const {
    culture: { country },
  } = useRuntime()

  const { formatMessage } = useIntl()

  const [editAddressState, setEditAddressState] = useState(() =>
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

  const handleEditAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = editAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setEditAddressState(newAddress)
  }

  useEffect(() => {
    if (!address) return

    setEditAddressState(addValidation(address))
  }, [address])

  if (!address) return null

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
              onClick={() => handleEditAddress(editAddressState)}
              isLoading={loading}
              disabled={!isValidAddress(editAddressState)}
            >
              {formatMessage(messages.update)}
            </Button>
          </span>
        </div>
      }
      isOpen={isOpen}
      onClose={() => handleCloseModals()}
      closeOnOverlayClick={false}
    >
      <AddressRules
        country={editAddressState?.country?.value}
        shouldUseIOFetching
        useGeolocation={false}
      >
        <AddressContainer
          address={editAddressState}
          Input={StyleguideInput}
          onChangeAddress={handleEditAddressChange}
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

export default EditAddressModal
