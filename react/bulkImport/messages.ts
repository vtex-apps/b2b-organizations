import { defineMessages } from 'react-intl'
import type {
  ImportMessageKey,
  UploadMessageKey,
} from '@vtex/bulk-import-ui/dist/i18n/keys'

export type BulkImportMessageKey =
  | UploadMessageKey
  | ImportMessageKey
  | 'reportInformationListTotal'
  | 'reportInformationImportSuccessFully'
  | 'reportInformationImportFailed'
  | 'importReportTabTitle'
  | 'importReportTitle'
  | 'reportInformationTitle'
  | 'reportInformationDescription'
  | 'reportScreenSuccessCount'
  | 'reportScreenTitle'
  | 'reportScreenDescription'
  | 'reportScreenLabel'
  | 'reportInformationInitialImport'
  | 'reportInformationInitialUpload'
  | 'reportInformationNextSteps'
  | 'reportInformationStep1'
  | 'reportInformationStep2'
  | 'reportInformationStep3Upload'
  | 'reportInformationStep3Import'
  | 'reportInformationStep4'
  | 'helpLinks'
  | 'downloadReviewedLink'
  | 'errorMessage'
  | 'permissionAlertTooltip'

export const bulkUploadMessages: Record<
  BulkImportMessageKey,
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
  helpLinks: {
    id: 'admin/b2b-organizations.bulk-import.upload.helpLinks',
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
  done: {
    id: 'admin/b2b-organizations.bulk-import.import.done',
  },
  importing: {
    id: 'admin/b2b-organizations.bulk-import.import.importing',
  },
  importError: {
    id: 'admin/b2b-organizations.bulk-import.import.importError',
  },
  importErrorReportTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.importErrorReportTitle',
  },
  importProgress: {
    id: 'admin/b2b-organizations.bulk-import.import.importProgress',
  },
  importReportErrorTab: {
    id: 'admin/b2b-organizations.bulk-import.import.importReportErrorTab',
  },
  importReportGenericError: {
    id: 'admin/b2b-organizations.bulk-import.import.importReportGenericError',
  },
  importReportSuccessTab: {
    id: 'admin/b2b-organizations.bulk-import.import.importReportSuccessTab',
  },
  importReportTabTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.importReportTabTitle',
  },
  importReportTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.importReportTitle',
  },
  importSuccess: {
    id: 'admin/b2b-organizations.bulk-import.import.importSuccess',
  },
  importSuccessReportTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.importSuccessReportTitle',
  },
  importDetails: {
    id: 'admin/b2b-organizations.bulk-import.import.importDetails',
  },
  fileExtensionError: {
    id: 'admin/b2b-organizations.bulk-import.import.fileExtensionError',
  },
  fileSizeError: {
    id: 'admin/b2b-organizations.bulk-import.import.fileSizeError',
  },
  importErrorTryAgain: {
    id: 'admin/b2b-organizations.bulk-import.import.importErrorTryAgain',
  },
  reportInformationTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationTitle',
  },
  reportInformationDescription: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationDescription',
  },
  reportInformationListTotal: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationListTotal',
  },
  reportInformationImportSuccessFully: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationImportSuccessFully',
  },
  reportInformationImportFailed: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationImportFailed',
  },
  reportScreenTitle: {
    id: 'admin/b2b-organizations.bulk-import.import.reportScreenTitle',
  },
  reportScreenDescription: {
    id: 'admin/b2b-organizations.bulk-import.import.reportScreenDescription',
  },
  reportScreenLabel: {
    id: 'admin/b2b-organizations.bulk-import.import.reportScreenLabel',
  },
  reportScreenSuccessCount: {
    id: 'admin/b2b-organizations.bulk-import.import.reportScreenSuccessCount',
  },
  reportInformationInitialUpload: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationInitialUpload',
  },
  reportInformationInitialImport: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationInitialImport',
  },
  reportInformationNextSteps: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationNextSteps',
  },
  reportInformationStep1: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationStep1',
  },
  reportInformationStep2: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationStep2',
  },
  reportInformationStep3Upload: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationStep3Upload',
  },
  reportInformationStep3Import: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationStep3Import',
  },
  reportInformationStep4: {
    id: 'admin/b2b-organizations.bulk-import.import.reportInformationStep4',
  },
  reportInformationStep4Filename: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationStep4Filename',
  },
  reportInformationStep4NeedGuidance: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationStep4NeedGuidance',
  },
  reportInformationStep4ImportGuide: {
    id:
      'admin/b2b-organizations.bulk-import.import.reportInformationStep4ImportGuide',
  },
  downloadReviewedLink: {
    id: 'admin/b2b-organizations.bulk-import.import.downloadReviewedLink',
  },
  errorMessage: {
    id: 'admin/b2b-organizations.bulk-import.import.errorMessage',
  },
  permissionAlertTooltip: {
    id: 'admin/b2b-organizations.bulk-import.import.permissionAlertTooltip',
  },
})

export const hasTranslation = (key: string): key is BulkImportMessageKey => {
  return key in bulkUploadMessages
}
