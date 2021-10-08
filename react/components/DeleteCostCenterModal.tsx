import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'

interface Props {
  loading: boolean
  isOpen: boolean
  handleDeleteCostCenter: () => void
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

const DeleteCostCenterModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  handleDeleteCostCenter,
  handleCloseModals,
}) => {
  const { formatMessage } = useIntl()

  return (
    <ModalDialog
      centered
      confirmation={{
        onClick: () => handleDeleteCostCenter(),
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
        <FormattedMessage id="store/b2b-organizations.costCenter-details.delete-costCenter-confirmation" />
      </p>
    </ModalDialog>
  )
}

export default DeleteCostCenterModal
