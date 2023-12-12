import React, { useState } from 'react'
import {
  IconPencil,
  IconCloudArrowUp,
  Menu,
  MenuItem,
  PageHeaderMenuButton,
  useMenuState,
} from '@vtex/admin-ui'
import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import { UploadModal } from '@vtex/bulk-import-ui'
import { useSWRConfig } from 'swr'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'
import { useTranslate } from '../../hooks'
import ReportErrorScreen from '../UploadModal/ReportErrorScreen'
import ReportScreen from '../UploadModal/ReportScreen'
import ReportSuccessScreen from '../UploadModal/ReportSuccessScreen'
import { uploadBulkImportFile } from '../../services'
import type { UploadFileResult } from '../../types/BulkImport'
import useStartBulkImport from '../../hooks/useStartBulkImport'

const CreateOrganizationButton = () => {
  const { formatMessage } = useTranslate()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const { mutate } = useSWRConfig()
  const { startBulkImport } = useStartBulkImport()

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
        onUploadFinish={result => {
          if (result.data?.fileData.importId) {
            startBulkImport(result.data?.fileData.importId)
            mutate('/buyer-orgs')
          }
        }}
        errorScreen={props => (
          <ReportErrorScreen
            {...(props as UploadFinishedData<UploadFileResult>)}
          />
        )}
        reportScreen={props => (
          <ReportScreen {...(props as UploadFinishedData<UploadFileResult>)} />
        )}
        successScreen={props => (
          <ReportSuccessScreen
            {...(props as UploadFinishedData<UploadFileResult>)}
          />
        )}
      />
    </>
  )
}

export default CreateOrganizationButton
