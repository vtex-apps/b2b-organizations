import React, { Fragment, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'
import { useToast } from '@vtex/admin-ui'

import { organizationMessages as messages } from '../utils/messages'
import { organizationBulkAction } from '../utils/organizationBulkAction'
import GET_SELLERS_PAGINATED from '../../graphql/getSellersPaginated.graphql'

export interface Seller {
  sellerId: string
  name?: string
}

export interface SellerItem {
  id: string
  name: string
}

const pageSize = 25

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
  const toast = useToast()

  /**
   * States
   */
  const [sellerOptions, setSellerOptions] = useState<Seller[]>([])

  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(25)

  /**
   * Queries
   */
  const { data: sellersData, loading, refetch } = useQuery<{
    getSellersPaginated: {
      pagination: {
        page: number
        pageSize: number
        total: number
      }
      items: SellerItem[]
    }
  }>(GET_SELLERS_PAGINATED, {
    variables: { page: from, pageSize: to },
    onCompleted: data => {
      if (!data?.getSellersPaginated?.items) {
        return
      }

      const options = data.getSellersPaginated.items.map(
        ({ name, id }: SellerItem) => ({
          name,
          sellerId: id,
        })
      )

      setSellerOptions(options)
    },
    onError: error => {
      toast({ variant: 'critical', message: error.message })
    },
  })

  const totalItems = sellersData?.getSellersPaginated?.pagination?.total ?? 0

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

  const handlePrev = () => {
    if (from === 0) return

    setFrom(Math.max(from - pageSize, 0))
    setTo(Math.max(to - pageSize, pageSize))

    refetch({
      page: from,
      pageSize: to,
    })
  }

  const handleNext = () => {
    if (totalItems === to) return

    setFrom(from + pageSize)
    setTo(to + pageSize)

    refetch({
      page: from,
      pageSize: to,
    })
  }

  const handleRowsChange = (newPageSize: number) => {
    setFrom(0)
    setTo(newPageSize)

    refetch({
      page: 0,
      pageSize: newPageSize,
    })
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
            bulkActions={organizationBulkAction(
              handleRemoveSellers,
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
            loading={loading}
            schema={getSchema('availableSellers')}
            bulkActions={organizationBulkAction(
              handleAddSellers,
              messages.addToOrg,
              formatMessage
            )}
            items={sellerOptions}
            pagination={{
              onNextClick: handleNext,
              onPrevClick: handlePrev,
              onRowsChange: handleRowsChange,
              currentItemFrom: from + 1,
              currentItemTo: Math.min(to, totalItems),
              textShowRows: formatMessage(messages.showRows),
              textOf: formatMessage(messages.of),
              totalItems,
              rowsOptions: [25, 50, 100],
            }}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsSellers
