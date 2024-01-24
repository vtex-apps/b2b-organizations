import React from 'react'
import { Divider, csx } from '@vtex/admin-ui'
import {
  ErrorScreen,
  ReportInformation,
  ReportModal,
} from '@vtex/bulk-import-ui'

import ReportList from '../UploadModal/ReportList'
import ReportInformationDetails from '../UploadModal/ReportInformationDetails'
import { useTranslate } from '../../hooks'
import useBulkImportDetailsQuery from '../../hooks/useBulkImportDetailsQuery'
import ReportDownloadLink from '../ReportDownloadLink/ReportDownloadLink'

export type ImportReportModalProps = {
  /** The report data id */
  importId: string
  /** Flag indicating if the modal is open or not. * */
  open?: boolean
  /** Function called when the modal's open state changes. * */
  onOpenChange?: (open: boolean) => void
}

const ImportReportModal = ({
  importId,
  open,
  ...otherProps
}: ImportReportModalProps) => {
  const { translate: t, formatDate } = useTranslate()

  const { data, error } = useBulkImportDetailsQuery({ importId })

  const reportDownloadLink = data?.importResult?.reportDownloadLink

  return (
    <ReportModal showTabs={false} open={open} {...otherProps}>
      <ReportModal.Header showDismiss>
        {t('importReportTitle')}
      </ReportModal.Header>
      <ReportModal.Content>
        <ReportModal.TabPanel
          title={t('importReportTabTitle')}
          id="success"
          className={csx({ height: '100%' })}
        >
          {error && <ErrorScreen />}
          {!error && data && (
            <>
              <ReportInformation
                title={t('reportInformationTitle', {
                  fullPercentage: data?.percentage,
                })}
                description={t('reportInformationDescription', {
                  fileName: data?.fileName,
                  userName: data?.importedUserName,
                  uploadDate: formatDate(data?.importedAt),
                })}
                status={data?.percentage >= 100 ? 'success' : 'warning'}
                className={csx({ marginY: '$space-4' })}
              />
              {data?.percentage < 100 && (
                <ReportInformationDetails
                  variant="Import"
                  validationReportDownloadLink={
                    data?.importResult?.reportDownloadLink
                  }
                />
              )}
              <Divider className={csx({ marginY: '$space-4' })} />
              <ReportList data={data.importReportList} />
            </>
          )}
        </ReportModal.TabPanel>
      </ReportModal.Content>
      <ReportModal.Footer
        closeLabel={t('done')}
        actionButton={<ReportDownloadLink downloadLink={reportDownloadLink} />}
      />
    </ReportModal>
  )
}

export default ImportReportModal
