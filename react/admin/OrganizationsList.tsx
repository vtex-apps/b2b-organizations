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
import { Alert, Link, Button } from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'

import { useSessionResponse } from '../modules/session'
import type { Session } from '../modules/session'
import {
  INITIAL_FETCH_LIST_OPTIONS,
  useOrganizationsList,
} from '../organizations/hooks'
import type { FetchListOptions } from '../organizations/hooks'
import { useNavigateToDetailsPage } from '../organizations/navigate'
import { useOrgsTableColumns } from '../organizations/table'
import OrganizationsListSearch from './OrganizationsList/OrganizationsListSearch'
import OrganizationsListStatusFilter from './OrganizationsList/OrganizationsListStatusFilter'
import { organizationMessages as messages } from './utils/messages'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

const OrganizationsList: FunctionComponent = () => {
  const { formatMessage } = useIntl()

  const navigateToDetailsPage = useNavigateToDetailsPage()
  const columns = useOrgsTableColumns()

  const [refetchOptions, setRefetchOptions] = useState(
    INITIAL_FETCH_LIST_OPTIONS
  )

  const session = useSessionResponse() as Session

  const account = session?.namespaces?.account?.accountName?.value

  const [isOpenWarning, setIsOpenWarning] = useState(true)

  const { data: fetchedOrgs, loading, refetch } = useOrganizationsList()

  const view = useDataViewState()
  const { data, getBodyCell, getHeadCell, getTable, sortState } = useTableState(
    {
      status: view.status,
      columns,
      items: fetchedOrgs?.getOrganizations?.data,
      length: 10,
      sort: {
        initialValue: {
          by: INITIAL_FETCH_LIST_OPTIONS.sortedBy,
          order: INITIAL_FETCH_LIST_OPTIONS.sortOrder,
        },
      },
    }
  )

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

  const totalItems = fetchedOrgs?.getOrganizations?.pagination?.total

  useEffect(() => {
    if (loading) {
      view.setStatus({
        type: 'loading',
      })

      return
    }

    if (totalItems === 0 && !refetchOptions.search && !refetchOptions.status) {
      view.setStatus({
        type: 'empty',
      })

      return
    }

    view.setStatus({
      type: 'ready',
    })
  }, [loading, totalItems, refetchOptions.search, refetchOptions.status])

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

  useEffect(() => {
    if (!loading && totalItems) {
      paginationState.paginate({
        type: 'setTotal',
        total: totalItems,
      })
    }
  }, [loading, totalItems])

  useEffect(() => {
    updateTableItems({
      sortedBy: sortState.by as string,
      sortOrder: sortState.order,
      page: 1,
    })
  }, [sortState.by, sortState.order])

  return (
    <DataView state={view}>
      <DataViewHeader>
        {isOpenWarning && (
          <Alert type="error" onClose={() => setIsOpenWarning(false)}>
            <div
              className={csx({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
              })}
            >
              <p className={csx({ fontWeight: '500', width: '70%' })}>
                <FormattedMessage id="admin/b2b-organizations.organizations.warning-holding.message" />{' '}
                <Link
                  href="https://developers.vtex.com/docs/guides/querying-documents-in-master-data-v1"
                  target="_blank"
                >
                  <FormattedMessage id="admin/b2b-organizations.organizations.warning-holding.link" />
                </Link>
              </p>

              <Button
                size="small"
                variation="tertiary"
                href={`https://${account}.ds.vtexcrm.com.br/#RGF0YUVudGl0eSNGb3JtRGF0YSNyb3dJZD1DTCMjI0Zvcm1EYXRhX1N1Y2VzcyNBamF4UmVxdWVz%0adEVycm9yI2NvbnRlbnQ%3d`}
                className={csx({ fontWeight: '500', whiteSpace: 'nowrap' })}
                target="_blank"
              >
                <FormattedMessage id="admin/b2b-organizations.organizations.warning-holding.action" />
              </Button>
            </div>
          </Alert>
        )}
        <Flex className={csx({ width: '100%' })}>
          <OrganizationsListSearch
            placeholder={formatMessage(messages.searchPlaceholder)}
            onSearch={updateTableItems}
          />
          <OrganizationsListStatusFilter
            onChange={value => {
              updateTableItems({
                status: value,
                page: 1,
              })
            }}
          />
          <FlexSpacer />
          <Pagination state={paginationState} loading={loading} />
        </Flex>
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
