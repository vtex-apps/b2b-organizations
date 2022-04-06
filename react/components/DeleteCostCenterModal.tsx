import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { useIntl, FormattedMessage } from 'react-intl'

import { costCenterMessages as messages } from './utils/messages'

interface Props {
  loading: boolean
  isOpen: boolean
  handleDeleteCostCenter: () => void
  handleCloseModals: () => void
}

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
