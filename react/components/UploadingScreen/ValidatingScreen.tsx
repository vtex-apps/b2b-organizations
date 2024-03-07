import React from 'react'
import { Flex, Spinner, Text, csx } from '@vtex/admin-ui'

import { useTranslate } from '../../hooks'
import { bytesToSize } from '../utils/bytesToSize'
import type { UploadFileData } from '../../types/BulkImport'
import useBulkImportDetailsQuery from '../../hooks/useBulkImportDetailsQuery'

export type ValidatingScreenProps = {
  importId?: string
  name: string
  size: number
  onUploadFinished: (data: UploadFileData) => void
}

const ValidatingScreen = ({
  name,
  size,
  importId,
  onUploadFinished,
}: ValidatingScreenProps) => {
  const { translate: t } = useTranslate()

  useBulkImportDetailsQuery({
    importId,
    refreshInterval: 5 * 1000,
    onSuccess: data => {
      if (['InValidation', 'InProgress'].includes(data.importState)) return

      if (['ReadyToImport', 'Completed'].includes(data.importState)) {
        onUploadFinished({
          status: 'success',
          data: {
            fileData: {
              ...data,
              percentage: data.percentage.toString(),
            },
          },
        })

        return
      }

      if (
        ['ValidationFailed', 'CompletedWithError', 'Failed'].includes(
          data.importState
        )
      ) {
        onUploadFinished({
          status: 'error',
          showReport: data?.importState === 'ValidationFailed',
          data: {
            error: 'FieldValidationError',
            errorDownloadLink: data?.validationResult?.reportDownloadLink ?? '',
            validationResult: data?.validationResult?.validationResult ?? [],
            fileName: data.fileName,
          },
        })
      }
    },
  })

  return (
    <Flex
      className={csx({ backgroundColor: '$gray05', height: '100%' })}
      align="center"
      direction="column"
      justify="center"
    >
      <Spinner className={csx({ color: '$blue40' })} size={120} />
      <Text
        className={csx({ marginBottom: '$space-3', marginTop: '$space-10' })}
        variant="pageTitle"
      >
        {t('uploading')}
      </Text>
      <div>
        <Text>{name}</Text>
        <Text tone="secondary">
          {' · '}
          {bytesToSize(size)}
        </Text>
      </div>
    </Flex>
  )
}

export default ValidatingScreen
