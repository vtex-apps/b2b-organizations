import React, { useState } from 'react'
import {
  IconPencil,
  IconCloudArrowUp,
  Menu,
  MenuItem,
  PageHeaderMenuButton,
  Text,
  useMenuState,
} from '@vtex/admin-ui'
import { UploadModal } from '@vtex/bulk-import-ui'
import { useSWRConfig } from 'swr'

import CreateOrganizationModal from '../CreateOrganizationModal'
import { organizationMessages as messages } from '../../admin/utils/messages'
import { useBulkImportsQuery, useTranslate } from '../../hooks'
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
import { UploadingScreen } from '../UploadingScreen'
import { ImportInBulkTooltip } from '../ImportInBulkTooltip'
import {
  B2B_BULK_IMPORT_TEMPLATE_LINK,
  B2B_BULK_IMPORT_BEST_PRACTICES_LINK,
} from '../../utils/constants'

const CreateOrganizationButton = () => {
  const { formatMessage, translate: t } = useTranslate()
  const menuState = useMenuState()
  const [open, setOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const { mutate } = useSWRConfig()
  const { startBulkImport } = useStartBulkImport()

  const { data } = useBulkImportsQuery()

  const handleUploadFinish = async (result: UploadFileData) => {
    if (result.status === 'success' && result.data?.fileData?.importId) {
      await startBulkImport({ importId: result.data.fileData.importId })
      mutate('/buyer-orgs')
    }
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
        <ImportInBulkTooltip visible={!data}>
          <MenuItem
            label={formatMessage(messages.addBulk)}
            icon={<IconCloudArrowUp />}
            onClick={() => setUploadModalOpen(true)}
            disabled={!data}
          />
        </ImportInBulkTooltip>
      </Menu>
      <CreateOrganizationModal open={open} onOpenChange={setOpen} />
      <UploadModal
        helpContent={
          <Text variant="body">
            {t('helpLinks', {
              'template-link': (content: string) => (
                <a href={B2B_BULK_IMPORT_TEMPLATE_LINK}>{content}</a>
              ),
              'best-practices-link': (content: string) => (
                <a href={B2B_BULK_IMPORT_BEST_PRACTICES_LINK}>{content}</a>
              ),
            })}
          </Text>
        }
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadFile={uploadBulkImportFile}
        onUploadFinish={handleUploadFinish}
        uploadingScreen={props => <UploadingScreen {...props} />}
        errorScreen={props => (
          <ReportErrorScreen {...(props.data as BulkImportUploadError)} />
        )}
        reportScreen={props => (
          <ReportScreen {...(props.data as FieldValidationError)} />
        )}
        successScreen={props => (
          <ReportSuccessScreen {...(props.data as UploadFileResult)} />
        )}
        reportFooterActionButton={props => (
          <ReportDownloadLink
            downloadLink={
              (props.data as FieldValidationError)?.errorDownloadLink
            }
          />
        )}
      />
    </>
  )
}

export default CreateOrganizationButton
