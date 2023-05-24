import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import { PageBlock, Table, IconCheck, Button, Checkbox } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'

import {
  organizationSettingsMessages as messages,
  organizationMessages,
} from './utils/messages'
import { organizationBulkAction } from './utils/organizationBulkAction'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import SELECTED_SALES_CHANNELS from '../graphql/getSelectedChannels.graphql'
import UPDATE_SALES_CHANNELS from '../graphql/updateSalesChannels.graphql'
import UPDATE_B2B_SETTINGS from '../graphql/updateB2BSettings.graphql'
import GET_B2B_SETTINGS from '../graphql/getB2BSettings.graphql'
import GET_PAYMENT_TERMS from '../graphql/getPaymentTerms.graphql'
import type { PaymentTerm } from './OrganizationDetails/OrganizationDetailsPayTerms'
import GET_PRICE_TABLES from '../graphql/getPriceTables.graphql'

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
    businessReadOnly: false,
    stateReadOnly: false,
    defaultPaymentTerms: [] as any,
    defaultPriceTables: [] as any,
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

  const { data: paymentTermsData } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  const { data: priceTablesData } = useQuery(GET_PRICE_TABLES, { ssr: false })

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
      businessReadOnly: getB2BSettings?.businessReadOnly,
      stateReadOnly: getB2BSettings?.stateReadOnly,
      defaultPaymentTerms: getB2BSettings?.defaultPaymentTerms ?? [],
      defaultPriceTables: getB2BSettings?.defaultPriceTables ?? [],
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
          variant: 'critical',
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
          variant: 'positive',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        refetchSettings()
        setLoading(false)
      })
      .catch(error => {
        console.error(error)
        showToast({
          variant: 'critical',
          message: formatMessage(messages.toastUpdateFailure),
        })
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
              checked={settings.businessReadOnly}
              id="businessReadOnly"
              name="businessReadOnly"
              onChange={() => {
                setSettings({
                  ...settings,
                  businessReadOnly: !settings.businessReadOnly,
                })
              }}
              label={formatMessage(messages.businessReadOnly)}
            />
          </div>
          <div className="mb4">
            <Checkbox
              checked={settings.stateReadOnly}
              id="stateReadOnly"
              name="stateReadOnly"
              onChange={() => {
                setSettings({
                  ...settings,
                  stateReadOnly: !settings.stateReadOnly,
                })
              }}
              label={formatMessage(messages.stateReadOnly)}
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
          <div className="mb6">
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
          <div className="flex br3 pa6 b--muted-4 ba">
            <div className="mb4 w-50">
              <h2 className="mb4">
                {formatMessage(organizationMessages.paymentTerms)}
              </h2>
              {paymentTermsData?.getPaymentTerms
                .sort((a: PaymentTerm, b: PaymentTerm) => {
                  return a.name > b.name ? 1 : -1
                })
                .map((payment: PaymentTerm) => (
                  <div className="mb4">
                    <Checkbox
                      name={payment.name}
                      id={payment.name}
                      label={payment.name}
                      checked={settings?.defaultPaymentTerms?.some(
                        (item: PaymentTerm) => item.id === payment.id
                      )}
                      onChange={() => {
                        const defaultPaymentTerms = settings.defaultPaymentTerms?.some(
                          (item: PaymentTerm) => item.id === payment.id
                        )
                          ? settings.defaultPaymentTerms?.filter(
                              (item: PaymentTerm) => item.id !== payment.id
                            )
                          : [...settings.defaultPaymentTerms, payment]

                        setSettings({
                          ...settings,
                          defaultPaymentTerms,
                        })
                      }}
                    />
                  </div>
                ))}
            </div>
            <div className="mb4 w-50">
              <h2 className="mb4">
                {formatMessage(organizationMessages.priceTables)}
              </h2>
              {priceTablesData?.priceTables.map((priceTable: string) => (
                <div className="mb4">
                  <Checkbox
                    name={priceTable}
                    id={priceTable}
                    label={priceTable}
                    checked={settings?.defaultPriceTables?.some(
                      (item: string) => item === priceTable
                    )}
                    onChange={() => {
                      const defaultPriceTables = settings.defaultPriceTables?.some(
                        (item: string) => item === priceTable
                      )
                        ? settings.defaultPriceTables?.filter(
                            (item: string) => item !== priceTable
                          )
                        : [...settings.defaultPriceTables, priceTable]

                      setSettings({
                        ...settings,
                        defaultPriceTables,
                      })
                    }}
                  />
                </div>
              ))}
            </div>
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
              bulkActions={organizationBulkAction(
                handleRemoveBinding,
                messages.removeFromBinding,
                formatMessage
              )}
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
            bulkActions={organizationBulkAction(
              handleAddBinding,
              messages.addToBinding,
              formatMessage
            )}
          />
        </div>
      </div>
    </PageBlock>
  )
}

export default OrganizationSettings
