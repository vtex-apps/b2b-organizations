import axios from 'axios'

export const BULK_IMPORT_BASE_URL = `/api/b2b/import`

const bulkImportClient = axios.create()

bulkImportClient.defaults.baseURL = BULK_IMPORT_BASE_URL

export default bulkImportClient
