import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import { PageBlock, Table, IconCheck, Button, Checkbox } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'

import { organizationSettingsMessages as messages } from './utils/messages'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import SELECTED_SALES_CHANNELS from '../graphql/getSelectedChannels.graphql'
import UPDATE_SALES_CHANNELS from '../graphql/updateSalesChannels.graphql'
import UPDATE_B2B_SETTINGS from '../graphql/updateB2BSettings.graphql'
import GET_B2B_SETTINGS from '../graphql/getB2BSettings.graphql'

interface SalesChannel {
  channelId: string
  name: string
  tableName: string
}

interface CellRendererProps<RowType> {
  cellData: unknown
  rowData: RowType
  updateCellMeasurements: () => void
}

const OrganizationSettings: FunctionComponent = () => {
  const defaultSchema = {
    properties: {
      tableName: {
        title: 'Sales Channels',
      },
    },
  }

  const showToast = useToast()
  const { formatMessage } = useIntl()
  const [salesChannels, setSalesChannels] = useState([] as SalesChannel[])
  const [selectedChannels, setSelectedChannel] = useState([] as SalesChannel[])
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    autoApprove: false,
    uiSettings: {
      clearCart: false,
      showModal: false,
    },
  })

  const { data } = useQuery(GET_SALES_CHANNELS, {
    ssr: false,
  })

  const { data: selectedData, refetch } = useQuery(SELECTED_SALES_CHANNELS, {
    ssr: false,
  })

  const { data: dataSettings, refetch: refetchSettings } = useQuery(
    GET_B2B_SETTINGS,
    {
      ssr: false,
    }
  )

  const [updateSalesChannels] = useMutation(UPDATE_SALES_CHANNELS)
  const [updateB2BSettings] = useMutation(UPDATE_B2B_SETTINGS)

  useEffect(() => {
    if (data) {
      const options: any[] = []

      data.salesChannels.forEach((item: { id: string; name: string }) => {
        options.push({
          channelId: item.id,
          name: item.name,
          tableName: `${item.name} (${item.id})`,
        })
      })
      setSalesChannels(options)
    }
  }, [data])

  useEffect(() => {
    if (selectedData) {
      const selectedOptions: any[] = []

      selectedData.getSalesChannels.forEach(
        (item: { id: string; name: string }) => {
          selectedOptions.push({
            channelId: item.id,
            name: item.name,
            tableName: `${item.name} (${item.id})`,
          })
        }
      )
      setSelectedChannel(selectedOptions)
    }
  }, [selectedData])

  useEffect(() => {
    if (!dataSettings) {
      return
    }

    const { getB2BSettings } = dataSettings

    setSettings({
      autoApprove: getB2BSettings?.autoApprove,
      uiSettings: {
        clearCart: getB2BSettings?.uiSettings?.clearCart,
        showModal: getB2BSettings?.uiSettings?.showModal,
      },
    })
  }, [dataSettings])

  const getSchema = () => {
    const cellRenderer = ({
      rowData: { channelId, name, tableName },
    }: CellRendererProps<SalesChannel>) => {
      const assigned = selectedChannels.some(
        channel => channel.channelId === channelId
      )

      return (
        <span className={assigned ? 'c-disabled' : ''}>
          {tableName ?? name}
          {assigned && <IconCheck />}
        </span>
      )
    }

    return {
      properties: {
        name: {
          title: 'Sales Channels',
          ...{ cellRenderer },
        },
      },
    }
  }

  const handleUpdateRequest = () => {
    const channels = selectedChannels.map((item: any) => {
      return {
        id: item.channelId,
        name: item.name,
      }
    })

    setLoading(true)

    const promises = []

    promises.push(
      updateSalesChannels({
        variables: {
          channels,
        },
      }).catch(error => {
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
    )
    promises.push(
      updateB2BSettings({
        variables: {
          input: settings,
        },
      })
    )

    Promise.all(promises)
      .then(() => {
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        refetchSettings()
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const handleAddBinding = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newBindings = [] as SalesChannel[]

    selectedRows.forEach((row: any) => {
      if (
        !selectedChannels.some(channel => channel.channelId === row.channelId)
      ) {
        newBindings.push({
          channelId: row.channelId,
          name: row.name,
          tableName: `${row.name} (${row.channelId})`,
        })
      }
    })

    setSelectedChannel([...selectedChannels, ...newBindings])
  }

  const handleRemoveBinding = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const bindingToRemove = [] as string[]

    selectedRows.forEach((row: any) => {
      bindingToRemove.push(row.channelId)
    })

    const newBindingList = selectedChannels.filter(
      channel => !bindingToRemove.includes(channel.channelId)
    )

    setSelectedChannel(newBindingList)
  }

  const bulkActions = (handleCallback: (params: any) => void) => {
    return {
      texts: {
        rowsSelected: (qty: number) =>
          formatMessage(messages.selectedRows, {
            qty,
          }),
      },
      main: {
        label: formatMessage(
          handleCallback.name === 'handleRemoveBinding'
            ? messages.removeFromBinding
            : messages.addToBinding
        ),
        handleCallback,
      },
    }
  }

  return (
    <PageBlock
      title={formatMessage(messages.tablePageTitle)}
      titleAside={
        <span className="mt4 flex justify-end mb4">
          <Button
            isLoading={loading}
            variation="primary"
            onClick={() => handleUpdateRequest()}
          >
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.save" />
          </Button>
        </span>
      }
    >
      <div>
        <h3 className="t-heading-3">General Settings</h3>
        <div className="pa6">
          <div className="mb4">
            <Checkbox
              checked={settings.autoApprove}
              id="autoApprove"
              name="autoApprove"
              onChange={() => {
                setSettings({ ...settings, autoApprove: !settings.autoApprove })
              }}
              label={formatMessage(messages.autoApprove)}
            />
          </div>
          <div className="mb4">
            <Checkbox
              checked={settings.uiSettings.showModal}
              id="showModal"
              name="showModal"
              onChange={() => {
                setSettings({
                  ...settings,
                  uiSettings: {
                    ...settings.uiSettings,
                    showModal: !settings.uiSettings.showModal,
                  },
                })
              }}
              label={formatMessage(messages.showModal)}
            />
          </div>
          <div className="mb4">
            <Checkbox
              checked={settings.uiSettings.clearCart}
              id="clearCart"
              name="clearCart"
              onChange={() => {
                setSettings({
                  ...settings,
                  uiSettings: {
                    ...settings.uiSettings,
                    clearCart: !settings.uiSettings.clearCart,
                  },
                })
              }}
              label={formatMessage(messages.clearCart)}
            />
          </div>
        </div>
      </div>
      <div className="w-100 mt4 mb4">
        <h3 className="t-heading-3">{formatMessage(messages.bindingTitle)}</h3>
      </div>
      <div className="flex">
        <div className="w-50">
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-settings-select.binding.selected" />
          </h4>
          {selectedChannels ? (
            <Table
              fullWidth
              schema={defaultSchema}
              items={selectedChannels}
              bulkActions={bulkActions(handleRemoveBinding)}
            />
          ) : null}
        </div>
        <div className="w-50">
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-settings-select.binding.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={salesChannels}
            bulkActions={bulkActions(handleAddBinding)}
          />
        </div>
      </div>
    </PageBlock>
  )
}

export default OrganizationSettings
