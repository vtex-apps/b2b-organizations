import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import {
  IconPencil,
  IconCloudArrowUp,
  Menu,
  MenuItem,
  PageHeaderMenuButton,
  useMenuState,
} from '@vtex/admin-ui'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'

const CreateOrganizationButton = () => {
  const { formatMessage } = useIntl()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeaderMenuButton
        state={menuState}
        label={formatMessage(messages.new)}
        labelHidden={false}
        variant="primary"
      />
      <Menu state={menuState} aria-label="actions">
        <MenuItem
          label={formatMessage(messages.addSingle)}
          icon={<IconPencil />}
          onClick={() => setOpen(true)}
        />
        <MenuItem
          label={formatMessage(messages.addBulk)}
          icon={<IconCloudArrowUp />}
        />
      </Menu>
      <CreateOrganizationModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default CreateOrganizationButton
