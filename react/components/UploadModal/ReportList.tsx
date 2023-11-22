import React, { Fragment } from 'react'
import { ReportListHeader, ReportListItem } from '@vtex/bulk-import-ui'

import type { ImportReportData } from '../../types/BulkImport'
import { useTranslate } from '../../hooks'

export type ReportListProps = {
  data: ImportReportData[]
}

const ReportList = ({ data }: ReportListProps) => {
  const { translate: t } = useTranslate()

  return (
    <>
      {data.map(report => {
        const totalImports = report.success.imports + report.error.imports

        return (
          <Fragment key={report.title}>
            <ReportListHeader
              label={report.title}
              percentage={report.success.percentage}
            />
            <ReportListItem
              tone="secondary"
              showBullet={false}
              label={t('reportInformationListTotal')}
              locators={[totalImports]}
            />
            <ReportListItem
              type="success"
              label={t('reportInformationImportSuccessFully')}
              locators={[
                `${report.success.percentage}%`,
                report.success.imports,
              ]}
            />
            <ReportListItem
              type="error"
              label={t('reportInformationImportFailed')}
              locators={[`${report.error.percentage}%`, report.error.imports]}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export default ReportList
