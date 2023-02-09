import React, { Fragment, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import GET_SELLERS from '../../graphql/getSellers.graphql'

export interface Seller {
  sellerId: string
  name?: string
}

export interface SellerItem {
  id: string
  name: string
}

const OrganizationDetailsSellers = ({
  getSchema,
  sellersState,
  setSellersState,
}: {
  getSchema: (argument?: any) => any
  sellersState: Seller[]
  setSellersState: (value: any) => void
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()

  /**
   * States
   */
  const [sellerOptions, setSellerOptions] = useState([] as Seller[])

  /**
   * Queries
   */
  const { data: sellersData } = useQuery(GET_SELLERS)

  /**
   * Effects
   */
  useEffect(() => {
    if (!sellersData?.getSellers?.length) {
      return
    }

    const options = [] as Seller[]

    sellersData.getSellers.forEach(({ name, id }: SellerItem) => {
      if (!options.find(option => option.sellerId === id)) {
        options.push({ name, sellerId: id })
      }
    })
    options.sort(
      (a: Seller, b: Seller) => a.name?.localeCompare(b.name ?? '') ?? 0
    )
    setSellerOptions(options)
  }, [sellersData])

  /**
   * Functions
   */
  const handleRemoveSellers = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const sellersToRemove = [] as Seller[]

    selectedRows.forEach((row: Seller) => {
      sellersToRemove.push(row)
    })

    const newSellersList = sellersState.filter(
      seller =>
        !sellersToRemove.some(
          removeSeller => removeSeller.sellerId === seller.sellerId
        )
    )

    setSellersState(newSellersList)
  }

  const handleAddSellers = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newSellers = [] as Seller[]

    selectedRows.forEach((row: Seller) => {
      if (!sellersState.some(seller => seller.sellerId === row.sellerId)) {
        newSellers.push(row)
      }
    })

    setSellersState((prevState: any) => [...prevState, ...newSellers])
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
          handleCallback.name === 'handleRemoveSellers'
            ? messages.removeFromOrg
            : messages.addToOrg
        ),
        handleCallback,
      },
    }
  }

  return (
    <Fragment>
      <PageBlock variation="half" title={formatMessage(messages.sellers)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={sellersState}
            bulkActions={bulkActions(handleRemoveSellers)}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema('availableSellers')}
            bulkActions={bulkActions(handleAddSellers)}
            items={sellerOptions}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsSellers
