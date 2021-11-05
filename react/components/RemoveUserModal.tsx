import React from 'react'
import type { FunctionComponent } from 'react'
import { ModalDialog } from 'vtex.styleguide'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'

interface Props {
  loading: boolean
  isOpen: boolean
  user: UserDetails
  handleRemoveUser: () => void
  handleCloseModal: () => void
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  remove: {
    id: `${storePrefix}organization-details.button.remove-user-confirm`,
  },
  cancel: {
    id: `${storePrefix}organization-details.button.cancel`,
  },
})

const RemoveUserModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  user,
  handleRemoveUser,
  handleCloseModal,
}) => {
  const { formatMessage } = useIntl()

  return (
    <ModalDialog
      centered
      loading={loading}
      confirmation={{
        onClick: () => handleRemoveUser(),
        label: formatMessage(messages.remove),
        isDangerous: true,
      }}
      cancelation={{
        onClick: () => handleCloseModal(),
        label: formatMessage(messages.cancel),
      }}
      isOpen={isOpen}
      onClose={() => handleCloseModal()}
    >
      <div className="">
        <p className="f3 f3-ns fw3 gray">
          <FormattedMessage id="store/b2b-organizations.organization-details.remove-user" />
        </p>
        <p>
          <FormattedMessage
            id="store/b2b-organizations.organization-details.remove-user.helpText"
            values={{ email: user.email }}
          />
        </p>
      </div>
    </ModalDialog>
  )
}

export default RemoveUserModal
