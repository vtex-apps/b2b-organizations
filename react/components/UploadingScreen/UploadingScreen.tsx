import React, { useState } from 'react'
import { UploadingScreen as BulkImportUploadingScreen } from '@vtex/bulk-import-ui'

import type { UploadFileData } from '../../types/BulkImport'
import ValidatingScreen from './ValidatingScreen'
import useValidateBulkImport from '../../hooks/useValidateBulkImport'

export type UploadingScreenProps = {
  name: string
  size: number
  uploadFile: () => Promise<UploadFileData>
  onUploadFinished: (data: UploadFileData) => void
}

export type UploadingStep = 'UPLOADING' | 'VALIDATING'

const UploadingScreen = ({
  uploadFile,
  onUploadFinished: onUploadFinishedProp,
  ...otherProps
}: UploadingScreenProps) => {
  const [step, setStep] = useState<UploadingStep>('UPLOADING')

  const [importId, setImportId] = useState<string | undefined>(undefined)

  const { startBulkImportValidation } = useValidateBulkImport({
    onSuccess: () => {
      setStep('VALIDATING')
    },
  })

  const onUploadFinished = (data: UploadFileData) => {
    if (data.status === 'error') {
      onUploadFinishedProp(data)

      return
    }

    startBulkImportValidation({ importId: data?.data?.fileData?.importId })
    setImportId(data?.data?.fileData?.importId)
  }

  return step === 'UPLOADING' ? (
    <BulkImportUploadingScreen
      {...otherProps}
      uploadFile={uploadFile}
      onUploadFinished={onUploadFinished}
    />
  ) : (
    <ValidatingScreen
      {...otherProps}
      importId={importId}
      onUploadFinished={onUploadFinishedProp}
    />
  )
}

export default UploadingScreen
