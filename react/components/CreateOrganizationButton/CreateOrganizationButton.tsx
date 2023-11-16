import React, { useState } from 'react'
import {
  IconPencil,
  IconCloudArrowUp,
  Menu,
  MenuItem,
  PageHeaderMenuButton,
  useMenuState,
} from '@vtex/admin-ui'
import { UploadModal } from '@vtex/bulk-import-ui'
import { useSWRConfig } from 'swr'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'
import { uploadBulkImportFile } from '../../bulkImport/upload'
import { useTranslate } from '../../hooks'

const CreateOrganizationButton = () => {
  const { formatMessage } = useTranslate()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const { mutate } = useSWRConfig()

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
          onClick={() => setUploadModalOpen(true)}
        />
      </Menu>
      <CreateOrganizationModal open={open} onOpenChange={setOpen} />
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadFile={uploadBulkImportFile}
        onUploadFinish={() => {
          mutate('/buyer-orgs')
        }}
      />
    </>
  )
}

export default CreateOrganizationButton
