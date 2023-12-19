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
import type {
  BulkImportUploadError,
  FieldValidationError,
  UploadFileData,
  UploadFileResult,
} from '../../types/BulkImport'
import useStartBulkImport from '../../hooks/useStartBulkImport'
import ReportDownloadLink from '../ReportDownloadLink/ReportDownloadLink'

const CreateOrganizationButton = () => {
  const { formatMessage } = useTranslate()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const { mutate } = useSWRConfig()
  const { startBulkImport } = useStartBulkImport()

  const handleUploadFinish = async (result: UploadFileData) => {
    if (result.status === 'success' && result.data?.fileData.importId) {
      await startBulkImport(result.data?.fileData.importId)
      mutate('/buyer-orgs')
    }
  }

  const reportFooterActionButton = (
    props: UploadFinishedData<BulkImportUploadError>
  ) => {
    const reportDownloadLink = (props.data as FieldValidationError)
      ?.errorDownloadLink

    return (
      reportDownloadLink && (
        <ReportDownloadLink downloadLink={reportDownloadLink} />
      )
    )
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
        uploadFile={uploadBulkImportFile}
        onUploadFinish={handleUploadFinish}
        errorScreen={props => (
          <ReportErrorScreen {...(props.data as BulkImportUploadError)} />
        )}
        reportScreen={props => (
          <ReportScreen {...(props.data as FieldValidationError)} />
        )}
        successScreen={props => (
          <ReportSuccessScreen {...(props.data as UploadFileResult)} />
        )}
        reportFooterActionButton={reportFooterActionButton}
      />
    </>
  )
}

export default CreateOrganizationButton
