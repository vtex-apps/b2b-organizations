import React from 'react'
import type { ImportReportData } from '@vtex/bulk-import-ui'
import {
  ErrorReport,
  SuccessReport,
  ReportModal,
  useTranslate,
} from '@vtex/bulk-import-ui'

interface Props {
  /** The report data, with information about successful and failed imports. */
  data: ImportReportData
  /** Flag indicating if the modal is open or not. * */
  open?: boolean
  /** Function called when the modal's open state changes. * */
  onOpenChange?: (open: boolean) => void
  /** The number of rows to render on each page (default = 25). * */
  pageSize?: number
}

const ImportReportModal: React.FC<Props> = ({
  data,
  pageSize = 25,
  ...otherProps
}) => {
  const { t } = useTranslate()

  return (
    <ReportModal showTabs {...otherProps}>
      <ReportModal.Header showDismiss>
        {t('importReportTitle')}
      </ReportModal.Header>
      <ReportModal.Content>
        <ReportModal.TabPanel title="Organizations" id="organizations">
          Organizations Mock Tab Panel
        </ReportModal.TabPanel>
        <ReportModal.TabPanel
          title={
            t('importReportSuccessTab', { count: data.success?.length }) ??
            'Success'
          }
          id="success"
        >
          <SuccessReport
            data={data.success ?? []}
            pageSize={pageSize}
            title={t('importSuccessReportTitle', {
              count: data.success?.length ?? 0,
            })}
          />
        </ReportModal.TabPanel>
        <ReportModal.TabPanel
          title={t('importReportErrorTab', {
            count: Array.isArray(data.error) ? data.error.length : 0,
          })}
          id="error"
        >
          <ErrorReport
            data={Array.isArray(data.error) ? data.error : []}
            pageSize={pageSize}
            title={t('importErrorReportTitle', {
              count: Array.isArray(data.error) ? data.error.length : 0,
            })}
          />
        </ReportModal.TabPanel>
      </ReportModal.Content>
      <ReportModal.Footer closeLabel={t('done')} />
    </ReportModal>
  )
}

export default ImportReportModal
