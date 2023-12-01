import { useIntl } from 'react-intl'
import type { ReactNode } from 'react'

import type { BulkImportMessageKey } from '../bulkImport/messages'
import { bulkUploadMessages, hasTranslation } from '../bulkImport/messages'

export type TranslateFunction = (
  key: BulkImportMessageKey,
  data?: Record<string, unknown>
) => ReactNode

const useTranslate = () => {
  const { formatMessage, ...intl } = useIntl()

  const translate: TranslateFunction = (descriptor, values) => {
    return hasTranslation(descriptor)
      ? formatMessage(
          bulkUploadMessages[descriptor],
          values as Record<string, string | number>
        )
      : null
  }

  return { translate, formatMessage, ...intl }
}

export default useTranslate
