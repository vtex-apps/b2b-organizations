import React, { useState, useEffect } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { Table, Toggle } from 'vtex.styleguide'

import { costCenterMessages as messages } from './utils/messages'
import { useOrgPermission } from '../hooks/useOrgPermission'
import { ORGANIZATION_EDIT } from '../utils/constants'

const tableLength = 5

interface CellRendererProps {
  rowData: Address
  cellData: unknown
  updateCellMeasurements: () => void
}

interface TableState {
  tableLength: number
  currentPage: number
  filteredItems: Address[]
  slicedData: Address[]
  currentItemFrom: number
  currentItemTo: number
  searchValue: string
  itemsLength: number
  emptyStateLabel: string
  filterStatements: unknown[]
}

interface AddressListProps {
  addressList: Address[]
  handleNewAddressModal: () => void
  handleCheckDefault: (address: Address) => void
  handleEditAddressModal: (addressId: string) => void
  handleDeleteAddressModal: (addressId: string) => void
}

const CostCenterAddressList: React.FC<AddressListProps> = ({
  addressList,
  handleCheckDefault,
  handleNewAddressModal,
  handleEditAddressModal,
  handleDeleteAddressModal,
}) => {
  const { formatMessage } = useIntl()

  const {
    data: canEditBuyerOrg,
    isLoading: permissionLoading,
  } = useOrgPermission({
    resourceCode: ORGANIZATION_EDIT,
  })

  const initialState: TableState = {
    tableLength,
    currentPage: 1,
    filteredItems: addressList,
    slicedData: addressList.slice(0, tableLength),
    currentItemFrom: 1,
    currentItemTo: tableLength,
    searchValue: '',
    itemsLength: addressList.length,
    emptyStateLabel: formatMessage(messages.nothingToShow),
    filterStatements: [],
  }

  const [state, setState] = useState<TableState>(initialState)
  const jsonschema = {
    properties: {
      street: {
        title: formatMessage(messages.address),
        cellRenderer: ({ rowData }: CellRendererProps) => {
          return `${rowData.street}, ${rowData.city}, ${rowData.state}, ${rowData.postalCode}`
        },
      },
      receiverName: {
        title: formatMessage(messages.receiverName),
        cellRenderer: ({ rowData }: CellRendererProps) => {
          try {
            const receiver = JSON.parse(rowData.receiverName)
            const strings = Object.keys(receiver).map(
              (key: string) => receiver[key]
            )

            return strings.join(' - ')
          } catch (e) {
            return rowData.receiverName
          }
        },
      },
      checked: {
        title: formatMessage(messages.defaultAddress),
        width: 150,
        cellRenderer: ({ rowData }: CellRendererProps) => {
          return (
            <Toggle
              onChange={() => {
                handleCheckDefault(rowData)
              }}
              checked={rowData.checked}
            />
          )
        },
      },
    },
  }

  useEffect(() => {
    if (addressList?.length > 0) {
      setState(prevState => ({
        ...prevState,
        filteredItems: addressList,
        slicedData: addressList.slice(0, tableLength),
        itemsLength: addressList.length,
      }))
    }
  }, [addressList])

  const filterItems = (searchValue: string) => {
    if (!searchValue) {
      return addressList
    }

    const regex = new RegExp(searchValue, 'i')

    return addressList.filter((item: Address) => {
      return (
        regex.test(item.postalCode) ||
        regex.test(item.country) ||
        (typeof item.receiverName === 'string' &&
          regex.test(item.receiverName)) ||
        regex.test(item.city) ||
        regex.test(item.state) ||
        regex.test(item.street) ||
        (item.complement && regex.test(item.complement)) ||
        (item.neighborhood && regex.test(item.neighborhood)) ||
        (item.reference && regex.test(item.reference))
      )
    })
  }

  const handleRowsChange = (_: unknown, value: string) => {
    const newTableLength: number = parseInt(value, 10)

    setState({
      ...state,
      tableLength: newTableLength,
      currentPage: 1,
      currentItemFrom: 1,
      currentItemTo: Math.min(newTableLength, state.filteredItems.length),
      slicedData: state.filteredItems.slice(0, newTableLength),
    })
  }

  const handleInputSearchSubmit = (e: { target: { value: string } }) => {
    const searchValue = e.target.value
    const filteredItems = filterItems(searchValue)

    setState({
      ...state,
      searchValue,
      filteredItems,
      slicedData: filteredItems.slice(0, state.tableLength as number),
      itemsLength: filteredItems.length,
    })
  }

  const handleNextClick = () => {
    const newPage: number = (state.currentPage as number) + 1
    const itemFrom: number = (state.currentItemTo as number) + 1
    const itemTo: number = Math.min(
      itemFrom + (state.tableLength as number) - 1,
      state.filteredItems.length
    )

    setState({
      ...state,
      currentPage: newPage,
      currentItemFrom: itemFrom,
      currentItemTo: itemTo,
      slicedData: state.filteredItems.slice(itemFrom - 1, itemTo),
    })
  }

  const handlePrevClick = () => {
    if (state.currentPage === 1) return

    const newPage: number = (state.currentPage as number) - 1
    const itemFrom: number =
      (state.currentItemFrom as number) - (state.tableLength as number)

    const itemTo: number = (state.currentItemFrom as number) - 1

    setState({
      ...state,
      currentPage: newPage,
      currentItemFrom: itemFrom,
      currentItemTo: itemTo,
      slicedData: state.filteredItems.slice(itemFrom - 1, itemTo),
    })
  }

  const lineActions =
    canEditBuyerOrg && !permissionLoading
      ? [
          {
            label: () => `${formatMessage(messages.addressEdit)}`,
            onClick: ({ rowData }: CellRendererProps) => {
              handleEditAddressModal(rowData.addressId)
            },
          },
          {
            label: () => formatMessage(messages.addressDelete),
            isDangerous: true,
            onClick: ({ rowData }: CellRendererProps) => {
              handleDeleteAddressModal(rowData.addressId)
            },
          },
        ]
      : []

  const onClearHandle = () => {
    const filteredItems = filterItems('')

    setState({
      ...state,
      searchValue: '',
      filteredItems,
      slicedData: filteredItems.slice(0, state.tableLength as number),
      itemsLength: filteredItems.length,
    })
  }

  return (
    <Table
      fullWidth
      schema={jsonschema}
      items={state.slicedData}
      emptyStateLabel={state.emptyStateLabel}
      toolbar={{
        inputSearch: {
          value: state.searchValue,
          placeholder: formatMessage(messages.searchAddress),
          onChange: (e: { target: { value: string } }) =>
            setState({ ...state, searchValue: e.target.value }),
          onClear: onClearHandle,
          onSubmit: handleInputSearchSubmit,
        },
        newLine: {
          label: (
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.address.new" />
          ),
          handleCallback: () => {
            handleNewAddressModal()
          },
          disabled: !canEditBuyerOrg || permissionLoading,
        },
      }}
      pagination={{
        onNextClick: handleNextClick,
        onPrevClick: handlePrevClick,
        currentItemFrom: state.currentItemFrom,
        currentItemTo: state.currentItemTo,
        onRowsChange: handleRowsChange,
        textShowRows: formatMessage(messages.showRows),
        textOf: formatMessage(messages.of),
        totalItems: state.itemsLength,
        rowsOptions: [5, 10, 15, 25],
      }}
      lineActions={lineActions}
      onRowClick={canEditBuyerOrg && !permissionLoading ? () => {} : undefined}
    />
  )
}

export default CostCenterAddressList
