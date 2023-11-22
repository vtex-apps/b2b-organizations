import { useIntl } from 'react-intl'
import type { TranslateFunction } from '@vtex/bulk-import-ui'

import { bulkUploadMessages, hasTranslation } from '../bulkImport/messages'

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
