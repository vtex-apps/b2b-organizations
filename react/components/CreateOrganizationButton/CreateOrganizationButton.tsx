import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { PageHeaderButton } from '@vtex/admin-ui'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'

const CreateOrganizationButton = () => {
  const { formatMessage } = useIntl()
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeaderButton onClick={() => setOpen(true)}>
        {formatMessage(messages.new)}
      </PageHeaderButton>
      <CreateOrganizationModal open={open} onOpenChange={setOpen} />
    </>
  )
}

export default CreateOrganizationButton
