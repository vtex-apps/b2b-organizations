import React, { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import {
  csx,
  DataView,
  DataViewHeader,
  Flex,
  FlexSpacer,
  Pagination,
  Table,
  THead,
  THeadCell,
  TBody,
  TBodyRow,
  TBodyCell,
  useDataViewState,
  usePaginationState,
  useTableState,
} from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'

import {
  INITIAL_FETCH_LIST_OPTIONS,
  useOrganizationsList,
} from '../organizations/hooks'
import type { FetchListOptions } from '../organizations/hooks'
import { useNavigateToDetailsPage } from '../organizations/navigate'
import { useOrgsTableColumns } from '../organizations/table'
import OrganizationsListSearch from './OrganizationsList/OrganizationsListSearch'
import OrganizationsListStatusFilter from './OrganizationsList/OrganizationsListStatusFilter'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

const OrganizationsList: FunctionComponent = () => {
  const navigateToDetailsPage = useNavigateToDetailsPage()
  const columns = useOrgsTableColumns()

  const [refetchOptions, setRefetchOptions] = useState(
    INITIAL_FETCH_LIST_OPTIONS
  )

  const { data: fetchedOrgs, loading, refetch } = useOrganizationsList()

  const view = useDataViewState()
  const { data, getBodyCell, getHeadCell, getTable } = useTableState({
    status: view.status,
    columns,
    items: fetchedOrgs?.getOrganizations?.data,
    length: 10,
  })

  const paginationState = usePaginationState({
    pageSize: INITIAL_FETCH_LIST_OPTIONS.pageSize,
    onNextPage: () => {
      updateTableItems({
        page: refetchOptions.page + 1,
      })
    },
    onPrevPage: () => {
      updateTableItems({
        page: refetchOptions.page - 1,
      })
    },
  })

  useEffect(() => {
    view.setStatus({
      type: loading ? 'loading' : 'ready',
    })
  }, [loading])

  function updateTableItems(options: Partial<FetchListOptions>) {
    const newRefetchOptions = {
      ...refetchOptions,
      ...options,
    }

    setRefetchOptions(newRefetchOptions)
    refetch(newRefetchOptions)

    if (options.page !== refetchOptions.page && options.page === 1) {
      paginationState.paginate({ type: 'reset' })
    }
  }

  const totalItems = fetchedOrgs?.getOrganizations?.pagination?.total

  useEffect(() => {
    if (!loading && totalItems) {
      paginationState.paginate({
        type: 'setTotal',
        total: totalItems,
      })
    }
  }, [loading, totalItems])

  return (
    <DataView state={view}>
      <DataViewHeader>
        <Flex className={csx({ width: '100%' })}>
          <OrganizationsListSearch onSearch={updateTableItems} />
          <FlexSpacer />
          <Pagination state={paginationState} loading={loading} />
        </Flex>
        <OrganizationsListStatusFilter
          onChange={value => {
            updateTableItems({
              status: value,
              page: 1,
            })
          }}
        />
      </DataViewHeader>
      <Table width="100%" {...getTable()}>
        <THead>
          {columns.map(column => (
            <THeadCell {...getHeadCell(column)} />
          ))}
        </THead>
        <TBody>
          {data?.map(item => {
            return (
              <TBodyRow
                key={item.id}
                onClick={() => navigateToDetailsPage(item.id)}
              >
                {columns.map(column => {
                  return <TBodyCell {...getBodyCell(column, item)} />
                })}
              </TBodyRow>
            )
          })}
        </TBody>
      </Table>
    </DataView>
  )
}

export default OrganizationsList
