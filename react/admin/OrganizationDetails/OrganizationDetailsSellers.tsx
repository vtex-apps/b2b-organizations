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

interface GetSellersPaginatedQueryResponse {
  getSellersPaginated: {
    items: SellerItem[]
    pagination: {
      page: number
      pageSize: number
      total: number
    }
  }
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
  const toast = useToast()
  const { formatMessage } = useIntl()

  /**
   * States
   */
  const [variables, setVariables] = useState({ page: 1, pageSize: 25 })
  const [sellerOptions, setSellerOptions] = useState<Seller[]>([])

  /**
   * Queries
   */
  const { data: sellersData, loading, refetch } = useQuery<
    GetSellersPaginatedQueryResponse
  >(GET_SELLERS_PAGINATED, {
    variables,
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

  const handleNext = () => {
    if (variables.page * variables.pageSize >= totalItems) return

    setVariables(prev => ({ ...prev, page: prev.page + 1 }))

    refetch({ page: variables.page + 1, pageSize: variables.pageSize })
  }

  const handlePrev = () => {
    if (variables.page === 1) return

    setVariables(prev => ({ ...prev, page: prev.page - 1 }))

    refetch({ page: variables.page - 1, pageSize: variables.pageSize })
  }

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setVariables({ page: 1, pageSize: +value })

    refetch({
      page: 1,
      pageSize: +value,
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
              selectedOption: variables.pageSize,
              currentItemFrom: (variables.page - 1) * variables.pageSize + 1,
              currentItemTo: Math.min(
                variables.page * variables.pageSize,
                totalItems
              ),
              textShowRows: formatMessage(messages.showRows),
              textOf: formatMessage(messages.of),
              rowsOptions: [25, 50, 100],
              totalItems,
            }}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsSellers
