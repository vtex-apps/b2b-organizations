import { Button, IconArrowLineDown } from '@vtex/admin-ui'
import React from 'react'

import { useTranslate } from '../../hooks'

type ReportDownloadLinkProps = {
  downloadLink?: string
}

const ReportDownloadLink = ({ downloadLink }: ReportDownloadLinkProps) => {
  const { translate: t } = useTranslate()

  if (!downloadLink) return null

  return (
    <Button
      variant="tertiary"
      iconPosition="end"
      icon={<IconArrowLineDown />}
      onClick={() => window?.location.assign?.(downloadLink)}
    >
      {t('downloadReviewedLink')}
    </Button>
  )
}

export default ReportDownloadLink
