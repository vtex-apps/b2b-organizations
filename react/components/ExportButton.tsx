import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Button,
  IconArrowLineDown,
  MenuItem,
  Spinner,
  useToast,
} from '@vtex/admin-ui'
import {
  Modal,
  Button as StyleguideButton,
  Checkbox,
  Table,
} from 'vtex.styleguide'
import { useMutation, useApolloClient } from 'react-apollo'
import { useIntl } from 'react-intl'

import CREATE_EXPORT from '../graphql/createExport.graphql'
import EXPORT_STATUS from '../graphql/exportStatus.graphql'
import { exportMessages as messages } from '../admin/utils/messages'
import {
  clearStoredExportJob,
  getStoredExportJob,
  saveStoredExportJob,
} from '../utils/exportJobStorage'
import type { StoredExportJob } from '../utils/exportJobStorage'
import {
  ALL_EXPORT_TYPES,
  createIdleExportJob,
  createInitialExportJobs,
} from '../utils/exportTypes'
import type { ExportJobUIState, ExportType } from '../utils/exportTypes'
import {
  downloadCsvFile,
  getDisplayProgressPercentage,
  getExportStatusSnapshot,
  getGraphQLErrorMessage,
  getStatusActivityTimestamp,
  isExportInProgress,
  isExportStatusStale,
  MAX_STATUS_POLL_FAILURES,
  POLL_INTERVAL_MS,
} from '../utils/exportHelpers'
import type { ExportStatusData, ExportStatusResult } from '../utils/exportHelpers'

interface ExportButtonProps {
  label?: string
  variant?: 'button' | 'menuItem'
  totalsByType?: Partial<Record<ExportType, number>>
  renderLayout?: (trigger: React.ReactNode, modal: React.ReactNode) => React.ReactNode
}

const ExportButton = ({
  label,
  variant = 'button',
  totalsByType,
  renderLayout,
}: ExportButtonProps) => {
  const { formatMessage } = useIntl()
  const toast = useToast()
  const client = useApolloClient()
  const [createExport] = useMutation(CREATE_EXPORT)

  const [jobs, setJobs] = useState<Record<ExportType, ExportJobUIState>>(
    createInitialExportJobs
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>([])

  const exportIdRef = useRef<Partial<Record<ExportType, string>>>({})
  const pollStartRef = useRef<Partial<Record<ExportType, number>>>({})
  const statusPollFailureCountRef = useRef<Partial<Record<ExportType, number>>>(
    {}
  )
  const pollingInProgressRef = useRef<Partial<Record<ExportType, boolean>>>({})
  const statusSnapshotRef = useRef<Partial<Record<ExportType, string>>>({})
  const statusSnapshotSinceRef = useRef<Partial<Record<ExportType, number>>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)

  const updateJob = useCallback(
    (exportType: ExportType, patch: Partial<ExportJobUIState>) => {
      setJobs(prev => ({
        ...prev,
        [exportType]: { ...prev[exportType], ...patch },
      }))
    },
    []
  )

  const resetJob = useCallback(
    (exportType: ExportType) => {
      updateJob(exportType, createIdleExportJob())
    },
    [updateJob]
  )

  const clearStatusSnapshot = useCallback((exportType: ExportType) => {
    delete statusSnapshotRef.current[exportType]
    delete statusSnapshotSinceRef.current[exportType]
  }, [])

  const trackStatusSnapshot = useCallback(
    (exportType: ExportType, statusData: ExportStatusResult): boolean => {
      const snapshot = getExportStatusSnapshot(statusData)
      const previousSnapshot = statusSnapshotRef.current[exportType]

      if (previousSnapshot !== snapshot) {
        statusSnapshotRef.current[exportType] = snapshot
        statusSnapshotSinceRef.current[exportType] =
          getStatusActivityTimestamp(statusData) ?? Date.now()
      }

      return isExportStatusStale(
        statusData,
        statusSnapshotSinceRef.current[exportType]
      )
    },
    []
  )

  const openModal = useCallback(() => {
    const showModal = () => setIsModalOpen(true)

    if (variant === 'menuItem') {
      window.setTimeout(showModal, 0)
    } else {
      showModal()
    }
  }, [variant])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const clearPollingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const hasActivePolling = useCallback(
    () => ALL_EXPORT_TYPES.some(type => exportIdRef.current[type]),
    []
  )

  const ensurePollingInterval = useCallback(() => {
    if (intervalRef.current || !hasActivePolling()) {
      return
    }

    intervalRef.current = setInterval(() => {
      ALL_EXPORT_TYPES.forEach(exportType => {
        if (exportIdRef.current[exportType]) {
          void pollExportStatusRef.current?.(exportType)
        }
      })
    }, POLL_INTERVAL_MS)
  }, [hasActivePolling])

  const persistExportJob = useCallback(
    (exportType: ExportType, job: StoredExportJob) => {
      saveStoredExportJob(exportType, job)
    },
    []
  )

  const showErrorToast = useCallback(
    (error?: unknown) => {
      toast({
        variant: 'critical',
        message:
          getGraphQLErrorMessage(error) ??
          formatMessage(messages.toastError),
      })
    },
    [formatMessage, toast]
  )

  const fetchExportStatus = useCallback(
    async (exportId: string) => {
      const { data } = await client.query<ExportStatusData>({
        query: EXPORT_STATUS,
        variables: { exportId },
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      })

      return data?.exportStatus ?? null
    },
    [client]
  )

  const handleExportError = useCallback(
    (
      exportType: ExportType,
      error?: unknown,
      options?: { clearStoredJob?: boolean }
    ) => {
      const clearStoredJob = options?.clearStoredJob ?? true

      delete exportIdRef.current[exportType]
      delete pollStartRef.current[exportType]
      delete statusPollFailureCountRef.current[exportType]
      delete pollingInProgressRef.current[exportType]
      clearStatusSnapshot(exportType)

      if (!hasActivePolling()) {
        clearPollingInterval()
      }

      if (clearStoredJob) {
        clearStoredExportJob(exportType)
        resetJob(exportType)
      } else if (isMountedRef.current) {
        updateJob(exportType, { state: 'IDLE' })
      }

      if (clearStoredJob) {
        updateJob(exportType, { ...createIdleExportJob(), state: 'ERROR' })
      }

      showErrorToast(error)
    },
    [
      clearPollingInterval,
      clearStatusSnapshot,
      hasActivePolling,
      resetJob,
      showErrorToast,
      updateJob,
    ]
  )

  const handleStatusPollFailure = useCallback(
    (exportType: ExportType, error?: unknown): boolean => {
      statusPollFailureCountRef.current[exportType] =
        (statusPollFailureCountRef.current[exportType] ?? 0) + 1

      if (
        (statusPollFailureCountRef.current[exportType] ?? 0) >=
        MAX_STATUS_POLL_FAILURES
      ) {
        handleExportError(exportType, error, { clearStoredJob: false })

        return true
      }

      return false
    },
    [handleExportError]
  )

  const applyStatusData = useCallback(
    (
      exportType: ExportType,
      statusData: ExportStatusResult,
      pollStartedAt: number
    ) => {
      const patch: Partial<ExportJobUIState> = {
        progressPercentage: statusData.progressPercentage ?? null,
        exportedRows: statusData.exportedRows ?? null,
      }

      if (statusData.linkToFile) {
        patch.linkToFile = statusData.linkToFile
      }

      updateJob(exportType, patch)

      persistExportJob(exportType, {
        exportId: statusData.exportId,
        pollStartedAt,
        status: statusData.status,
        linkToFile: statusData.linkToFile,
        progressPercentage: statusData.progressPercentage ?? null,
        exportedRows: statusData.exportedRows ?? null,
      })
    },
    [persistExportJob, updateJob]
  )

  const resolveDownloadLink = useCallback(
    (exportType: ExportType): string | null => {
      const job = jobs[exportType]

      if (job.linkToFile) {
        return job.linkToFile
      }

      return getStoredExportJob(exportType)?.linkToFile ?? null
    },
    [jobs]
  )

  const handleDownload = useCallback(
    async (exportType: ExportType) => {
      const downloadLink = resolveDownloadLink(exportType)

      if (!downloadLink) {
        showErrorToast()

        return
      }

      updateJob(exportType, { state: 'DOWNLOADING' })

      try {
        await downloadCsvFile(downloadLink, exportType)

        if (!isMountedRef.current) return

        toast({
          variant: 'positive',
          message: formatMessage(messages.toastSuccess),
        })

        clearStoredExportJob(exportType)
        resetJob(exportType)
        delete statusPollFailureCountRef.current[exportType]
      } catch (error) {
        updateJob(exportType, {
          state: 'READY',
          linkToFile: downloadLink,
        })
        showErrorToast(error)
      }
    },
    [
      formatMessage,
      resetJob,
      resolveDownloadLink,
      showErrorToast,
      toast,
      updateJob,
    ]
  )

  const markExportReady = useCallback(
    (
      exportType: ExportType,
      statusData: ExportStatusResult,
      pollStartedAt: number
    ) => {
      delete exportIdRef.current[exportType]
      delete pollStartRef.current[exportType]
      clearStatusSnapshot(exportType)

      if (!hasActivePolling()) {
        clearPollingInterval()
      }

      applyStatusData(exportType, statusData, pollStartedAt)
      updateJob(exportType, {
        state: 'READY',
        linkToFile: statusData.linkToFile,
      })
    },
    [applyStatusData, clearPollingInterval, clearStatusSnapshot, hasActivePolling, updateJob]
  )

  const pollExportStatus = useCallback(
    async (exportType: ExportType) => {
      const exportId = exportIdRef.current[exportType]
      const pollStartedAt = pollStartRef.current[exportType]

      if (!exportId || !pollStartedAt || pollingInProgressRef.current[exportType]) {
        return
      }

      pollingInProgressRef.current[exportType] = true

      try {
        const statusData = await fetchExportStatus(exportId)

        if (!isMountedRef.current) return

        if (!statusData) {
          handleStatusPollFailure(exportType)

          return
        }

        statusPollFailureCountRef.current[exportType] = 0

        if (
          statusData.status === 'IN_PROGRESS' &&
          trackStatusSnapshot(exportType, statusData)
        ) {
          handleExportError(exportType)

          return
        }

        applyStatusData(exportType, statusData, pollStartedAt)

        if (statusData.status === 'FAILED') {
          handleExportError(exportType)

          return
        }

        if (statusData.status === 'COMPLETED' && statusData.linkToFile) {
          markExportReady(exportType, statusData, pollStartedAt)
        } else if (statusData.status === 'IN_PROGRESS') {
          updateJob(exportType, { state: 'POLLING' })
        }
      } catch (error) {
        handleStatusPollFailure(exportType, error)
      } finally {
        pollingInProgressRef.current[exportType] = false
      }
    },
    [
      applyStatusData,
      fetchExportStatus,
      handleExportError,
      handleStatusPollFailure,
      markExportReady,
      trackStatusSnapshot,
      updateJob,
    ]
  )

  const pollExportStatusRef = useRef(pollExportStatus)

  pollExportStatusRef.current = pollExportStatus

  const resumeStoredExport = useCallback(
    async (exportType: ExportType, storedJob: StoredExportJob) => {
      try {
        const statusData = await fetchExportStatus(storedJob.exportId)

        if (!isMountedRef.current) {
          return false
        }

        if (!statusData) {
          const exhausted = handleStatusPollFailure(exportType)

          if (!exhausted) {
            exportIdRef.current[exportType] = storedJob.exportId
            pollStartRef.current[exportType] = storedJob.pollStartedAt
            updateJob(exportType, { state: 'POLLING' })
            ensurePollingInterval()
          }

          return !exhausted
        }

        statusPollFailureCountRef.current[exportType] = 0
        applyStatusData(exportType, statusData, storedJob.pollStartedAt)

        if (statusData.status === 'FAILED') {
          clearStoredExportJob(exportType)
          resetJob(exportType)

          return false
        }

        if (statusData.status === 'COMPLETED' && statusData.linkToFile) {
          markExportReady(exportType, statusData, storedJob.pollStartedAt)

          return true
        }

        if (statusData.status === 'IN_PROGRESS') {
          exportIdRef.current[exportType] = storedJob.exportId
          pollStartRef.current[exportType] = storedJob.pollStartedAt
          updateJob(exportType, { state: 'POLLING' })
          await pollExportStatus(exportType)
          ensurePollingInterval()

          return true
        }
      } catch (error) {
        const exhausted = handleStatusPollFailure(exportType, error)

        if (!exhausted) {
          exportIdRef.current[exportType] = storedJob.exportId
          pollStartRef.current[exportType] = storedJob.pollStartedAt
          updateJob(exportType, { state: 'POLLING' })
          ensurePollingInterval()
        }

        return !exhausted
      }

      return false
    },
    [
      applyStatusData,
      ensurePollingInterval,
      fetchExportStatus,
      handleStatusPollFailure,
      markExportReady,
      pollExportStatus,
      resetJob,
      updateJob,
    ]
  )

  const startExportForType = useCallback(
    async (exportType: ExportType) => {
      clearStoredExportJob(exportType)
      clearStatusSnapshot(exportType)
      statusPollFailureCountRef.current[exportType] = 0
      updateJob(exportType, {
        ...createIdleExportJob(),
        state: 'CREATING',
      })

      try {
        const { data } = await createExport({
          variables: { exportType },
        })

        if (!isMountedRef.current) return

        const exportId = data?.createExport?.exportId

        if (!exportId) {
          handleExportError(exportType)

          return
        }

        const pollStartedAt = Date.now()

        exportIdRef.current[exportType] = exportId
        pollStartRef.current[exportType] = pollStartedAt
        persistExportJob(exportType, {
          exportId,
          pollStartedAt,
          status: 'IN_PROGRESS',
        })
        updateJob(exportType, { state: 'POLLING' })
        await pollExportStatus(exportType)
        ensurePollingInterval()
      } catch (error) {
        handleExportError(exportType, error)
      }
    },
    [
      clearStatusSnapshot,
      createExport,
      ensurePollingInterval,
      handleExportError,
      persistExportJob,
      pollExportStatus,
      updateJob,
    ]
  )

  const isTypeSelectable = useCallback(
    (exportType: ExportType) => !isExportInProgress(jobs[exportType].state),
    [jobs]
  )

  const startSelectedExports = useCallback(async () => {
    const typesToStart = selectedTypes.filter(type => isTypeSelectable(type))

    if (typesToStart.length === 0) {
      return
    }

    setSelectedTypes([])

    await Promise.all(typesToStart.map(type => startExportForType(type)))
  }, [isTypeSelectable, selectedTypes, startExportForType])

  const restoreStoredJobs = useCallback(async () => {
    await Promise.all(
      ALL_EXPORT_TYPES.map(async exportType => {
        const storedJob = getStoredExportJob(exportType)

        if (!storedJob?.exportId) {
          return
        }

        if (storedJob.status === 'IN_PROGRESS') {
          await resumeStoredExport(exportType, storedJob)
        } else if (storedJob.status === 'COMPLETED' && storedJob.linkToFile) {
          updateJob(exportType, {
            state: 'READY',
            progressPercentage: storedJob.progressPercentage ?? null,
            exportedRows: storedJob.exportedRows ?? null,
            linkToFile: storedJob.linkToFile,
          })
        } else if (storedJob.status === 'FAILED') {
          clearStoredExportJob(exportType)
        }
      })
    )
  }, [resumeStoredExport, updateJob])

  useEffect(() => {
    isMountedRef.current = true
    void restoreStoredJobs()

    return () => {
      isMountedRef.current = false
      clearPollingInterval()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectableTypes = useMemo(
    () => ALL_EXPORT_TYPES.filter(type => isTypeSelectable(type)),
    [isTypeSelectable]
  )

  const activeTypes = useMemo(
    () => ALL_EXPORT_TYPES.filter(type => jobs[type].state !== 'IDLE'),
    [jobs]
  )

  const allSelectableSelected =
    selectableTypes.length > 0 &&
    selectableTypes.every(type => selectedTypes.includes(type))

  const toggleSelectAll = () => {
    setSelectedTypes(allSelectableSelected ? [] : [...selectableTypes])
  }

  const toggleTypeSelection = (exportType: ExportType) => {
    setSelectedTypes(prev =>
      prev.includes(exportType)
        ? prev.filter(type => type !== exportType)
        : [...prev, exportType]
    )
  }

  const getTypeLabel = (exportType: ExportType) => {
    const typeLabels: Record<ExportType, keyof typeof messages> = {
      organizations: 'typeOrganizations',
      cost_centers: 'typeCostCenters',
      members: 'typeMembers',
      addresses: 'typeAddresses',
    }

    return formatMessage(messages[typeLabels[exportType]])
  }

  const getStatusLabel = (job: ExportJobUIState) => {
    switch (job.state) {
      case 'CREATING':
        return formatMessage(messages.statusCreating)

      case 'POLLING':
        return formatMessage(messages.statusGenerating)

      case 'DOWNLOADING':
        return formatMessage(messages.statusDownloading)

      case 'READY':
        return formatMessage(messages.statusReady)

      case 'ERROR':
        return formatMessage(messages.statusError)

      default:
        return '—'
    }
  }

  const getJobPercentage = (exportType: ExportType, job: ExportJobUIState) => {
    const inProgress = isExportInProgress(job.state)

    return getDisplayProgressPercentage(
      job.progressPercentage,
      job.exportedRows,
      totalsByType?.[exportType],
      inProgress
    )
  }

  const activeExportCount = useMemo(
    () =>
      ALL_EXPORT_TYPES.filter(type => isExportInProgress(jobs[type].state))
        .length,
    [jobs]
  )

  const buttonLabel = label ?? formatMessage(messages.buttonLabel)
  const triggerLabel =
    activeExportCount > 0
      ? formatMessage(messages.buttonExportingCount, {
          count: activeExportCount,
        })
      : buttonLabel

  const renderTrigger = () => {
    const icon =
      activeExportCount > 0 ? <Spinner size={16} /> : <IconArrowLineDown />

    if (variant === 'menuItem') {
      return (
        <MenuItem
          label={triggerLabel}
          icon={icon}
          onClick={openModal}
        />
      )
    }

    return (
      <Button variant="tertiary" icon={icon} onClick={openModal}>
        {triggerLabel}
      </Button>
    )
  }

  const tableSchema = {
    properties: {
      type: {
        title: formatMessage(messages.tableType),
      },
      progress: {
        title: formatMessage(messages.tableProgress),
        width: 180,
      },
      percentage: {
        title: formatMessage(messages.tablePercentage),
        width: 100,
      },
      status: {
        title: formatMessage(messages.tableStatus),
        width: 140,
      },
      action: {
        title: formatMessage(messages.tableAction),
        width: 140,
      },
    },
  }

  const tableItems = activeTypes.map(exportType => {
    const job = jobs[exportType]
    const percentage = getJobPercentage(exportType, job)
    const progressValue = percentage ?? 0

    return {
      type: getTypeLabel(exportType),
      progress: (
        <div
          className="w-100 bg-muted-5 br-pill overflow-hidden"
          style={{ height: '8px' }}
        >
          <div
            className="bg-action-primary h-100"
            style={{
              width: `${Math.min(100, Math.max(0, progressValue))}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      ),
      percentage: percentage != null ? `${percentage}%` : '—',
      status: getStatusLabel(job),
      action:
        job.state === 'READY' ? (
          <StyleguideButton
            type="button"
            size="small"
            variation="secondary"
            onClick={() => {
              void handleDownload(exportType)
            }}
          >
            {formatMessage(messages.modalDownloadButton)}
          </StyleguideButton>
        ) : job.state === 'ERROR' ? (
          <StyleguideButton
            type="button"
            size="small"
            variation="tertiary"
            onClick={() => {
              void startExportForType(exportType)
            }}
          >
            {formatMessage(messages.buttonRetry)}
          </StyleguideButton>
        ) : (
          '—'
        ),
    }
  })

  const progressModal = (
    <Modal
      centered
      isOpen={isModalOpen}
      onClose={closeModal}
      closeOnOverlayClick={!ALL_EXPORT_TYPES.some(type =>
        jobs[type].state === 'DOWNLOADING'
      )}
      containerClassName="w-60-ns w-90"
      bottomBar={
        selectableTypes.length > 0 ? (
          <div className="nowrap">
            <StyleguideButton
              type="button"
              variation="primary"
              disabled={selectedTypes.length === 0}
              onClick={() => {
                void startSelectedExports()
              }}
            >
              {formatMessage(messages.startExport)}
            </StyleguideButton>
          </div>
        ) : undefined
      }
    >
      <p className="f4 fw5 gray mb5">{formatMessage(messages.modalTitle)}</p>

      <div className="mb6">
        <div className="mb4">
          <Checkbox
            checked={allSelectableSelected}
            disabled={selectableTypes.length === 0}
            id="export-select-all"
            label={formatMessage(messages.selectAll)}
            name="export-select-all"
            onChange={toggleSelectAll}
            value="all"
          />
        </div>
        <div className="flex flex-column">
          {ALL_EXPORT_TYPES.map(exportType => {
            const selectable = isTypeSelectable(exportType)

            return (
              <div key={exportType} className="mb3">
                <Checkbox
                  checked={selectedTypes.includes(exportType)}
                  disabled={!selectable}
                  id={`export-type-${exportType}`}
                  label={getTypeLabel(exportType)}
                  name={`export-type-${exportType}`}
                  onChange={() => toggleTypeSelection(exportType)}
                  value={exportType}
                />
              </div>
            )
          })}
        </div>
      </div>

      {tableItems.length > 0 && (
        <Table schema={tableSchema} items={tableItems} hidePagination fullWidth />
      )}
    </Modal>
  )

  if (renderLayout) {
    return <>{renderLayout(renderTrigger(), progressModal)}</>
  }

  return (
    <>
      {renderTrigger()}
      {progressModal}
    </>
  )
}

export default ExportButton
