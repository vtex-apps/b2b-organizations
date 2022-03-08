import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { defineMessages, useIntl } from 'react-intl'

interface Props {
  loading: boolean
  isOpen: boolean
  user: UserDetails
  handleRemoveUser: () => void
  handleCloseModal: () => void
  isAdmin?: boolean
}

const storePrefix = 'store/b2b-organizations.'
const adminPrefix = 'admin/b2b-organizations.'

const storeMessages = defineMessages({
  remove: {
    id: `${storePrefix}organization-details.button.remove-user-confirm`,
  },
  cancel: {
    id: `${storePrefix}organization-details.button.cancel`,
  },
  removeUser: {
    id: `${storePrefix}organization-details.remove-user`,
  },
  removeUserHelp: {
    id: `${storePrefix}organization-details.remove-user.helpText`,
  },
})

const adminMessages = defineMessages({
  remove: {
    id: `${adminPrefix}organization-details.button.remove-user-confirm`,
  },
  cancel: {
    id: `${adminPrefix}organization-details.button.cancel`,
  },
  removeUser: {
    id: `${adminPrefix}organization-details.remove-user`,
  },
  removeUserHelp: {
    id: `${adminPrefix}organization-details.remove-user.helpText`,
  },
})

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
          isAdmin ? adminMessages.remove : storeMessages.remove
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
