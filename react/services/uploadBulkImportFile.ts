import type { AxiosRequestConfig } from 'axios'

import bulkImportClient from '.'
import type {
  BulkImportUploadError,
  ImportDetails,
  UploadFileData,
} from '../types/BulkImport'

const uploadBulkImportFile = async (file: File): Promise<UploadFileData> => {
  const formData = new FormData()

  formData.append('file', file)

  try {
    const importListResponse = await bulkImportClient.post<ImportDetails>(
      `/buyer-orgs`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } as AxiosRequestConfig<FormData>
    )

    return {
      status: 'success',
      data: {
        fileData: importListResponse.data,
      },
    }
  } catch (error) {
    const errorData = error?.response?.data as BulkImportUploadError

    return {
      status: 'error',
      showReport: errorData?.error === 'FieldValidationError',
      data: { ...errorData, fileName: file.name },
    }
  }
}

export default uploadBulkImportFile
