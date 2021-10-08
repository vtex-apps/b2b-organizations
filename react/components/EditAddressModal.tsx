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
  handleEditAddress: (address: AddressFormFields) => void
  handleCloseModals: () => void
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  update: {
    id: `${storePrefix}costCenter-details.button.update`,
  },
  cancel: {
    id: `${storePrefix}costCenter-details.button.cancel`,
  },
})

const EditAddressModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
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

  return (
    <ModalDialog
      centered
      confirmation={{
        onClick: () => handleEditAddress(editAddressState),
        label: formatMessage(messages.update),
        disabled: !isValidAddress(editAddressState),
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
    </ModalDialog>
  )
}

export default EditAddressModal
