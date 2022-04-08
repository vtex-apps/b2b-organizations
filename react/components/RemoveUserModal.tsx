import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import { organizationMessages as storeMessages } from './utils/messages'
import { organizationMessages as adminMessages } from '../admin/utils/messages'

interface Props {
  loading: boolean
  isOpen: boolean
  user: UserDetails
  handleRemoveUser: () => void
  handleCloseModal: () => void
  isAdmin?: boolean
}

const RemoveUserModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  user,
  handleRemoveUser,
  handleCloseModal,
  isAdmin = false,
}) => {
  const { formatMessage } = useIntl()

  return (
    <ModalDialog
      centered
      loading={loading}
      confirmation={{
        onClick: () => handleRemoveUser(),
        label: formatMessage(
          isAdmin
            ? adminMessages.removeUserConfirm
            : storeMessages.removeUserConfirm
        ),
        isDangerous: true,
      }}
      cancelation={{
        onClick: () => handleCloseModal(),
        label: formatMessage(
          isAdmin ? adminMessages.cancel : storeMessages.cancel
        ),
      }}
      isOpen={isOpen}
      onClose={() => handleCloseModal()}
    >
      <div className="">
        <p className="f3 f3-ns fw3 gray">
          {formatMessage(
            isAdmin ? adminMessages.removeUser : storeMessages.removeUser
          )}
        </p>
        <p>
          {formatMessage(
            isAdmin
              ? adminMessages.removeUserHelp
              : storeMessages.removeUserHelp,
            {
              email: user.email,
            }
          )}
        </p>
      </div>
    </ModalDialog>
  )
}

export default RemoveUserModal
