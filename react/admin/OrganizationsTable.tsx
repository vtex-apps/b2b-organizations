import type { FunctionComponent, ChangeEvent } from 'react'
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Table,
  Tag,
  Checkbox,
  Modal,
  Input,
  Button,
} from 'vtex.styleguide'
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { useToast } from '@vtex/admin-ui'
import {
  AddressRules,
  AddressForm,
  AddressContainer,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'

import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_ORGANIZATIONS from '../graphql/getOrganizations.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import CREATE_ORGANIZATION from '../graphql/createOrganization.graphql'

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

const initialState = {
  status: ['active', 'on-hold', 'inactive'],
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

const adminPrefix = 'admin/b2b-organizations.'

const messages = defineMessages({
  toastAddOrgSuccess: {
    id: `${adminPrefix}organizations-admin.toast.add-organization-success`,
  },
  toastAddOrgFailure: {
    id: `${adminPrefix}organizations-admin.toast.add-organization-failure`,
  },
  columnName: {
    id: `${adminPrefix}organizations-admin.table.column-name.title`,
  },
  columnStatus: {
    id: `${adminPrefix}organizations-admin.table.column-status.title`,
  },
  view: {
    id: `${adminPrefix}organizations-admin.table.view.label`,
  },
  pageTitle: {
    id: `${adminPrefix}organizations-admin.title`,
  },
  emptyState: {
    id: `${adminPrefix}organizations-admin.table.empty-state`,
  },
  searchPlaceholder: {
    id: `${adminPrefix}organizations-admin.table.search.placeholder`,
  },
  new: {
    id: `${adminPrefix}organization-details.button.new`,
  },
  clearFilters: {
    id: `${adminPrefix}organizations-admin.table.clearFilters.label`,
  },
  filterStatus: {
    id: `${adminPrefix}organizations-admin.table.statusFilter.label`,
  },
  filtersAll: {
    id: `${adminPrefix}organizations-admin.table.filters.all`,
  },
  filtersNone: {
    id: `${adminPrefix}organizations-admin.table.filters.none`,
  },
  filtersIncludes: {
    id: `${adminPrefix}organizations-admin.table.filters.includes`,
  },
  add: {
    id: `${adminPrefix}organization-details.button.add`,
  },
  cancel: {
    id: `${adminPrefix}organization-details.button.cancel`,
  },
  organizationName: {
    id: `${adminPrefix}organizations-admin.add-organization.organization-name`,
  },
  defaultCostCenterName: {
    id: `${adminPrefix}organizations-admin.add-organization.default-costCenter-name`,
  },
  showRows: {
    id: `${adminPrefix}showRows`,
  },
  of: {
    id: `${adminPrefix}of`,
  },
})

const OrganizationsTable: FunctionComponent = () => {
  const { formatMessage } = useIntl()
  const {
    navigate,
    culture: { country },
  } = useRuntime()

  const showToast = useToast()

  const [filterState, setFilterState] = useState({
    filterStatements: [] as FilterStatement[],
  })

  const [loadingState, setLoadingState] = useState(false)
  const [variableState, setVariables] = useState(initialState)
  const [newOrganizationModalState, setNewOrganizationModalState] = useState(
    false
  )

  const [newOrganizationName, setNewOrganizationName] = useState('')
  const [newCostCenterName, setNewCostCenterName] = useState('')
  const [newCostCenterAddressState, setNewCostCenterAddressState] = useState(
    addValidation(getEmptyAddress(country))
  )

  const { data, loading, refetch } = useQuery(GET_ORGANIZATIONS, {
    variables: initialState,
    ssr: false,
  })

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })
  const [createOrganization] = useMutation(CREATE_ORGANIZATION)

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const handleAddNewOrganization = () => {
    setLoadingState(true)
    const newAddress = {
      addressId: newCostCenterAddressState.addressId.value,
      addressType: newCostCenterAddressState.addressType.value,
      city: newCostCenterAddressState.city.value,
      complement: newCostCenterAddressState.complement.value,
      country: newCostCenterAddressState.country.value,
      receiverName: newCostCenterAddressState.receiverName.value,
      geoCoordinates: newCostCenterAddressState.geoCoordinates.value,
      neighborhood: newCostCenterAddressState.neighborhood.value,
      number: newCostCenterAddressState.number.value,
      postalCode: newCostCenterAddressState.postalCode.value,
      reference: newCostCenterAddressState.reference.value,
      state: newCostCenterAddressState.state.value,
      street: newCostCenterAddressState.street.value,
      addressQuery: newCostCenterAddressState.addressQuery.value,
    }

    const variables = {
      input: {
        name: newOrganizationName,
        defaultCostCenter: {
          name: newCostCenterName,
          address: newAddress,
        },
      },
    }

    createOrganization({ variables })
      .then(() => {
        setNewOrganizationModalState(false)
        setLoadingState(false)
        setNewOrganizationName('')
        setNewCostCenterName('')
        setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
        showToast({
          type: 'success',
          message: formatMessage(messages.toastAddOrgSuccess),
        })
        refetch(initialState)
      })
      .catch(error => {
        setNewOrganizationModalState(false)
        setLoadingState(false)
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastAddOrgFailure),
        })
      })
  }

  const handleNewCostCenterAddressChange = (
    changedAddress: AddressFormFields
  ) => {
    const curAddress = newCostCenterAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewCostCenterAddressState(newAddress)
  }

  const handleCloseModal = () => {
    setNewOrganizationModalState(false)
    setNewOrganizationName('')
    setNewCostCenterName('')
    setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
  }

  const getSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.columnName),
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
          page: 'admin.app.b2b-organizations.organization-details',
          params: { id },
        })
      },
    },
  ]

  const { total } = data?.getOrganizations?.pagination ?? 0
  const { page, pageSize, search, sortedBy, sortOrder } = variableState

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader title={formatMessage(messages.pageTitle)}>
          <Button onClick={() => refetch()}>
            <FormattedMessage id="admin/b2b-organizations.organizations-admin.button.refetch" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <Table
          fullWidth
          schema={getSchema()}
          fixFirstColumn
          loading={loading}
          emptyStateLabel={formatMessage(messages.emptyState)}
          items={data?.getOrganizations?.data}
          lineActions={lineActions}
          onRowClick={({ rowData: { id } }: CellRendererProps) => {
            if (!id) return

            navigate({
              page: 'admin.app.b2b-organizations.organization-details',
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
            newLine: {
              label: formatMessage(messages.new),
              handleCallback: () => setNewOrganizationModalState(true),
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
        ></Table>
      </PageBlock>
      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModal()}
                isLoading={loadingState}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </span>
            <span>
              <Button
                variation="primary"
                onClick={() => handleAddNewOrganization()}
                isLoading={loadingState}
                disabled={
                  !newOrganizationName ||
                  !newCostCenterName ||
                  !isValidAddress(newCostCenterAddressState)
                }
              >
                {formatMessage(messages.add)}
              </Button>
            </span>
          </div>
        }
        isOpen={newOrganizationModalState}
        onClose={() => handleCloseModal()}
        closeOnOverlayClick={false}
      >
        <p className="f3 f1-ns fw3 gray">
          <FormattedMessage id="admin/b2b-organizations.organizations-admin.add-organization" />
        </p>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.organizationName)}
            value={newOrganizationName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewOrganizationName(e.target.value)
            }}
            required
          />
        </div>
        <div className="w-100 mv6">
          <FormattedMessage id="admin/b2b-organizations.organizations-admin.add-organization.default-costCenter.helpText" />
        </div>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.defaultCostCenterName)}
            value={newCostCenterName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterName(e.target.value)
            }}
            required
          />
        </div>
        <AddressRules
          country={newCostCenterAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newCostCenterAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewCostCenterAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
          </AddressContainer>
        </AddressRules>
      </Modal>
    </Layout>
  )
}

export default OrganizationsTable
