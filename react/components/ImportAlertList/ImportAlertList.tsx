import React from 'react'
import { Stack } from '@vtex/admin-ui'
import type { ImportStatus } from '@vtex/bulk-import-ui'
import { ImportAlert } from '@vtex/bulk-import-ui'

import ImportReportModal from '../ImportReportModal/ImportReportModal'
import useClosedAlerts from '../../hooks/useClosedAlerts'

type ImportAlertData = ImportStatus & {
  importId: string
}

interface ImportAlertListProps {
  /** A list of object with data about the status of this import. */
  data: ImportAlertData[]
}

const ImportAlertList = ({ data }: ImportAlertListProps) => {
  const { closedAlerts, addClosedAlert } = useClosedAlerts()

  const filteredAlert = data.filter(
    itemData => !closedAlerts.find(alertId => alertId === itemData.importId)
  )

  return (
    <Stack>
      {filteredAlert.map(itemData => (
        <ImportAlert
          key={itemData.importId}
          data={itemData}
          onDismiss={() => addClosedAlert(itemData.importId)}
          detailsModal={(open, setOpen) => (
            <ImportReportModal
              onOpenChange={setOpen}
              open={open}
              importId={itemData.importId}
            />
          )}
        />
      ))}
    </Stack>
  )
}

export default ImportAlertList
