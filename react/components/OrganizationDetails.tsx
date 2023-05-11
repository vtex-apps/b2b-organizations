import React, { useState, useContext, useEffect, useCallback } from 'react'
import type { FunctionComponent, ChangeEvent } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Spinner,
  Table,
  ToastContext,
} from 'vtex.styleguide'
import { useQuery, useMutation } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'

import { organizationMessages as messages } from './utils/messages'
import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import NewCostCenterModal from './NewCostCenterModal'
import OrganizationUsersTable from './OrganizationUsersTable'
import GET_ORGANIZATION from '../graphql/getOrganizationStorefront.graphql'
import GET_COST_CENTERS from '../graphql/getCostCentersByOrganizationIdStorefront.graphql'
import CREATE_COST_CENTER from '../graphql/createCostCenter.graphql'
import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import OrganizationsWithoutSalesManager from './OrganizationsWithoutSalesManager'

interface RouterProps {
  match: Match
  history: any
}

interface Match {
  isExact: boolean
  params: any
  path: string
  url: string
}

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

interface Role {
  id: string
  name: string
  slug: string
}

const CSS_HANDLES = ['createCostCenter'] as const

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const OrganizationDetails: FunctionComponent<RouterProps> = ({
  match: { params },
  history,
}) => {
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'b2b-organizations_isAuthenticated',
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

  const [permissionsState, setPermissionsState] = useState([] as string[])
  const [roleState, setRoleState] = useState(null as Role | null)

  const isSalesAdmin = useCallback((): boolean => {
    return roleState !== null && new RegExp(/sales-admin/g).test(roleState.slug)
  }, [roleState])

  const isSales = useCallback((): boolean => {
    return roleState !== null && new RegExp(/sales-/g).test(roleState.slug)
  }, [roleState])

  const [loadingState, setLoadingState] = useState(false)
  const [newCostCenterModalState, setNewCostCenterModalState] = useState(false)

  const { data, loading } = useQuery(GET_ORGANIZATION, {
    variables: { id: params?.id },
    ssr: false,
  })

  const {
    data: costCentersData,
    loading: costCentersLoading,
    refetch: refetchCostCenters,
  } = useQuery(GET_COST_CENTERS, {
    variables: { ...costCenterPaginationState },
    fetchPolicy: 'network-only',
    ssr: false,
  })

  const {
    data: permissionsData,
    // loading: permissionsLoading,
  } = useQuery(GET_PERMISSIONS, { ssr: false })

  const [createCostCenter] = useMutation(CREATE_COST_CENTER)

  useEffect(() => {
    if (!permissionsData) return

    const { permissions = [], role } = permissionsData.checkUserPermission ?? {}

    if (permissions.length) {
      setPermissionsState(permissions)
    }

    if (role) {
      setRoleState(role)
    }
  }, [permissionsData])

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

  const handleAddNewCostCenter = ({
    name,
    address,
    phoneNumber,
    businessDocument,
    customFields,
  }: {
    name: string
    address: AddressFormFields
    phoneNumber: string
    businessDocument: string
    customFields: CustomField[]
  }) => {
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
        phoneNumber,
        businessDocument,
        customFields,
      },
    }

    createCostCenter({ variables })
      .then(() => {
        setNewCostCenterModalState(false)
        setTimeout(() => {
          setLoadingState(false)
          toastMessage(messages.toastAddCostCenterSuccess)
          refetchCostCenters({ ...costCenterPaginationState })
        }, 500)
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
      pageHeader={
        <PageHeader
          title={
            roleState && !isSalesAdmin()
              ? data.getOrganizationByIdStorefront?.name
              : formatMessage(messages.salesAdminTitle)
          }
          linkLabel={formatMessage(messages.back)}
          onLinkClick={() => {
            history.push(`/`)
          }}
        />
      }
    >
      {roleState && !isSales() && (
        <div className={`${handles.createCostCenter}`}>
          <PageBlock title={formatMessage(messages.costCenters)}>
            <Table
              fullWidth
              schema={getCostCenterSchema()}
              items={
                costCentersData?.getCostCentersByOrganizationIdStorefront?.data
              }
              loading={costCentersLoading}
              onRowClick={({ rowData: { id } }: CellRendererProps) => {
                if (!id) return

                history.push(`/cost-center/${id}`)
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
                  costCentersData?.getCostCentersByOrganizationIdStorefront
                    ?.pagination?.total <
                  costCenterPaginationState.page *
                    costCenterPaginationState.pageSize
                    ? costCentersData?.getCostCentersByOrganizationIdStorefront
                        ?.pagination?.total
                    : costCenterPaginationState.page *
                      costCenterPaginationState.pageSize,
                textShowRows: formatMessage(messages.showRows),
                textOf: formatMessage(messages.of),
                totalItems:
                  costCentersData?.getCostCentersByOrganizationIdStorefront
                    ?.pagination?.total ?? 0,
                rowsOptions: [25, 50, 100],
              }}
              toolbar={{
                newLine: {
                  label: formatMessage(messages.new),
                  handleCallback: () => setNewCostCenterModalState(true),
                  disabled: !permissionsState.includes(
                    'create-cost-center-organization'
                  ),
                },
              }}
            />
          </PageBlock>
        </div>
      )}

      {roleState && isSalesAdmin() && <OrganizationsWithoutSalesManager />}

      <PageBlock title={formatMessage(messages.users)}>
        {roleState && (
          <OrganizationUsersTable
            organizationId={data.getOrganizationByIdStorefront?.id}
            permissions={permissionsState}
            refetchCostCenters={loadingState}
            isSalesAdmin={isSalesAdmin()}
          />
        )}
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
