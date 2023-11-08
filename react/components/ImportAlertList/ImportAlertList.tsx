import React from 'react'
import { Stack } from '@vtex/admin-ui'
import type { ImportStatus } from '@vtex/bulk-import-ui'
import { ImportAlert } from '@vtex/bulk-import-ui'

import ImportReportModal from '../ImportReportModal/ImportReportModal'
import { getImportReportData } from '../../hooks/bulkImportsMockData'

type ImportAlertData = ImportStatus & {
  importId: string
}

interface Props {
  /** A list of object with data about the status of this import. */
  data: ImportAlertData[]
  onDismiss?: (importStatus: ImportStatus) => void
}

const ImportAlertList: React.FC<Props> = ({ data, onDismiss }) => {
  return (
    <Stack>
      {data.map(itemData => (
        <ImportAlert
          key={itemData.importId}
          data={itemData}
          onDismiss={onDismiss ? () => onDismiss?.(itemData) : undefined}
          detailsModal={(open, setOpen) => (
            <ImportReportModal
              onOpenChange={setOpen}
              open={open}
              data={getImportReportData(itemData.file.name)}
            />
          )}
        />
      ))}
    </Stack>
  )
}

export default ImportAlertList
