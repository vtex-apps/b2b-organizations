import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Button,
  IconArrowLineDown,
  IconWarningCircle,
  Spinner,
  useToast,
} from '@vtex/admin-ui'
import { useMutation, useApolloClient } from 'react-apollo'
import { useIntl } from 'react-intl'

import CREATE_EXPORT from '../graphql/createExport.graphql'
import EXPORT_STATUS from '../graphql/exportStatus.graphql'
import { exportMessages as messages } from '../admin/utils/messages'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

type ExportType = 'organizations' | 'cost_centers' | 'members' | 'addresses'

type ExportState = 'IDLE' | 'CREATING' | 'POLLING' | 'DOWNLOADING' | 'ERROR'

interface ExportButtonProps {
  exportType: ExportType
  label?: string
}

interface ExportStatusData {
  exportStatus: {
    exportId: string
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    progressPercentage: number | null
    exportedRows: number | null
    linkToFile: string | null
    lastUpdate: string | null
    startDate: string | null
  }
}

const getGraphQLErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined

  const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> })
    .graphQLErrors

  return graphQLErrors?.[0]?.message
}

const getFilenameFromContentDisposition = (header: string | null): string | null => {
  if (!header) return null

  const filenameMatch = header.match(/filename="?([^";]+)"?/i)

  return filenameMatch?.[1] ?? null
}

const getDefaultFilename = (exportType: ExportType) => {
  const date = new Date().toISOString().slice(0, 10)

  return `b2b-export-${exportType}-${date}.csv`
}

const downloadCsvFile = async (linkToFile: string, exportType: ExportType) => {
  const response = await fetch(linkToFile, { credentials: 'include' })

  if (!response.ok) {
    throw new Error(response.status === 403 ? 'FORBIDDEN' : 'DOWNLOAD_FAILED')
  }

  const blob = await response.blob()
  const filename =
    getFilenameFromContentDisposition(
      response.headers.get('Content-Disposition')
    ) ?? getDefaultFilename(exportType)

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const ExportButton = ({ exportType, label }: ExportButtonProps) => {
  const { formatMessage } = useIntl()
  const toast = useToast()
  const client = useApolloClient()
  const [createExport] = useMutation(CREATE_EXPORT)

  const [state, setState] = useState<ExportState>('IDLE')
  const [progressPercentage, setProgressPercentage] = useState<number | null>(
    null
  )

  const exportIdRef = useRef<string | null>(null)
  const pollStartRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingInProgressRef = useRef(false)
  const isMountedRef = useRef(true)

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const showErrorToast = useCallback(
    (error?: unknown) => {
      const graphQLErrorMessage = getGraphQLErrorMessage(error)

      toast({
        variant: 'critical',
        message:
          graphQLErrorMessage ??
          formatMessage(messages.toastError),
      })
    },
    [formatMessage, toast]
  )

  const handleExportError = useCallback(
    (error?: unknown) => {
      clearPolling()
      exportIdRef.current = null
      pollStartRef.current = null
      setProgressPercentage(null)

      if (isMountedRef.current) {
        setState('ERROR')
      }

      showErrorToast(error)
    },
    [clearPolling, showErrorToast]
  )

  const handleDownload = useCallback(
    async (linkToFile: string) => {
      if (!isMountedRef.current) return

      setState('DOWNLOADING')

      try {
        await downloadCsvFile(linkToFile, exportType)

        if (!isMountedRef.current) return

        toast({
          variant: 'positive',
          message: formatMessage(messages.toastSuccess),
        })

        setState('IDLE')
        setProgressPercentage(null)
        exportIdRef.current = null
        pollStartRef.current = null
      } catch (error) {
        handleExportError(error)
      }
    },
    [exportType, formatMessage, handleExportError, toast]
  )

  const pollExportStatus = useCallback(async () => {
    const exportId = exportIdRef.current

    if (!exportId || !pollStartRef.current || pollingInProgressRef.current) {
      return
    }

    if (Date.now() - pollStartRef.current >= POLL_TIMEOUT_MS) {
      handleExportError()

      return
    }

    pollingInProgressRef.current = true

    try {
      const { data } = await client.query<ExportStatusData>({
        query: EXPORT_STATUS,
        variables: { exportId },
        fetchPolicy: 'network-only',
      })

      if (!isMountedRef.current) return

      const statusData = data?.exportStatus

      if (!statusData) {
        handleExportError()

        return
      }

      setProgressPercentage(statusData.progressPercentage ?? null)

      if (statusData.status === 'FAILED') {
        handleExportError()

        return
      }

      if (statusData.status === 'COMPLETED' && statusData.linkToFile) {
        clearPolling()
        await handleDownload(statusData.linkToFile)
      }
    } catch (error) {
      handleExportError(error)
    } finally {
      pollingInProgressRef.current = false
    }
  }, [clearPolling, client, handleDownload, handleExportError])

  const startPolling = useCallback(() => {
    clearPolling()
    pollStartRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      pollExportStatus()
    }, POLL_INTERVAL_MS)
  }, [clearPolling, pollExportStatus])

  const startExport = useCallback(async () => {
    setState('CREATING')
    setProgressPercentage(null)

    try {
      const { data } = await createExport({
        variables: { exportType },
      })

      if (!isMountedRef.current) return

      const exportId = data?.createExport?.exportId

      if (!exportId) {
        handleExportError()

        return
      }

      exportIdRef.current = exportId
      setState('POLLING')
      await pollExportStatus()
      startPolling()
    } catch (error) {
      handleExportError(error)
    }
  }, [
    createExport,
    exportType,
    handleExportError,
    pollExportStatus,
    startPolling,
  ])

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      clearPolling()
    }
  }, [clearPolling])

  const buttonLabel = label ?? formatMessage(messages.buttonLabel)

  if (state === 'ERROR') {
    return (
      <Button
        variant="tertiary"
        icon={<IconWarningCircle />}
        onClick={() => startExport()}
      >
        {formatMessage(messages.buttonError)} — {formatMessage(messages.buttonRetry)}
      </Button>
    )
  }

  if (state === 'CREATING' || state === 'POLLING' || state === 'DOWNLOADING') {
    const generatingLabel =
      progressPercentage != null
        ? formatMessage(messages.buttonGenerating, {
            percentage: progressPercentage,
          })
        : formatMessage(messages.buttonGeneratingNoProgress)

    return (
      <Button variant="tertiary" disabled icon={<Spinner size={16} />}>
        {generatingLabel}
      </Button>
    )
  }

  return (
    <Button
      variant="tertiary"
      icon={<IconArrowLineDown />}
      onClick={() => startExport()}
    >
      {buttonLabel}
    </Button>
  )
}

export default ExportButton
