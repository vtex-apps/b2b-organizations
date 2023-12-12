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

    console.log(importListResponse.data)

    return {
      status: 'success',
      data: {
        fileData: {
          uploadedDate: '11/20/2023',
          userName: 'Mayan Brown',
          fileName: 'file.xlxs',
          importId: '',
        },
        error: [
          {
            title: 'Organizations',
            errorCount: 20,
          },
        ],
      },
    }
  } catch (error) {
    console.log(error.response.status)
    console.log(error.response.data)

    return {
      status: 'error',
      showReport: false,
      data: null,
    }
  }
}

export default uploadBulkImportFile
