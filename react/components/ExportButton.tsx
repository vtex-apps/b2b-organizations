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
import { useIntl } from 'react-intl'

import ExportDownloadLink from './ExportDownloadLink'
import { exportMessages as messages } from '../admin/utils/messages'
import type { Session } from '../modules/session'
import { useSessionResponse } from '../modules/session'
import {
  createBulkExport,
  extractApiErrorMessage,
  getBulkExportStatusWithRetry,
} from '../services/bulkExportApi'
import {
  ALL_EXPORT_TYPES,
  createIdleExportJob,
  createInitialExportJobs,
} from '../utils/exportTypes'
import type { ExportJobUIState, ExportType } from '../utils/exportTypes'
import {
  getDisplayProgressPercentage,
  isExportInProgress,
  POLL_INTERVAL_MS,
} from '../utils/exportHelpers'
import type { BulkExportStatusResult } from '../utils/exportHelpers'
import { getExportDownloadHref, openExternalDownloadUrl } from '../services/bulkExportClient'
import {
  loadExportJobsSession,
  restoreExportJobsSession,
  saveExportJobsSession,
} from '../utils/exportJobStorage'

interface ExportButtonProps {
  label?: string
  variant?: 'button' | 'menuItem'
  renderLayout?: (trigger: React.ReactNode, modal: React.ReactNode) => React.ReactNode
}

const ExportButton = ({
  label,
  variant = 'button',
  renderLayout,
}: ExportButtonProps) => {
  const { formatMessage } = useIntl()
  const toast = useToast()
  const session = useSessionResponse() as Session
  const account = session?.namespaces?.account?.accountName?.value

  const [jobs, setJobs] = useState<Record<ExportType, ExportJobUIState>>(
    createInitialExportJobs
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<ExportType[]>([])

  const exportIdRef = useRef<Partial<Record<ExportType, string>>>({})
  const pollingInProgressRef = useRef<Partial<Record<ExportType, boolean>>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)
  const hasHydratedFromStorageRef = useRef(false)
  const loadedAccountRef = useRef<string | null>(null)

  const updateJob = useCallback(
    (exportType: ExportType, patch: Partial<ExportJobUIState>) => {
      setJobs(prev => ({
        ...prev,
        [exportType]: { ...prev[exportType], ...patch },
      }))
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

  const showErrorToast = useCallback(
    (messageId?: keyof typeof messages, error?: unknown) => {
      toast({
        variant: 'critical',
        message:
          extractApiErrorMessage(error) ??
          (messageId ? formatMessage(messages[messageId]) : undefined) ??
          formatMessage(messages.toastError),
      })
    },
    [formatMessage, toast]
  )

  const fetchExportStatus = useCallback(
    async (exportId: string) => {
      if (!account) {
        throw new Error('MISSING_ACCOUNT')
      }

      return getBulkExportStatusWithRetry(account, exportId)
    },
    [account]
  )

  const clearActiveExport = useCallback(
    (exportType: ExportType) => {
      delete exportIdRef.current[exportType]
      delete pollingInProgressRef.current[exportType]

      if (!hasActivePolling()) {
        clearPollingInterval()
      }
    },
    [clearPollingInterval, hasActivePolling]
  )

  const applyStatusData = useCallback(
    (exportType: ExportType, statusData: BulkExportStatusResult) => {
      const inProgress = statusData.status === 'IN_PROGRESS'
      const patch: Partial<ExportJobUIState> = {
        progressPercentage: getDisplayProgressPercentage(statusData, inProgress),
        exportedRows: statusData.exportedRows ?? null,
      }

      if (statusData.linkToFile) {
        patch.linkToFile = statusData.linkToFile
      }

      updateJob(exportType, patch)
    },
    [updateJob]
  )

  const markExportFailed = useCallback(
    (exportType: ExportType, messageId?: keyof typeof messages, error?: unknown) => {
      clearActiveExport(exportType)
      updateJob(exportType, { ...createIdleExportJob(), state: 'ERROR' })
      showErrorToast(messageId ?? 'toastFailed', error)
    },
    [clearActiveExport, showErrorToast, updateJob]
  )

  const markExportReady = useCallback(
    (exportType: ExportType, statusData: BulkExportStatusResult) => {
      clearActiveExport(exportType)
      applyStatusData(exportType, statusData)

      if (!statusData.linkToFile || !account) {
        markExportFailed(exportType, 'toastCompletedNoFile')

        return
      }

      updateJob(exportType, {
        state: 'READY',
        linkToFile: statusData.linkToFile,
      })

      openExternalDownloadUrl(
        getExportDownloadHref(statusData.linkToFile, account)
      )

      toast({
        variant: 'positive',
        message: formatMessage(messages.toastSuccess),
      })
    },
    [
      account,
      applyStatusData,
      clearActiveExport,
      formatMessage,
      markExportFailed,
      toast,
      updateJob,
    ]
  )

  const pollExportStatus = useCallback(
    async (exportType: ExportType) => {
      const exportId = exportIdRef.current[exportType]

      if (!exportId || pollingInProgressRef.current[exportType]) {
        return
      }

      pollingInProgressRef.current[exportType] = true

      try {
        const statusData = await fetchExportStatus(exportId)

        if (!isMountedRef.current) return

        applyStatusData(exportType, statusData)

        if (statusData.status === 'FAILED') {
          markExportFailed(exportType)

          return
        }

        if (statusData.status === 'COMPLETED') {
          markExportReady(exportType, statusData)

          return
        }

        updateJob(exportType, { state: 'POLLING' })
      } catch (error) {
        showErrorToast('toastStatusError', error)
      } finally {
        pollingInProgressRef.current[exportType] = false
      }
    },
    [
      applyStatusData,
      fetchExportStatus,
      markExportFailed,
      markExportReady,
      showErrorToast,
      updateJob,
    ]
  )

  const pollExportStatusRef = useRef(pollExportStatus)

  pollExportStatusRef.current = pollExportStatus

  useEffect(() => {
    if (!account) {
      hasHydratedFromStorageRef.current = false
      loadedAccountRef.current = null

      return
    }

    if (loadedAccountRef.current === account) {
      return
    }

    loadedAccountRef.current = account

    const stored = loadExportJobsSession(account)
    const { jobs: restoredJobs, exportIds } = restoreExportJobsSession(stored)

    setJobs(restoredJobs)
    exportIdRef.current = exportIds
    hasHydratedFromStorageRef.current = true

    const typesToResume = ALL_EXPORT_TYPES.filter(type => exportIds[type])

    if (typesToResume.length === 0) {
      return
    }

    typesToResume.forEach(exportType => {
      void pollExportStatusRef.current(exportType)
    })
    ensurePollingInterval()
  }, [account, ensurePollingInterval])

  useEffect(() => {
    if (!account || !hasHydratedFromStorageRef.current) {
      return
    }

    saveExportJobsSession(account, {
      jobs,
      exportIds: { ...exportIdRef.current },
    })
  }, [account, jobs])

  const startExportForType = useCallback(
    async (exportType: ExportType) => {
      if (!account) {
        showErrorToast('toastStartError')

        return
      }

      updateJob(exportType, {
        ...createIdleExportJob(),
        state: 'CREATING',
      })

      try {
        const exportId = await createBulkExport(account, exportType)

        if (!isMountedRef.current) return

        if (!exportId) {
          markExportFailed(exportType, 'toastStartError')

          return
        }

        exportIdRef.current[exportType] = exportId
        updateJob(exportType, { state: 'POLLING' })
        await pollExportStatus(exportType)
        ensurePollingInterval()
      } catch (error) {
        markExportFailed(exportType, 'toastStartError', error)
      }
    },
    [
      account,
      ensurePollingInterval,
      markExportFailed,
      pollExportStatus,
      showErrorToast,
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

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      clearPollingInterval()
    }
  }, [clearPollingInterval])

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
    const percentage = job.progressPercentage
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
        job.state === 'READY' && job.linkToFile && account ? (
          <ExportDownloadLink
            account={account}
            downloadLink={job.linkToFile}
            label={formatMessage(messages.modalDownloadButton)}
          />
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
      closeOnOverlayClick
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
