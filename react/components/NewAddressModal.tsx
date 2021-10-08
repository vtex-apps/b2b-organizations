import React, { useState } from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { defineMessages, useIntl } from 'react-intl'
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
  handleAddNewAddress: (address: AddressFormFields) => void
  handleCloseModals: () => void
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  add: {
    id: `${storePrefix}costCenter-details.button.add`,
  },
  cancel: {
    id: `${storePrefix}costCenter-details.button.cancel`,
  },
})

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

  const [newAddressState, setNewAddressState] = useState(() =>
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

  const handleNewAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = newAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewAddressState(newAddress)
  }

  return (
    <ModalDialog
      centered
      confirmation={{
        onClick: () => handleAddNewAddress(newAddressState),
        label: formatMessage(messages.add),
        disabled: !isValidAddress(newAddressState),
      }}
      cancelation={{
        onClick: () => handleCloseModals(),
        label: formatMessage(messages.cancel),
      }}
      loading={loading}
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
        </AddressContainer>
      </AddressRules>
    </ModalDialog>
  )
}

export default NewAddressModal
