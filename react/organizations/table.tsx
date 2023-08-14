import React from 'react'
import { useIntl } from 'react-intl'
import { createColumns, csx, IconEye, Tag, Skeleton } from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'

import { organizationMessages as messages } from '../admin/utils/messages'
import { useNavigateToDetailsPage } from './navigate'

interface OrganizationSimple {
  id: string
  name: string
  status: string
}

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

export const useOrgsTableColumns = () => {
  const { formatMessage } = useIntl()
  const navigateToDetailsPage = useNavigateToDetailsPage()

  return createColumns<OrganizationSimple>([
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
      sortable: true,
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
      sortable: true,
    },
    {
      id: 'menu',
      resolver: {
        type: 'menu',
        actions: [
          {
            label: formatMessage(messages.view),
            icon: <IconEye />,
            onClick: ({ id }) => navigateToDetailsPage(id),
          },
        ],
      },
    },
  ])
}
