import type { ChangeEvent, FunctionComponent } from 'react'
import React, { Fragment, useState, useEffect } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Table,
  Tag,
  Spinner,
} from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { useToast } from '@vtex/admin-ui'
import {
  AddressContainer,
  AddressForm,
  AddressRules,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'

import { organizationMessages as messages } from './utils/messages'
import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_ORGANIZATIONS from '../graphql/getOrganizations.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import CREATE_ORGANIZATION from '../graphql/createOrganization.graphql'
import { validatePhoneNumber } from '../modules/formValidators'
import GET_B2B_CUSTOM_FIELDS from '../graphql/getB2BCustomFields.graphql'
import CustomFieldInput from './OrganizationDetailsCustomField'

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

const OrganizationsList: FunctionComponent = () => {
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
  const [newCostCenterPhoneNumber, setNewCostCenterPhoneNumber] = useState('')
  const [
    newCostCenterBusinessDocument,
    setNewCostCenterBusinessDocument,
  ] = useState('')

  const [
    newCostCenterStateRegistration,
    setNewCostCenterStateRegistration,
  ] = useState('')

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

  //! CUSTOM FIELDS
  const {
    data: defaultCustomFieldsData,
    loading: defaultCustomFieldsDataLoading,
  } = useQuery(GET_B2B_CUSTOM_FIELDS, {
    ssr: false,
  })

  const [orgCustomFieldsState, setOrgCustomFieldsState] = useState<
    CustomField[]
  >([])

  const [
    costCenterCustomFieldsState,
    setCostCenterCustomFieldsState,
  ] = useState<CustomField[]>([])

  useEffect(() => {
    if (defaultCustomFieldsDataLoading) return

    const organizationFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.organizationCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    const costCenterFieldsToDisplay = defaultCustomFieldsData?.getB2BSettings.costCenterCustomFields.filter(
      (item: CustomField) => item.useOnRegistration
    )

    setOrgCustomFieldsState(organizationFieldsToDisplay)
    setCostCenterCustomFieldsState(costCenterFieldsToDisplay)
  }, [defaultCustomFieldsData])

  const handleOrgCustomFieldsUpdate = (
    index: number,
    customField: CustomField
  ) => {
    const newCustomFields = [...orgCustomFieldsState]

    newCustomFields[index] = customField
    setOrgCustomFieldsState(newCustomFields)
  }

  const handleCostCenterCustomFieldsUpdate = (
    index: number,
    customField: CustomField
  ) => {
    const newCustomFields = [...costCenterCustomFieldsState]

    newCustomFields[index] = customField
    setCostCenterCustomFieldsState(newCustomFields)
  }
  //! CUSTOM FIELDS

  const resetNewOrganizationForm = () => {
    setNewOrganizationName('')
    setNewCostCenterName('')
    setNewCostCenterPhoneNumber('')
    setNewCostCenterBusinessDocument('')
    setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
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
        customFields: orgCustomFieldsState,
        defaultCostCenter: {
          name: newCostCenterName,
          address: newAddress,
          phoneNumber: newCostCenterPhoneNumber,
          businessDocument: newCostCenterBusinessDocument,
          customFields: costCenterCustomFieldsState,
          stateRegistration: newCostCenterStateRegistration,
        },
      },
    }

    createOrganization({ variables })
      .then(() => {
        setNewOrganizationModalState(false)
        setLoadingState(false)
        resetNewOrganizationForm()
        showToast({
          variant: 'positive',
          message: formatMessage(messages.toastAddOrgSuccess),
        })
        refetch(initialState)
      })
      .catch(error => {
        setNewOrganizationModalState(false)
        setLoadingState(false)
        console.error(error)
        showToast({
          variant: 'critical',
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
    resetNewOrganizationForm()
  }

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

      <Modal
        centered
        bottomBar={
          <div className="nowrap">
            <span className="mr4">
              <Button
                variation="tertiary"
                onClick={() => handleCloseModal()}
                disabled={loadingState}
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
                  !isValidAddress(newCostCenterAddressState) ||
                  (newCostCenterPhoneNumber &&
                    !validatePhoneNumber(newCostCenterPhoneNumber))
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
        {/* //! Custom fields */}
        {defaultCustomFieldsDataLoading ? (
          <div className="mb5">
            <Spinner />
          </div>
        ) : (
          orgCustomFieldsState?.map(
            (customField: CustomField, index: number) => {
              return (
                <CustomFieldInput
                  key={`${customField.name} ${index}`}
                  index={index}
                  handleUpdate={handleOrgCustomFieldsUpdate}
                  customField={customField}
                />
              )
            }
          )
        )}

        {/* //! Custom fields */}
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
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.phoneNumber)}
            value={newCostCenterPhoneNumber}
            error={
              newCostCenterPhoneNumber &&
              !validatePhoneNumber(newCostCenterPhoneNumber)
            }
            helpText={formatMessage(messages.phoneNumberHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterPhoneNumber(e.target.value)
            }}
          />
        </div>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.businessDocument)}
            value={newCostCenterBusinessDocument}
            helpText={formatMessage(messages.businessDocumentHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterBusinessDocument(e.target.value)
            }}
          />
        </div>
        {/* //! Custom fields */}
        {defaultCustomFieldsDataLoading ? (
          <div className="mb5 flex flex-column">
            <Spinner />
          </div>
        ) : (
          <>
            {costCenterCustomFieldsState?.map(
              (customField: CustomField, index: number) => {
                return (
                  <CustomFieldInput
                    key={`${customField.name} ${index}`}
                    index={index}
                    handleUpdate={handleCostCenterCustomFieldsUpdate}
                    customField={customField}
                  />
                )
              }
            )}
          </>
        )}
        {/* //! Custom fields */}
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.stateRegistration)}
            value={newCostCenterStateRegistration}
            helpText={formatMessage(messages.stateRegistrationHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterStateRegistration(e.target.value)
            }}
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
    </Fragment>
  )
}

export default OrganizationsList
