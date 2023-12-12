/* eslint-disable no-console */
import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import type { AxiosRequestConfig } from 'axios'

import bulkImportClient from '.'
import type { ImportDetails, UploadFileResult } from '../types/BulkImport'

const uploadBulkImportFile = async (
  file: File
): Promise<UploadFinishedData<UploadFileResult | null>> => {
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
    return {
      status: 'error',
      showReport: false,
      data: error.response.data,
    }
  }
}

export default uploadBulkImportFile
