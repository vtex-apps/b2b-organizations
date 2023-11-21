import { Text, csx } from '@vtex/admin-ui'
import React from 'react'

import { useTranslate } from '../../hooks'

export type ReportInformationDetailsProps = {
  variant: 'Import' | 'Upload'
}

const ReportInformationDetails = ({
  variant,
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
          a: (content: string) => <a href="/">{content}</a>,
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
              a: (content: string) => <a href="/">{content}</a>,
              ab: (content: string) => <a href="/">{content}</a>,
            })}
          </ol>
        </ul>
      </Text>
    </>
  )
}

export default ReportInformationDetails
