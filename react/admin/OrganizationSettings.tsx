import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import { PageBlock, Table, IconCheck, Button } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'

import { organizationSettingsMessages as messages } from './utils/messages'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import SELECTED_SALES_CHANNELS from '../graphql/getSelectedChannels.graphql'
import UPDATE_SALES_CHANNELS from '../graphql/updateSalesChannels.graphql'

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

  const { data } = useQuery(GET_SALES_CHANNELS, {
    ssr: false,
  })

  const { data: selectedData, refetch } = useQuery(SELECTED_SALES_CHANNELS, {
    ssr: false,
  })

  const [updateSalesChannels] = useMutation(UPDATE_SALES_CHANNELS)

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

  const getSchema = () => {
    let cellRenderer

    cellRenderer = ({
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
          ...({ cellRenderer }),
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

    updateSalesChannels({
      variables: {
        channels,
      },
    })
      .then(() => {
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
      })
      .catch(error => {
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
  }

  const handleAddBinding = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newBindings = [] as SalesChannel[]

    selectedRows.forEach((row: any) => {
      if (
        !selectedChannels.some(
          channel => channel.channelId === row.channelId
        )
      ) {
        newBindings.push({ channelId: row.channelId, name: row.name, tableName: `${row.name} (${row.channelId})`})
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
      variation="half"
      title={formatMessage(messages.bindingTitle)}
      titleAside={
        <span className="mt4 flex justify-end">
          <Button
            variation="primary"
            onClick={() => handleUpdateRequest()}
          >
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.save" />
          </Button>
        </span>
      }
    >
        <div>
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
        <div>
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
      </PageBlock>
  )
}

export default OrganizationSettings
