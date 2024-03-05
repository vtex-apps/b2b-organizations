import { Anchor, Text, csx } from '@vtex/admin-ui'
import React from 'react'

import { useTranslate } from '../../hooks'

export type ReportInformationDetailsProps = {
  variant: 'Import' | 'Upload'
  validationReportDownloadLink?: string
}

const ReportInformationDetails = ({
  variant,
  validationReportDownloadLink,
}: ReportInformationDetailsProps) => {
  const { translate: t } = useTranslate()

  return (
    <>
      <Text
        variant="body"
        className={csx({
          display: 'block',
          marginTop: '$space-3',
          marginBottom: '$space-2',
        })}
      >
        {t(`reportInformationInitial${variant}`, {
          'file-name-link': (content: string) => (
            <a href={validationReportDownloadLink}>{content}</a>
          ),
        })}
      </Text>
      <Text variant="body">
        {t('reportInformationNextSteps')}
        <ul className={csx({ marginLeft: '$space-1' })}>
          <ol>{t('reportInformationStep1')}</ol>
          <ol>{t('reportInformationStep2')}</ol>
          <ol>{t(`reportInformationStep3${variant}`)}</ol>
          <ol>
            {t('reportInformationStep4', {
              'template-link': (content: string) => (
                <Anchor href="/template-link">{content}</Anchor>
              ),
              'best-practices-link': (content: string) => (
                <Anchor href="/best-practices">{content}</Anchor>
              ),
            })}
          </ol>
        </ul>
      </Text>
    </>
  )
}

export default ReportInformationDetails
