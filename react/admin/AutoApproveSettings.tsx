import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useQuery } from 'react-apollo'

import type { PriceTable } from './OrganizationDetails/OrganizationDetailsPriceTables'
import type { PaymentTerm } from './OrganizationDetails/OrganizationDetailsPayTerms'

import { organizationMessages as messages } from './utils/messages'
import GET_PRICE_TABLES from '../graphql/getPriceTables.graphql'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import GET_PAYMENT_TERMS from '../graphql/getPaymentTerms.graphql'

import { 
    Table, 
    IconCheck, 
    // Tag, 
    Checkbox 
} from 'vtex.styleguide'

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

  /**
   * Effects
   */
  useEffect(() => {
    if (
      !priceTablesData?.priceTables?.length ||
      !salesChannelsData?.salesChannels?.length
    ) {
      return
    }

    const paymentTerms =
      paymentTermsData?.getPaymentTerms.map((paymentTerm: any) => {
        return { name: paymentTerm.name, paymentTermId: paymentTerm.id }
      }) ?? []

    setPaymentTermsOptions(paymentTerms)

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
        console.log(priceTablesState, newPriceTables)
        setPriceTablesState((prevState: any) => [...prevState, ...newPriceTables])
      }

      const handleAddPaymentTerms = (rowParams: {
        selectedRows: PaymentTerm[]
      }) => {
        const { selectedRows = [] } = rowParams
        const newPaymentTerms = [] as PaymentTerm[]
    
        selectedRows.forEach((row: any) => {
          if (
            !paymentTermsState.some(
              paymentTerm => paymentTerm.paymentTermId === row.paymentTermId
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

    return (
        <>
        <div>
        <Checkbox
    checked={autoApproveState}
    id="option-1"
    label="Auto approve new organizations"
    name="default-checkbox-group"
    onChange={() => setAutoApproveState(!autoApproveState)}
    value="option-1"
  />
        </div>
        <Table
            fullWidth
            schema={getSchema('availablePayments')}
            items={paymentTermsOptions}
            bulkActions={bulkActions(handleAddPaymentTerms)}
          />
        <Table
            fullWidth
            schema={getSchema('availablePriceTables')}
            items={priceTableOptions}
            bulkActions={bulkActions(handleAddPriceTables)}
          />
        </>
    )
}
