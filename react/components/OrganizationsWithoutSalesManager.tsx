import React, { Fragment, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { Table, PageBlock, Alert } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import {
  organizationMessages as messages,
  organizationMessages as storeMessages,
} from './utils/messages'
import GET_ORGANIZATIONS from '../graphql/getOrganizationsWithoutSalesManager.graphql'

const TABLE_LENGTH = 5
const OrganizationsWithoutSalesManager = () => {
  const { formatMessage } = useIntl()
  const [organizationsState, setOrganizationsState] = useState([] as any)

  const [paginationState, setPaginationState] = useState({
    tableLength: TABLE_LENGTH,
    currentPage: 1,
    slicedData: [] as any,
    currentItemFrom: 1,
    currentItemTo: TABLE_LENGTH,
    itemsLength: 0,
    emptyStateLabel: 'Nothing to show.',
  })

  const { data, loading } = useQuery(GET_ORGANIZATIONS, {
    variables: {},
    fetchPolicy: 'network-only',
  })

  const updateData = (_data: any) => {
    setPaginationState({
      ...paginationState,
      slicedData: _data.slice(
        paginationState.currentItemFrom - 1,
        paginationState.currentItemTo
      ),
      itemsLength: _data.length,
    })
  }

  const goToPage = (
    currentPage: number,
    currentItemFrom: number,
    currentItemTo: number,
    slicedData: any[]
  ) => {
    setPaginationState({
      ...paginationState,
      currentPage,
      currentItemFrom,
      currentItemTo,
      slicedData,
    })
  }

  const handleNextClick = () => {
    const newPage = paginationState.currentPage + 1
    const itemFrom = paginationState.currentItemTo + 1
    const itemTo = paginationState.tableLength * newPage
    const _data = organizationsState.slice(itemFrom - 1, itemTo)

    goToPage(newPage, itemFrom, itemTo, _data)
  }

  const handlePrevClick = () => {
    if (paginationState.currentPage === 0) return
    const newPage = paginationState.currentPage - 1
    const itemFrom =
      paginationState.currentItemFrom - paginationState.tableLength

    const itemTo = paginationState.currentItemFrom - 1
    const _data = organizationsState.slice(itemFrom - 1, itemTo)

    goToPage(newPage, itemFrom, itemTo, _data)
  }

  const handleRowsChange = (_: any, value: any) => {
    setPaginationState({
      ...paginationState,
      tableLength: parseInt(value, 10),
      currentItemTo: parseInt(value, 10),
    })
  }

  const getSchema = () => {
    return {
      properties: {
        name: {
          title: formatMessage(storeMessages.columnOrganizationName),
        },
      },
    }
  }

  useEffect(() => {
    if (!organizationsState || !organizationsState.length) return

    updateData(organizationsState)
  }, [paginationState])

  useEffect(() => {
    if (!data) {
      return
    }

    const _data = data?.getOrganizationsWithoutSalesManager

    _data.sort((a: any, b: any) => (a.name > b.name ? 1 : -1))
    setOrganizationsState(_data)
    updateData(_data)
  }, [data])

  return (
    <Fragment>
      {data && !organizationsState.length && (
        <div className="mb8">
          <Alert type="success">
            {formatMessage(messages.organizationsWithoutSalesManagerOK)}
          </Alert>
        </div>
      )}

      {data && organizationsState && organizationsState.length > 0 && (
        <PageBlock
          title={formatMessage(messages.organizationsWithoutSalesManager)}
        >
          <div className="mb8">
            <Alert className="mb5" type="warning">
              {formatMessage(messages.organizationsWithoutSalesManagerWarning)}
            </Alert>
          </div>
          <Table
            loading={loading}
            items={paginationState.slicedData}
            fullWidth
            schema={getSchema()}
            pagination={{
              onNextClick: handleNextClick,
              onPrevClick: handlePrevClick,
              currentItemFrom: paginationState.currentItemFrom,
              currentItemTo: paginationState.currentItemTo,
              onRowsChange: handleRowsChange,
              textShowRows: formatMessage(storeMessages.showRows),
              textOf: formatMessage(storeMessages.of),
              totalItems: organizationsState.length,
              rowsOptions: [5, 10, 15, 25],
            }}
          />
        </PageBlock>
      )}
    </Fragment>
  )
}

export default OrganizationsWithoutSalesManager
