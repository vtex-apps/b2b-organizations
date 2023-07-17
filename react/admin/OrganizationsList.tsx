import type { ChangeEvent, FunctionComponent } from 'react'
import React, { Fragment, useState } from 'react'
import { Checkbox, Table, Tag } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import { organizationMessages as messages } from './utils/messages'
import {
  INITIAL_FETCH_LIST_OPTIONS,
  useOrganizationsList,
} from '../organizations/hooks'

interface CellRendererProps {
  cellData: unknown
  rowData: OrganizationSimple
  updateCellMeasurements: () => void
}

interface OrganizationSimple {
  id: string
  name: string
  status: string
}

export const labelTypeByStatusMap: Record<string, string> = {
  active: 'success',
  inactive: 'error',
  'on-hold': 'warning',
}

const OrganizationsList: FunctionComponent = () => {
  const { formatMessage } = useIntl()
  const { navigate } = useRuntime()

  const [filterState, setFilterState] = useState({
    filterStatements: [] as FilterStatement[],
  })

  const [variableState, setVariables] = useState(INITIAL_FETCH_LIST_OPTIONS)

  const { data, loading, refetch } = useOrganizationsList()

  const getSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.tableColumnName),
      },
      status: {
        title: formatMessage(messages.columnStatus),
        cellRenderer: ({ rowData: { status } }: CellRendererProps) => (
          <Tag type={labelTypeByStatusMap[status]}>{status}</Tag>
        ),
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
      active: true,
      'on-hold': true,
      inactive: true,
      ...(value || {}),
    } as Record<string, unknown>

    const toggleValueByKey = (key: string) => {
      return {
        ...(value || initialValue),
        [key]: value ? !value[key] : false,
      }
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

      if (subject !== 'status' || !object) {
        return
      }

      const keys = Object.keys(object)
      const isAllTrue = !keys.some(key => !object[key])
      const isAllFalse = !keys.some(key => object[key])
      const trueKeys = keys.filter(key => object[key])

      if (isAllTrue) return
      if (isAllFalse) statuses.push('none')
      statuses.push(...trueKeys)
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

  const onRowClick = ({ rowData: { id } }: CellRendererProps) => {
    if (!id) return

    navigate({
      page: 'admin.app.b2b-organizations.organization-details',
      params: { id },
    })
  }

  const handleSort = ({
    sortOrder: _sortOrder,
    sortedBy: _sortedBy,
  }: {
    sortOrder: string
    sortedBy: string
  }) => {
    setVariables({
      ...variableState,
      sortOrder: _sortOrder,
      sortedBy: _sortedBy,
    })
    refetch({
      ...variableState,
      page: 1,
      sortOrder: _sortOrder,
      sortedBy: _sortedBy,
    })
  }

  const lineActions = [
    {
      label: () => formatMessage(messages.view),
      onClick: onRowClick,
    },
  ]

  const { total } = data?.getOrganizations?.pagination ?? 0
  const { page, pageSize, search, sortedBy, sortOrder } = variableState

  return (
    <Fragment>
      <Table
        fullWidth
        schema={getSchema()}
        fixFirstColumn
        loading={loading}
        emptyStateLabel={formatMessage(messages.organizationsEmptyState)}
        items={data?.getOrganizations?.data}
        lineActions={lineActions}
        onRowClick={onRowClick}
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
              label: formatMessage(messages.filterStatus),
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

                if (isAllTrue) return formatMessage(messages.filtersAll)
                if (isAllFalse) return formatMessage(messages.filtersNone)

                return trueKeysLabel.toString()
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

export default OrganizationsList
