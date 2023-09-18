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
import { UploadModal } from '@vtex/bulk-import-ui'
import type { TranslateFunction } from '@vtex/bulk-import-ui/dist/context/context'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'
import { hasTranslation, bulkUploadMessages } from '../../bulkImport/messages'
import { uploadBulkImportFile } from '../../bulkImport/upload'

const CreateOrganizationButton = () => {
  const { formatMessage } = useIntl()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const translate: TranslateFunction = (key, data) => {
    return hasTranslation(key)
      ? formatMessage(
          bulkUploadMessages[key],
          data as Record<string, string | number>
        )
      : null
  }

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
        translate={translate}
        uploadFile={uploadBulkImportFile}
        onUploadFinish={() => {}}
      />
    </>
  )
}

export default CreateOrganizationButton
