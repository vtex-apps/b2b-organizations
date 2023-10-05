import { useIntl } from 'react-intl'
import type { TranslateFunction } from '@vtex/bulk-import-ui'

import { bulkUploadMessages, hasTranslation } from '../bulkImport/messages'

const useTranslate = () => {
  const { formatMessage } = useIntl()

  const translate: TranslateFunction = (key, data) => {
    return hasTranslation(key)
      ? formatMessage(
          bulkUploadMessages[key],
          data as Record<string, string | number>
        )
      : null
  }

  return { translate, formatMessage }
}

export default useTranslate
