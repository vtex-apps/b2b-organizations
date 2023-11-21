import React, { useMemo } from 'react'
import { Divider, csx } from '@vtex/admin-ui'
import { ReportInformation, ReportModal } from '@vtex/bulk-import-ui'

import ReportList from '../UploadModal/ReportList'
import ReportInformationDetails from '../UploadModal/ReportInformationDetails'
import type { ImportReportData } from '../../types/BulkImport'
import { useTranslate } from '../../hooks'

export type ImportReportModalProps = {
  /** The report data, with information about successful and failed imports. */
  data: ImportReportData[]
  /** Flag indicating if the modal is open or not. * */
  open?: boolean
  /** Function called when the modal's open state changes. * */
  onOpenChange?: (open: boolean) => void
}

const ImportReportModal = ({ data, ...otherProps }: ImportReportModalProps) => {
  const { translate: t } = useTranslate()

  const fullPercentage = useMemo(() => {
    const [totalSuccess, totalError] = data.reduce(
      ([successAcc, errorAcc], { success, error }) => {
        return [successAcc + success.imports, errorAcc + error.imports]
      },
      [0, 0] as [number, number]
    )

    const percentage = (totalSuccess * 100) / (totalSuccess + totalError)

    return Math.round((percentage + Number.EPSILON) * 100) / 100
  }, [data])

  return (
    <ReportModal showTabs={false} {...otherProps}>
      <ReportModal.Header showDismiss>
        Buyer Organizations Import Report
      </ReportModal.Header>
      <ReportModal.Content>
        <ReportModal.TabPanel title="Report" id="success">
          <ReportInformation
            title={t('reportInformationTitle', { fullPercentage })}
            description={t('reportInformationDescription', {
              fileName: 'customers_buyer-orgs.xlsx',
              userName: 'Mary Brown',
              uploadDate: '10/27/2023',
            })}
            status={fullPercentage >= 100 ? 'success' : 'warning'}
            className={csx({ marginY: '$space-4' })}
          />
          {fullPercentage < 100 && (
            <ReportInformationDetails variant="Import" />
          )}
          <Divider className={csx({ marginY: '$space-4' })} />
          <ReportList data={data} />
        </ReportModal.TabPanel>
      </ReportModal.Content>
      <ReportModal.Footer closeLabel={t('done')} />
    </ReportModal>
  )
}

export default ImportReportModal
