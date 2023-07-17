import React, { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import {
  csx,
  DataView,
  DataViewHeader,
  Table,
  THead,
  THeadCell,
  TBody,
  TBodyRow,
  TBodyCell,
  useDataViewState,
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

  useEffect(() => {
    view.setStatus({
      type: loading ? 'loading' : 'ready',
    })
  }, [loading])

  const handleSearch = (options: Partial<FetchListOptions>) => {
    const newRefetchOptions = {
      ...refetchOptions,
      ...options,
    }

    setRefetchOptions(newRefetchOptions)
    refetch(newRefetchOptions)
  }

  const handleStatusFilterChange = (value: string[]) => {
    const newRefetchOptions = {
      ...refetchOptions,
      status: value,
      page: 1,
    }

    setRefetchOptions(newRefetchOptions)
    refetch(newRefetchOptions)
  }

  return (
    <DataView state={view} className={csx({ paddingX: '$space-3' })}>
      <DataViewHeader>
        <OrganizationsListSearch onSearch={handleSearch} />
        <OrganizationsListStatusFilter onChange={handleStatusFilterChange} />
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
