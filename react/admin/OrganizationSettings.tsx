import type { FunctionComponent } from 'react'
import React, { Fragment, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import { PageBlock, Table } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'

import { organizationSettingsMessages as messages } from './utils/messages'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import SELECTED_SALES_CHANNELS from '../graphql/getSelectedChannels.graphql'
import UPDATE_SALES_CHANNELS from '../graphql/updateSalesChannels.graphql'

const OrganizationSettings: FunctionComponent = () => {
  const defaultSchema = {
    properties: {
      tableName: {
        title: 'Sales Channels',
        width: 300,
      },
    },
  }

  const showToast = useToast()
  const { formatMessage } = useIntl()
  const [salesChannels, setsalesChannels] = useState<any[]>([])
  const [selectedChannels, setselectedChannel] = useState<any[]>([])

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
          tableId: item.id,
          name: item.name,
          tableName: `${item.name} (${item.id})`,
        })
      })
      setsalesChannels(options)
    }
  }, [data])

  useEffect(() => {
    if (selectedData) {
      const selectedOptions: any[] = []
      selectedData.getSalesChannels.forEach(
        (item: { id: string; name: string }) => {
          selectedOptions.push({
            tableId: item.id,
            name: item.name,
            tableName: `${item.name} (${item.id})`,
          })
        }
      )
      setselectedChannel(selectedOptions)
    }
  }, [selectedData])

  const handleAddRequest = (param: any) => {
    const channels = param.selectedRows.map((item: any) => {
      return {
        id: item.tableId,
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
          type: 'success',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
  }

  return (
    <Fragment>
      <PageBlock variation="half" title={formatMessage(messages.bindingTitle)}>
        <div>
          <h4>
            <FormattedMessage id="admin/b2b-organizations.organization-settings-select.binding.accessible" />
          </h4>
          <Table
            schema={defaultSchema}
            items={salesChannels}
            bulkActions={{
              fixed: true,
              texts: {
                secondaryActionsLabel: 'Actions',
                rowsSelected: function selectAll(qty: string) {
                  return <React.Fragment>Selected rows: {qty}</React.Fragment>
                },
              },
              main: {
                label: 'Add Sales Channels',
                handleCallback: (param: any) => {
                  handleAddRequest(param)
                },
              },
            }}
          />
        </div>

        <div>
          <h4>
            <FormattedMessage id="admin/b2b-organizations.organization-settings-select.binding.selected" />
          </h4>
          {selectedChannels ? (
            <Table schema={defaultSchema} items={selectedChannels} />
          ) : null}
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationSettings
