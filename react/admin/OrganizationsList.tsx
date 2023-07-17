import React, { useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { useIntl } from 'react-intl'
import {
  createColumns,
  csx,
  DataView,
  IconEye,
  Table,
  Tag,
  THead,
  THeadCell,
  TBody,
  TBodyRow,
  TBodyCell,
  useDataViewState,
  useTableState,
  Skeleton,
} from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'
import { useRuntime } from 'vtex.render-runtime'

import { organizationMessages as messages } from './utils/messages'
import { useOrganizationsList } from '../organizations/hooks'

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

  const { data: fetchedOrgs, loading } = useOrganizationsList()

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

  return (
    <DataView state={view} className={csx({ paddingX: '$space-3' })}>
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
