import React, { useEffect, useState, useContext } from 'react'
import { useIntl } from 'react-intl'
import { useQuery, useMutation } from 'react-apollo'
import {
  Alert,
  Table,
  IconCheck,
  Button,
  ToastContext,
  Checkbox,
} from 'vtex.styleguide'

import type { PriceTable } from './OrganizationDetails/OrganizationDetailsPriceTables'
import type { PaymentTerm } from './OrganizationDetails/OrganizationDetailsPayTerms'
import {
  organizationMessages as messages,
  organizationSettingsMessages as settingMessage,
} from './utils/messages'
import GET_PRICE_TABLES from '../graphql/getPriceTables.graphql'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import GET_PAYMENT_TERMS from '../graphql/getPaymentTerms.graphql'
import GET_B2BSETTINGS from '../graphql/getB2BSettings.graphql'
import SAVE_B2BSETTINGS from '../graphql/saveB2BSettings.graphql'

export interface CellRendererProps<RowType> {
  cellData: unknown
  rowData: RowType
  updateCellMeasurements: () => void
}

export default function AutoApproveSettings() {
  const { formatMessage } = useIntl()

  const [priceTableOptions, setPriceTableOptions] = useState([] as PriceTable[])
  const [paymentTermsOptions, setPaymentTermsOptions] = useState(
    [] as PaymentTerm[]
  )

  const [priceTablesState, setPriceTablesState] = useState([] as string[])
  const [paymentTermsState, setPaymentTermsState] = useState(
    [] as PaymentTerm[]
  )

  const [autoApproveState, setAutoApproveState] = useState(false)

  const [alertState, setAlertState] = useState(false)

  /**
   * Queries
   */
  const { data: priceTablesData } = useQuery(GET_PRICE_TABLES, { ssr: false })
  const { data: salesChannelsData } = useQuery(GET_SALES_CHANNELS, {
    ssr: false,
  })

  const { data: paymentTermsData } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  const { data: b2bSettings } = useQuery(GET_B2BSETTINGS, {
    ssr: false,
  })

  const paymentTerm = b2bSettings?.getB2BSettings?.defaultPaymentTerms
  const autoApprove = b2bSettings?.getB2BSettings?.autoApprove
  const priceTables = b2bSettings?.getB2BSettings?.defaultPriceTables

  const [saveB2BSettingsRequest] = useMutation(SAVE_B2BSETTINGS)

  const { showToast } = useContext(ToastContext)

  const translateMessage = (message: MessageDescriptor) => {
    return formatMessage(message)
  }

  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = translateMessage(message)
    const action = undefined

    showToast({ message: translatedMessage, duration: 5000, action })
  }

  /**
   * Effects
   */
  useEffect(() => {
    if (b2bSettings?.getB2BSettings) {
      toastMessage(settingMessage.toastUpdateSuccess)
      setAutoApproveState(autoApprove)
      setPriceTablesState(priceTables)
      const selectedPaymentTerms = paymentTerm?.map((paymentTerms: any) => {
        return { name: paymentTerms.name, paymentTermId: paymentTerms.id }
      })

      setPaymentTermsState(selectedPaymentTerms)
    }

    if (
      !priceTablesData?.priceTables?.length ||
      !salesChannelsData?.salesChannels?.length
    ) {
      return
    }

    const filteredPaymentTerms =
      paymentTermsData?.getPaymentTerms.map((paymentTerms: any) => {
        return { name: paymentTerms.name, paymentTermId: paymentTerms.id }
      }) ?? []

    setPaymentTermsOptions(filteredPaymentTerms)

    const options = [] as PriceTable[]

    salesChannelsData.salesChannels.forEach(
      (channel: { id: string; name: string }) => {
        options.push({
          tableId: channel.id,
          name: `${channel.name} (${channel.id})`,
        })
      }
    )

    priceTablesData.priceTables.forEach((priceTable: string) => {
      if (!options.find(option => option.tableId === priceTable)) {
        options.push({ tableId: priceTable })
      }
    })

    setPriceTableOptions(options)
  }, [priceTablesData, salesChannelsData, paymentTermsData])

  const bulkActions = (handleCallback: (params: any) => void) => {
    return {
      texts: {
        rowsSelected: (qty: number) =>
          formatMessage(messages.selectedRows, {
            qty,
          }),
      },
      main: {
        label: formatMessage(messages.removeFromOrg),
        handleCallback,
      },
    }
  }

  const saveB2BSettings = () => {
    const selectedPaymentTerms = paymentTermsState?.map((paymentTerms: any) => {
      return { name: paymentTerms.name, id: paymentTerms.paymentTermId }
    })

    const B2BSettingsInput = {
      autoApprove: autoApproveState,
      defaultPaymentTerms: selectedPaymentTerms,
      defaultPriceTables: priceTablesState,
    }

    saveB2BSettingsRequest({
      variables: {
        input: B2BSettingsInput,
      },
    })
      .then(() => {
        setAlertState(true)
      })
      .catch(() => {
        toastMessage(settingMessage.toastUpdateFailure)
      })
  }

  const getSchema = (
    type?: 'availablePriceTables' | 'availableCollections' | 'availablePayments'
  ) => {
    let cellRenderer

    switch (type) {
      case 'availablePriceTables':
        cellRenderer = ({
          rowData: { tableId, name },
        }: CellRendererProps<PriceTable>) => {
          const assigned = priceTablesState.includes(tableId)

          return (
            <span className={assigned ? 'c-disabled' : ''}>
              {name ?? tableId}
              {assigned && <IconCheck />}
            </span>
          )
        }

        break

      case 'availablePayments':
        cellRenderer = ({
          rowData: { name },
        }: CellRendererProps<PaymentTerm>) => {
          const assigned = paymentTermsState.some(
            payment => payment.name === name
          )

          return (
            <span className={assigned ? 'c-disabled' : ''}>
              {name}
              {assigned && <IconCheck />}
            </span>
          )
        }

        break

      default:
        break
    }

    return {
      properties: {
        name: {
          title: formatMessage(messages.detailsColumnName),
          ...(cellRenderer && { cellRenderer }),
        },
      },
    }
  }

  const handleAddPriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newPriceTables = [] as string[]

    selectedRows.forEach((row: PriceTable) => {
      if (!priceTablesState.includes(row.tableId)) {
        newPriceTables.push(row.tableId)
      }
    })
    setPriceTablesState((prevState: any) => [...prevState, ...newPriceTables])
  }

  const handleAddPaymentTerms = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newPaymentTerms = [] as PaymentTerm[]

    selectedRows.forEach((row: any) => {
      if (
        !paymentTermsState.some(
          paymentTerms => paymentTerms.paymentTermId === row.paymentTermId
        )
      ) {
        newPaymentTerms.push({
          name: row.name,
          paymentTermId: row.paymentTermId,
        })
      }
    })

    setPaymentTermsState([...paymentTermsState, ...newPaymentTerms])
  }

  const handleRemovePriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const priceTablesToRemove = [] as string[]

    selectedRows.forEach((row: PriceTable) => {
      priceTablesToRemove.push(row.tableId)
    })

    const newPriceTablesList = priceTablesState.filter(
      priceTable => !priceTablesToRemove.includes(priceTable)
    )

    setPriceTablesState(newPriceTablesList)
  }

  const handleRemovePaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const paymentTermsToRemove = [] as number[]

    selectedRows.forEach(row => {
      paymentTermsToRemove.push(row.paymentTermId)
    })

    const newPaymentTerms = paymentTermsState.filter(
      paymentTerms => !paymentTermsToRemove.includes(paymentTerms.paymentTermId)
    )

    setPaymentTermsState(newPaymentTerms)
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <Checkbox
          checked={autoApproveState}
          id="option-1"
          label="Auto approve new organizations"
          name="default-checkbox-group"
          onChange={() => setAutoApproveState(!autoApproveState)}
          value="option-1"
        />
        <Button
          variation="primary"
          onClick={() => {
            saveB2BSettings()
          }}
        >
          Save Settings
        </Button>
      </div>
      <div className="flex w-100">
        <div style={{ marginRight: '4rem' }}>
          <h4 className="mt6">Selected Price Terms</h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={paymentTermsState}
            bulkActions={bulkActions(handleRemovePaymentTerms)}
          />
        </div>
        <div>
          <h4 className="mt6">Available Payment terms</h4>
          <Table
            fullWidth
            schema={getSchema('availablePayments')}
            items={paymentTermsOptions}
            bulkActions={bulkActions(handleAddPaymentTerms)}
          />
        </div>
      </div>
      <div className="flex w-100">
        <div style={{ marginRight: '4rem' }}>
          <h4 className="mt6">Selected Price tables</h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={priceTablesState.map(priceTable => {
              return {
                tableId: priceTable,
                name:
                  priceTableOptions.find(
                    option => option.tableId === priceTable
                  )?.name ?? priceTable,
              }
            })}
            bulkActions={bulkActions(handleRemovePriceTables)}
          />
        </div>
        <div>
          <h4 className="mt6">Available Price tables</h4>
          <Table
            fullWidth
            schema={getSchema('availablePriceTables')}
            items={priceTableOptions}
            bulkActions={bulkActions(handleAddPriceTables)}
          />
        </div>
      </div>
      <div className="absolute">
        {alertState ? (
          <Alert
            type="success"
            onClose={() => setAlertState(false)}
            autoClose={5000}
          >
            Settings were updated successfully.
          </Alert>
        ) : null}
      </div>
    </>
  )
}
