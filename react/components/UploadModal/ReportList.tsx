import React, { Fragment } from 'react'
import { ReportListHeader, ReportListItem } from '@vtex/bulk-import-ui'

import type { ImportReportData } from '../../types/BulkImport'

export type ReportListProps = {
  data: ImportReportData[]
}

const ReportList = ({ data }: ReportListProps) => {
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
              label="Total"
              locators={[totalImports]}
            />
            <ReportListItem
              type="success"
              label="Imported Successfully"
              locators={[
                `${report.success.percentage}%`,
                report.success.imports,
              ]}
            />
            <ReportListItem
              type="error"
              label="Failed to Import"
              locators={[`${report.error.percentage}%`, report.error.imports]}
            />
          </Fragment>
        )
      })}
    </>
  )
}

export default ReportList
