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
  ModalDialog,
  Input,
} from 'vtex.styleguide'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { toast } from '@vtex/admin-ui'
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

const OrganizationsTable: FunctionComponent = () => {
  const { formatMessage } = useIntl()
  const {
    navigate,
    culture: { country },
  } = useRuntime()

  const [filterState, setFilterState] = useState({
    filterStatements: [] as FilterStatement[],
  })

  const [loadingState, setLoadingState] = useState(false)
  const [variableState, setVariables] = useState(initialState)
  const [newOrganizationModalState, setNewOrganizationModalState] =
    useState(false)

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
        toast.dispatch({
          type: 'success',
          message: formatMessage({
            id: 'admin/b2b-organizations.organizations-admin.toast.add-organization-success',
          }),
        })
        refetch(initialState)
      })
      .catch((error) => {
        setNewOrganizationModalState(false)
        setLoadingState(false)
        console.error(error)
        toast.dispatch({
          type: 'error',
          message: formatMessage({
            id: 'admin/b2b-organizations.organizations-admin.toast.add-organization-failure',
          }),
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
        title: formatMessage({
          id: 'admin/b2b-organizations.organizations-admin.table.column-name.title', // 'Name'
        }),
      },
      status: {
        title: formatMessage({
          id: 'admin/b2b-organizations.organizations-admin.table.column-status.title', // 'Status'
        }),
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
                    (key) => !newValue[key]
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

    statements.forEach((statement) => {
      if (!statement?.object) return
      const { subject, object } = statement

      switch (subject) {
        case 'status': {
          if (!object) return
          const keys = Object.keys(object)
          const isAllTrue = !keys.some((key) => !object[key])
          const isAllFalse = !keys.some((key) => object[key])
          const trueKeys = keys.filter((key) => object[key])

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
      label: () =>
        formatMessage({
          id: 'admin/b2b-organizations.organizations-admin.table.view.label', // 'View'
        }),
      onClick: ({ rowData: { id } }: CellRendererProps) => {
        if (!id) return

        navigate({
          page: 'admin.app.b2b-organizations.organization-request-details',
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
        <PageHeader
          title={formatMessage({
            id: 'admin/b2b-organizations.organizations-admin.title', // "Organizations"
          })}
        />
      }
    >
      <PageBlock>
        <Table
          fullWidth
          schema={getSchema()}
          fixFirstColumn
          loading={loading}
          emptyStateLabel={formatMessage({
            id: 'admin/b2b-organizations.organizations-admin.table.empty-state', // 'No organizations found.'
          })}
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
            textShowRows: formatMessage({
              id: 'admin/b2b-organizations.organizations-admin.table.showRows', // 'Show rows'
            }),
            textOf: formatMessage({
              id: 'admin/b2b-organizations.organizations-admin.table.of', // 'of'
            }),
            totalItems: total ?? 0,
            rowsOptions: [25, 50, 100],
          }}
          toolbar={{
            inputSearch: {
              value: search,
              placeholder: formatMessage({
                id: 'admin/b2b-organizations.organizations-admin.table.search.placeholder', // 'Search'
              }),
              onChange: handleInputSearchChange,
              onClear: handleInputSearchClear,
              onSubmit: handleInputSearchSubmit,
            },
            newLine: {
              label: formatMessage({
                id: 'admin/b2b-organizations.organization-details.button.new', // 'New'
              }),
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
            clearAllFiltersButtonLabel: formatMessage({
              id: 'admin/b2b-organizations.organizations-admin.table.clearFilters.label', // 'Clear filters'
            }),
            collapseLeft: true,
            options: {
              status: {
                label: formatMessage({
                  id: 'admin/b2b-organizations.organizations-admin.table.statusFilter.label', // 'Status'
                }),
                renderFilterLabel: (st: any) => {
                  if (!st || !st.object) {
                    // you should treat empty object cases only for alwaysVisibleFilters
                    return formatMessage({
                      id: 'admin/b2b-organizations.organizations-admin.table.filters.all', // 'All'
                    })
                  }

                  const keys = st.object ? Object.keys(st.object) : []
                  const isAllTrue = !keys.some((key) => !st.object[key])
                  const isAllFalse = !keys.some((key) => st.object[key])
                  const trueKeys = keys.filter((key) => st.object[key])
                  let trueKeysLabel = ''

                  trueKeys.forEach((key, index) => {
                    trueKeysLabel += `${key}${
                      index === trueKeys.length - 1 ? '' : ', '
                    }`
                  })

                  return `${
                    isAllTrue
                      ? formatMessage({
                          id: 'admin/b2b-organizations.organizations-admin.table.filters.all', // 'All'
                        })
                      : isAllFalse
                      ? formatMessage({
                          id: 'admin/b2b-organizations.organizations-admin.table.filters.none', // 'None'
                        })
                      : `${trueKeysLabel}`
                  }`
                },
                verbs: [
                  {
                    label: formatMessage({
                      id: 'admin/b2b-organizations.organizations-admin.table.filters.includes', // 'includes'
                    }),
                    value: 'includes',
                    object: statusSelectorObject,
                  },
                ],
              },
            },
          }}
        ></Table>
      </PageBlock>
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleAddNewOrganization(),
          label: formatMessage({
            id: 'admin/b2b-organizations.organization-details.button.add', // "Add"
          }),
          disabled:
            !newOrganizationName ||
            !newCostCenterName ||
            !isValidAddress(newCostCenterAddressState),
        }}
        cancelation={{
          onClick: () => handleCloseModal(),
          label: formatMessage({
            id: 'admin/b2b-organizations.organization-details.button.cancel', // "Cancel"
          }),
        }}
        loading={loadingState}
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
            label={formatMessage({
              id: 'admin/b2b-organizations.organizations-admin.add-organization.organization-name',
            })}
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
            label={formatMessage({
              id: 'admin/b2b-organizations.organizations-admin.add-organization.default-costCenter-name',
            })}
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
      </ModalDialog>
    </Layout>
  )
}

export default OrganizationsTable
