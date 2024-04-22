import React, { Fragment, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import { organizationBulkAction } from '../utils/organizationBulkAction'
import GET_PRICE_TABLES from '../../graphql/getPriceTables.graphql'

export interface PriceTable {
  tableId: string
  name?: string
}

const OrganizationDetailsPriceTables = ({
  getSchema,
  priceTablesState,
  setPriceTablesState,
}: {
  getSchema: (argument?: any) => any
  priceTablesState: string[]
  setPriceTablesState: (value: any) => void
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()

  /**
   * States
   */
  const [priceTableOptions, setPriceTableOptions] = useState([] as PriceTable[])

  /**
   * Queries
   */
  const { data: priceTablesData, loading } = useQuery(GET_PRICE_TABLES, {
    ssr: false,
  })

  /**
   * Effects
   */
  useEffect(() => {
    if (!priceTablesData?.priceTables?.length) {
      return
    }

    const options = [] as PriceTable[]

    priceTablesData.priceTables.forEach((priceTable: string) => {
      if (!options.find(option => option.tableId === priceTable)) {
        options.push({ tableId: priceTable })
      }
    })

    setPriceTableOptions(options)
  }, [priceTablesData])

  /**
   * Functions
   */
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

  return (
    <Fragment>
      <PageBlock variation="half" title={formatMessage(messages.priceTables)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
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
            bulkActions={organizationBulkAction(
              handleRemovePriceTables,
              messages.removeFromOrg,
              formatMessage
            )}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema('availablePriceTables')}
            items={priceTableOptions}
            loading={loading}
            bulkActions={organizationBulkAction(
              handleAddPriceTables,
              messages.addToOrg,
              formatMessage
            )}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsPriceTables
