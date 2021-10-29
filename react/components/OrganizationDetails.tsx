import React, { useState, useContext } from 'react'
import type { FunctionComponent, ChangeEvent } from 'react'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Spinner,
  Table,
  ToastContext,
} from 'vtex.styleguide'
import { useQuery, useMutation } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'

import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import NewCostCenterModal from './NewCostCenterModal'
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import GET_COST_CENTERS from '../graphql/getCostCentersByOrganizationId.graphql'
import CREATE_COST_CENTER from '../graphql/createCostCenter.graphql'

interface CellRendererProps {
  cellData: unknown
  rowData: CostCenterSimple
  updateCellMeasurements: () => void
}

interface CostCenterSimple {
  id: string
  name: string
  addresses: Address[]
}

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('orderquote_isAuthenticated'))) ?? false

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  toastAddCostCenterSuccess: {
    id: `${storePrefix}organization-details.toast.add-costCenter-success`,
  },
  toastAddCostCenterFailure: {
    id: `${storePrefix}organization-details.toast.add-costCenter-failure`,
  },
  columnName: {
    id: `${storePrefix}organization-details.table.column-name.title`,
  },
  columnAddresses: {
    id: `${storePrefix}organization-details.table.column-addresses.title`,
  },
  pageTitle: {
    id: `${storePrefix}organization-details.title`,
  },
  costCenters: {
    id: `${storePrefix}organization-details.costCenters`,
  },
  showRows: {
    id: `${storePrefix}showRows`,
  },
  of: {
    id: `${storePrefix}of`,
  },
  new: {
    id: `${storePrefix}organization-details.button.new`,
  },
})

const OrganizationDetails: FunctionComponent = () => {
  const {
    // route: { params },
    navigate,
  } = useRuntime()

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'orderquote_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const { formatMessage } = useIntl()

  const { showToast } = useContext(ToastContext)

  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = formatMessage(message)

    const action = undefined

    showToast({ message: translatedMessage, duration: 5000, action })
  }

  const [costCenterPaginationState, setCostCenterPaginationState] = useState({
    page: 1,
    pageSize: 25,
  })

  const [loadingState, setLoadingState] = useState(false)
  const [newCostCenterModalState, setNewCostCenterModalState] = useState(false)

  const { data, loading } = useQuery(GET_ORGANIZATION, { ssr: false })
  const { data: costCentersData, refetch: refetchCostCenters } = useQuery(
    GET_COST_CENTERS,
    {
      variables: { ...costCenterPaginationState },
      ssr: false,
    }
  )

  const [createCostCenter] = useMutation(CREATE_COST_CENTER)

  const handleCostCentersPrevClick = () => {
    if (costCenterPaginationState.page === 1) return

    const newPage = costCenterPaginationState.page - 1

    setCostCenterPaginationState({
      ...costCenterPaginationState,
      page: newPage,
    })

    refetchCostCenters({
      ...costCenterPaginationState,
      page: newPage,
    })
  }

  const handleCostCentersNextClick = () => {
    const newPage = costCenterPaginationState.page + 1

    setCostCenterPaginationState({
      ...costCenterPaginationState,
      page: newPage,
    })

    refetchCostCenters({
      ...costCenterPaginationState,
      page: newPage,
    })
  }

  const handleCostCentersRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setCostCenterPaginationState({
      page: 1,
      pageSize: +value,
    })

    refetchCostCenters({
      page: 1,
      pageSize: +value,
    })
  }

  const handleAddNewCostCenter = (name: string, address: AddressFormFields) => {
    setLoadingState(true)
    const newAddress = {
      addressId: address.addressId.value,
      addressType: address.addressType.value,
      city: address.city.value,
      complement: address.complement.value,
      country: address.country.value,
      receiverName: address.receiverName.value,
      geoCoordinates: address.geoCoordinates.value,
      neighborhood: address.neighborhood.value,
      number: address.number.value,
      postalCode: address.postalCode.value,
      reference: address.reference.value,
      state: address.state.value,
      street: address.street.value,
      addressQuery: address.addressQuery.value,
    }

    const variables = {
      input: {
        name,
        addresses: [newAddress],
      },
    }

    createCostCenter({ variables })
      .then(() => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        toastMessage(messages.toastAddCostCenterSuccess)
        refetchCostCenters({ ...costCenterPaginationState })
      })
      .catch(error => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        console.error(error)
        toastMessage(messages.toastAddCostCenterFailure)
      })
  }

  const handleCloseModal = () => {
    setNewCostCenterModalState(false)
  }

  const getCostCenterSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.columnName),
      },
      addresses: {
        title: formatMessage(messages.columnAddresses),
        cellRenderer: ({ rowData: { addresses } }: CellRendererProps) => (
          <span>{addresses.length}</span>
        ),
      },
    },
  })

  if (!isAuthenticated) {
    return (
      <Layout
        fullWidth
        pageHeader={<PageHeader title={formatMessage(messages.pageTitle)} />}
      >
        <PageBlock>
          <FormattedMessage id="store/b2b-organizations.not-authenticated" />
        </PageBlock>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout
        fullWidth
        pageHeader={<PageHeader title={formatMessage(messages.pageTitle)} />}
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="store/b2b-organizations.organization-details.empty-state" />
          )}
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      fullWidth
      pageHeader={<PageHeader title={data.getOrganizationById?.name} />}
    >
      <PageBlock title={formatMessage(messages.costCenters)}>
        <Table
          fullWidth
          schema={getCostCenterSchema()}
          items={costCentersData?.getCostCentersByOrganizationId?.data}
          onRowClick={({ rowData: { id } }: CellRendererProps) => {
            if (!id) return

            navigate({
              page: 'store.costcenter-details',
              params: { id },
            })
          }}
          pagination={{
            onNextClick: handleCostCentersNextClick,
            onPrevClick: handleCostCentersPrevClick,
            onRowsChange: handleCostCentersRowsChange,
            currentItemFrom:
              (costCenterPaginationState.page - 1) *
                costCenterPaginationState.pageSize +
              1,
            currentItemTo:
              costCentersData?.getCostCentersByOrganizationId?.pagination
                ?.total <
              costCenterPaginationState.page *
                costCenterPaginationState.pageSize
                ? costCentersData?.getCostCentersByOrganizationId?.pagination
                    ?.total
                : costCenterPaginationState.page *
                  costCenterPaginationState.pageSize,
            textShowRows: formatMessage(messages.showRows),
            textOf: formatMessage(messages.of),
            totalItems:
              costCentersData?.getCostCentersByOrganizationId?.pagination
                ?.total ?? 0,
            rowsOptions: [25, 50, 100],
          }}
          toolbar={{
            newLine: {
              label: formatMessage(messages.new),
              handleCallback: () => setNewCostCenterModalState(true),
            },
          }}
        ></Table>
      </PageBlock>
      <NewCostCenterModal
        isOpen={newCostCenterModalState}
        loading={loadingState}
        handleAddNewCostCenter={handleAddNewCostCenter}
        handleCloseModal={handleCloseModal}
      />
    </Layout>
  )
}

export default OrganizationDetails
