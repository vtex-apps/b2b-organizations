import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'

interface Props {
  loading: boolean
  isOpen: boolean
  handleDeleteAddress: () => void
  handleCloseModals: () => void
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  deleteConfirm: {
    id: `${storePrefix}costCenter-details.button.delete-confirm`,
  },
  cancel: {
    id: `${storePrefix}costCenter-details.button.cancel`,
  },
})

const DeleteAddressModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  handleDeleteAddress,
  handleCloseModals,
}) => {
  const { formatMessage } = useIntl()

  return (
    <ModalDialog
      centered
      confirmation={{
        onClick: () => handleDeleteAddress(),
        label: formatMessage(messages.deleteConfirm),
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
      <p>
        <FormattedMessage id="store/b2b-organizations.costCenter-details.delete-address-confirmation" />
      </p>
    </ModalDialog>
  )
}

export default DeleteAddressModal
