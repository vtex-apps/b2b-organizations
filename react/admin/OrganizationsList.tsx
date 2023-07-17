import React, { useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useIntl } from 'react-intl'
import {
  createColumns,
  csx,
  DataView,
  DataViewHeader,
  IconEye,
  Search,
  Table,
  Tag,
  THead,
  THeadCell,
  TBody,
  TBodyRow,
  TBodyCell,
  useDataViewState,
  useSearchState,
  useTableState,
  Skeleton,
} from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'
import { useRuntime } from 'vtex.render-runtime'

import { organizationMessages as messages } from './utils/messages'
import {
  INITIAL_FETCH_LIST_OPTIONS,
  useOrganizationsList,
} from '../organizations/hooks'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}
interface OrganizationSimple {
  id: string
  name: string
  status: string
}

const OrganizationsList: FunctionComponent = () => {
  const { formatMessage } = useIntl()
  const { navigate } = useRuntime()

  const columns = createColumns<OrganizationSimple>([
    {
      id: 'name',
      header: formatMessage(messages.tableColumnName),
      width: '3fr',
      resolver: {
        type: 'text',
        columnType: 'name',
        mapText: ({ name }) => name,
        render: ({ data }) => (
          <div className={csx({ minWidth: '10rem' })}>{data}</div>
        ),
      },
    },
    {
      id: 'status',
      header: formatMessage(messages.columnStatus),
      resolver: {
        type: 'root',
        render: ({ item, context }) => {
          if (context === 'loading') {
            return <Skeleton className={csx({ height: '1.5rem' })} />
          }

          return (
            <Tag
              label={item.status}
              size="normal"
              variant={TagVariantByStatus[item.status]}
            />
          )
        },
      },
    },
    {
      id: 'menu',
      resolver: {
        type: 'menu',
        actions: [
          {
            label: formatMessage(messages.view),
            icon: <IconEye />,

            onClick: ({ id }) => {
              navigate({
                page: 'admin.app.b2b-organizations.organization-details',
                params: { id },
              })
            },
          },
        ],
      },
    },
  ])

  const [refetchOptions, setRefetchOptions] = useState(
    INITIAL_FETCH_LIST_OPTIONS
  )

  const { data: fetchedOrgs, loading, refetch } = useOrganizationsList()

  const view = useDataViewState()
  const search = useSearchState()
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

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLFormElement> = event => {
    if (event.key !== 'Enter') return

    const newRefetchOptions = {
      ...refetchOptions,
      search: search.value,
      page: 1,
    }

    setRefetchOptions(newRefetchOptions)
    refetch(newRefetchOptions)
  }

  const { onClear, ...inputProps } = search.getInputProps()

  const handleSearchClear = () => {
    onClear()

    const newRefetchOptions = {
      ...refetchOptions,
      search: '',
      page: 1,
    }

    setRefetchOptions(newRefetchOptions)
    refetch(newRefetchOptions)
  }

  return (
    <DataView state={view} className={csx({ paddingX: '$space-3' })}>
      <DataViewHeader>
        <Search
          rel=""
          {...inputProps}
          onClear={handleSearchClear}
          onKeyDown={handleSearchKeyDown}
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
              <TBodyRow key={item.id}>
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
