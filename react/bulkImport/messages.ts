import { defineMessages } from 'react-intl'
import type { UploadMessageKey } from '@vtex/bulk-import-ui/dist/i18n/keys'

export const bulkUploadMessages: Record<
  UploadMessageKey,
  { id: string }
> = defineMessages({
  back: {
    id: 'admin/b2b-organizations.bulk-import.upload.back',
  },
  close: {
    id: 'admin/b2b-organizations.bulk-import.upload.close',
  },
  dragDrop: {
    id: 'admin/b2b-organizations.bulk-import.upload.dragDrop',
  },
  filesType: {
    id: 'admin/b2b-organizations.bulk-import.upload.filesType',
  },
  maxSize: {
    id: 'admin/b2b-organizations.bulk-import.upload.maxSize',
  },
  unknownRowName: {
    id: 'admin/b2b-organizations.bulk-import.upload.unknownRowName',
  },
  upload: {
    id: 'admin/b2b-organizations.bulk-import.upload.upload',
  },
  uploading: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploading',
  },
  uploadErrorCount: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadErrorCount',
  },
  uploadErrorReport: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadErrorReport',
  },
  uploadErrorReportMessage: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadErrorReportMessage',
  },
  uploadFinish: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadFinish',
  },
  uploadGeneralFailure: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadGeneralFailure',
  },
  uploadMultipleErrors: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadMultipleErrors',
  },
  uploadSuccess: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadSuccess',
  },
  uploadSuccessItems: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadSuccessItems',
  },
  uploadTitle: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadTitle',
  },
  uploadViewReport: {
    id: 'admin/b2b-organizations.bulk-import.upload.uploadViewReport',
  },
})

export const hasTranslation = (key: string): key is UploadMessageKey => {
  return key in bulkUploadMessages
}
