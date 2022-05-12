import type { FunctionComponent, ChangeEvent } from 'react'
import React, { Fragment, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Table, Tag, Checkbox } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { organizationRequestMessages as messages } from './utils/messages'
import GET_ORGANIZATION_REQUESTS from '../graphql/getOrganizationRequests.graphql'

interface CellRendererProps {
  cellData: unknown
  rowData: OrganizationRequestSimple
  updateCellMeasurements: () => void
}

interface OrganizationRequestSimple {
  id: string
  name: string
  b2bCustomerAdmin: B2BCustomerSimple
  status: string
  created: string
}

interface B2BCustomerSimple {
  email: string
}

export const labelTypeByStatusMap: Record<string, string> = {
  approved: 'success',
  declined: 'error',
  pending: 'warning',
}

const initialState = {
  status: ['pending', 'approved', 'declined'],
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'DESC',
  sortedBy: 'created',
}

const OrganizationRequestsTable: FunctionComponent = () => {
  const { formatMessage, formatDate } = useIntl()
  const { navigate } = useRuntime()
  const [variableState, setVariables] = useState(initialState)

  const [filterState, setFilterState] = useState({
    filterStatements: [] as FilterStatement[],
  })

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION_REQUESTS, {
    variables: initialState,
    fetchPolicy: 'network-only',
    ssr: false,
  })

  const getSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.columnName),
      },
      b2bCustomerAdmin: {
        title: formatMessage(messages.columnAdmin),
        cellRenderer: ({
          rowData: {
            b2bCustomerAdmin: { email },
          },
        }: CellRendererProps) => email,
      },
      status: {
        title: formatMessage(messages.columnStatus),
        cellRenderer: ({ rowData: { status } }: CellRendererProps) => (
          <Tag type={labelTypeByStatusMap[status]}>{status}</Tag>
        ),
        sortable: true,
      },
      created: {
        title: formatMessage(messages.columnCreated),
        cellRenderer: ({ rowData: { created } }: CellRendererProps) => {
          return (
            <>
              {formatDate(created, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
            </>
          )
        },
        sortable: true,
      },
    },
  })

  const statusSelectorObject = ({
    value,
    onChange,
  }: {
    value: Record<string, unknown>
    onChange: any
  }) => {
    const initialValue = {
      approved: true,
      declined: true,
      pending: true,
      ...(value || {}),
    } as Record<string, unknown>

    const toggleValueByKey = (key: string) => {
      const newValue = {
        ...(value || initialValue),
        [key]: value ? !value[key] : false,
      }

      return newValue
    }

    return (
      <div>
        {Object.keys(initialValue).map((opt, index) => {
          return (
            <div className="mb3" key={`status-select-object-${opt}-${index}`}>
              <Checkbox
                checked={value ? value[opt] : initialValue[opt]}
                label={opt}
                name="status-checkbox-group"
                onChange={() => {
                  const newValue = toggleValueByKey(`${opt}`)
                  const newValueKeys = Object.keys(newValue)
                  const isEmptyFilter = !newValueKeys.some(
                    key => !newValue[key]
                  )

                  onChange(isEmptyFilter ? null : newValue)
                }}
                value={opt}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const handlePrevClick = () => {
    if (variableState.page === 1) return

    const newPage = variableState.page - 1

    setVariables({
      ...variableState,
      page: newPage,
    })

    refetch({
      ...variableState,
      page: newPage,
    })
  }

  const handleNextClick = () => {
    const newPage = variableState.page + 1

    setVariables({
      ...variableState,
      page: newPage,
    })

    refetch({
      ...variableState,
      page: newPage,
    })
  }

  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setVariables({
      ...variableState,
      page: 1,
      pageSize: +value,
    })

    refetch({
      ...variableState,
      page: 1,
      pageSize: +value,
    })
  }

  const handleFiltersChange = (statements: FilterStatement[]) => {
    const statuses = [] as string[]

    statements.forEach(statement => {
      if (!statement?.object) return
      const { subject, object } = statement

      switch (subject) {
        case 'status': {
          if (!object) return
          const keys = Object.keys(object)
          const isAllTrue = !keys.some(key => !object[key])
          const isAllFalse = !keys.some(key => object[key])
          const trueKeys = keys.filter(key => object[key])

          if (isAllTrue) break
          if (isAllFalse) statuses.push('none')
          statuses.push(...trueKeys)
          break
        }

        default:
          break
      }
    })

    setFilterState({
      filterStatements: statements,
    })

    setVariables({
      ...variableState,
      status: statuses,
      page: 1,
    })

    refetch({
      ...variableState,
      page: 1,
      status: statuses,
    })
  }

  const handleInputSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = e

    setVariables({
      ...variableState,
      search: value,
    })
  }

  const handleInputSearchClear = () => {
    setVariables({
      ...variableState,
      search: '',
    })

    refetch({
      ...variableState,
      search: '',
      page: 1,
    })
  }

  const handleInputSearchSubmit = () => {
    refetch({
      ...variableState,
      page: 1,
    })
  }

  const handleSort = ({
    sortOrder,
    sortedBy,
  }: {
    sortOrder: string
    sortedBy: string
  }) => {
    setVariables({
      ...variableState,
      sortOrder,
      sortedBy,
    })
    refetch({
      ...variableState,
      page: 1,
      sortOrder,
      sortedBy,
    })
  }

  const lineActions = [
    {
      label: () => formatMessage(messages.view),
      onClick: ({ rowData: { id } }: CellRendererProps) => {
        if (!id) return

        navigate({
          page: 'admin.app.b2b-organizations.organization-request-details',
          params: { id },
        })
      },
    },
  ]

  const { total } = data?.getOrganizationRequests?.pagination ?? 0
  const { page, pageSize, search, sortedBy, sortOrder } = variableState

  return (
    <Fragment>
      <Table
        fullWidth
        schema={getSchema()}
        fixFirstColumn
        loading={loading}
        emptyStateLabel={formatMessage(messages.emptyState)}
        items={data?.getOrganizationRequests?.data}
        lineActions={lineActions}
        onRowClick={({ rowData: { id } }: CellRendererProps) => {
          if (!id) return

          navigate({
            page: 'admin.app.b2b-organizations.organization-request-details',
            params: { id },
          })
        }}
        pagination={{
          onNextClick: handleNextClick,
          onPrevClick: handlePrevClick,
          onRowsChange: handleRowsChange,
          currentItemFrom: (page - 1) * pageSize + 1,
          currentItemTo: total < page * pageSize ? total : page * pageSize,
          textShowRows: formatMessage(messages.showRows),
          textOf: formatMessage(messages.of),
          totalItems: total ?? 0,
          rowsOptions: [25, 50, 100],
        }}
        toolbar={{
          inputSearch: {
            value: search,
            placeholder: formatMessage(messages.searchPlaceholder),
            onChange: handleInputSearchChange,
            onClear: handleInputSearchClear,
            onSubmit: handleInputSearchSubmit,
          },
          // Hiding this because the dropdown renders off of the screen
          // fields: {
          //   label: '',
          //   showAllLabel: '',
          //   hideAllLabel: '',
          // },
        }}
        sort={{
          sortedBy,
          sortOrder,
        }}
        onSort={handleSort}
        filters={{
          alwaysVisibleFilters: ['status'],
          statements: filterState.filterStatements,
          onChangeStatements: handleFiltersChange,
          clearAllFiltersButtonLabel: formatMessage(messages.clearFilters),
          collapseLeft: true,
          options: {
            status: {
              label: formatMessage(messages.statusFilter),
              renderFilterLabel: (st: any) => {
                if (!st || !st.object) {
                  // you should treat empty object cases only for alwaysVisibleFilters
                  return formatMessage(messages.filtersAll)
                }

                const keys = st.object ? Object.keys(st.object) : []
                const isAllTrue = !keys.some(key => !st.object[key])
                const isAllFalse = !keys.some(key => st.object[key])
                const trueKeys = keys.filter(key => st.object[key])
                let trueKeysLabel = ''

                trueKeys.forEach((key, index) => {
                  trueKeysLabel += `${key}${
                    index === trueKeys.length - 1 ? '' : ', '
                  }`
                })

                return `${
                  isAllTrue
                    ? formatMessage(messages.filtersAll)
                    : isAllFalse
                    ? formatMessage(messages.filtersNone)
                    : `${trueKeysLabel}`
                }`
              },
              verbs: [
                {
                  label: formatMessage(messages.filtersIncludes),
                  value: 'includes',
                  object: statusSelectorObject,
                },
              ],
            },
          },
        }}
      />
    </Fragment>
  )
}

export default OrganizationRequestsTable
