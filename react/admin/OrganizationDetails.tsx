import type { FunctionComponent, ChangeEvent } from 'react'
import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Table,
  Dropdown,
  Spinner,
  Button,
  Input,
  ModalDialog,
} from 'vtex.styleguide'
import { toast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
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
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'
import UPDATE_ORGANIZATION from '../graphql/updateOrganization.graphql'
import GET_COLLECTIONS from '../graphql/getCollections.graphql'
import GET_PAYMENT_TERMS from '../graphql/getPaymentTerms.graphql'
import GET_PRICE_TABLES from '../graphql/getPriceTables.graphql'
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

interface Collection {
  collectionId: string
  name: string
}

interface PriceTable {
  name: string
}

interface PaymentTerm {
  id: number
  name: string
}

const adminPrefix = 'admin/b2b-organizations.'

const messages = defineMessages({
  statusActive: {
    id: `${adminPrefix}organization-details.status.active`,
  },
  statusOnHold: {
    id: `${adminPrefix}organization-details.status.on-hold`,
  },
  statusInactive: {
    id: `${adminPrefix}organization-details.status.inactive`,
  },
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-details.toast.update-failure`,
  },
  toastAddCostCenterSuccess: {
    id: `${adminPrefix}organization-details.toast.add-costCenter-success`,
  },
  toastAddCostCenterFailure: {
    id: `${adminPrefix}organization-details.toast.add-costCenter-failure`,
  },
  columnName: {
    id: `${adminPrefix}organization-details.table.column-name.title`,
  },
  columnAddresses: {
    id: `${adminPrefix}organization-details.table.column-addresses.title`,
  },
  pageTitle: {
    id: `${adminPrefix}organization-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  status: {
    id: `${adminPrefix}organization-details.status`,
  },
  costCenters: {
    id: `${adminPrefix}organization-details.costCenters`,
  },
  showRows: {
    id: `${adminPrefix}showRows`,
  },
  of: {
    id: `${adminPrefix}of`,
  },
  new: {
    id: `${adminPrefix}organization-details.button.new`,
  },
  collections: {
    id: `${adminPrefix}organization-details.collections`,
  },
  paymentTerms: {
    id: `${adminPrefix}organization-details.paymentTerms`,
  },
  priceTables: {
    id: `${adminPrefix}organization-details.price-tables`,
  },
  selectedRows: {
    id: `${adminPrefix}selected-rows`,
  },
  removeFromOrg: {
    id: `${adminPrefix}organization-details.remove-from-org`,
  },
  addToOrg: {
    id: `${adminPrefix}organization-details.add-to-org`,
  },
  add: {
    id: `${adminPrefix}organization-details.button.add`,
  },
  cancel: {
    id: `${adminPrefix}organization-details.button.cancel`,
  },
  costCenterName: {
    id: `${adminPrefix}costCenter-details.costCenter-name`,
  },
})

const OrganizationDetails: FunctionComponent = () => {
  const { formatMessage, formatDate } = useIntl()

  const statusOptions = [
    {
      value: 'active',
      label: formatMessage(messages.statusActive),
    },
    {
      value: 'on-hold',
      label: formatMessage(messages.statusOnHold),
    },
    {
      value: 'inactive',
      label: formatMessage(messages.statusInactive),
    },
  ]

  const {
    culture: { country },
    route: { params },
    navigate,
  } = useRuntime()

  const [organizationNameState, setOrganizationNameState] = useState('')
  const [statusState, setStatusState] = useState('')
  const [collectionsState, setCollectionsState] = useState([] as Collection[])
  const [collectionOptions, setCollectionOptions] = useState([] as Collection[])
  const [priceTablesState, setPriceTablesState] = useState([] as string[])
  const [priceTableOptions, setPriceTableOptions] = useState([] as PriceTable[])
  const [costCenterPaginationState, setCostCenterPaginationState] = useState({
    page: 1,
    pageSize: 25,
  })

  const [collectionPaginationState, setCollectionPaginationState] = useState({
    page: 1,
    pageSize: 25,
  })

  const [paymentTermsState, setPaymentTermsState] = useState(
    [] as PaymentTerm[]
  )

  const [paymentTermsOptions, setPaymentTermsOptions] = useState(
    [] as PaymentTerm[]
  )

  const [loadingState, setLoadingState] = useState(false)
  const [newCostCenterModalState, setNewCostCenterModalState] = useState(false)
  const [newCostCenterName, setNewCostCenterName] = useState('')
  const [newCostCenterAddressState, setNewCostCenterAddressState] = useState(
    addValidation(getEmptyAddress(country))
  )

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const { data: costCentersData, refetch: refetchCostCenters } = useQuery(
    GET_COST_CENTERS,
    {
      variables: { ...costCenterPaginationState, id: params?.id },
      skip: !params?.id,
      ssr: false,
    }
  )

  const { data: collectionsData, refetch: refetchCollections } = useQuery(
    GET_COLLECTIONS,
    { ssr: false }
  )

  const { data: paymentTermsData } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  const { data: priceTablesData } = useQuery(GET_PRICE_TABLES, { ssr: false })
  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION)
  const [createCostCenter] = useMutation(CREATE_COST_CENTER)

  useEffect(() => {
    if (!data?.getOrganizationById || statusState) return
    setOrganizationNameState(data.getOrganizationById.name)
    setStatusState(data.getOrganizationById.status)
    setCollectionsState(data.getOrganizationById.collections ?? [])
    setPaymentTermsState(data.getOrganizationById.paymentTerms ?? [])
    setPriceTablesState(data.getOrganizationById.priceTables ?? [])
  }, [data])

  useEffect(() => {
    if (!priceTablesData?.priceTables?.length || priceTableOptions.length) {
      return
    }

    const options = [] as PriceTable[]

    priceTablesData.priceTables.forEach((priceTable: string) => {
      options.push({ name: priceTable })
    })

    setPriceTableOptions(options)
  }, [priceTablesData])

  useEffect(() => {
    if (
      !collectionsData?.collections?.items?.length ||
      collectionOptions.length
    ) {
      return
    }

    const collections =
      collectionsData.collections.items.map((collection: any) => {
        return { name: collection.name, collectionId: collection.id }
      }) ?? []

    setCollectionOptions(collections)
  }, [collectionsData])

  useEffect(() => {
    if (
      !paymentTermsData?.getPaymentTerms?.length ||
      paymentTermsOptions.length
    ) {
      return
    }

    setPaymentTermsOptions(paymentTermsData.getPaymentTerms)
  }, [paymentTermsData])

  const handleCostCentersPrevClick = () => {
    if (costCenterPaginationState.page === 1) return

    const newPage = costCenterPaginationState.page - 1

    setCostCenterPaginationState({
      ...costCenterPaginationState,
      page: newPage,
    })

    refetchCostCenters({
      ...costCenterPaginationState,
      id: params?.id,
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
      id: params?.id,
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
      id: params?.id,
      page: 1,
      pageSize: +value,
    })
  }

  const handleCollectionsPrevClick = () => {
    if (collectionPaginationState.page === 1) return

    const newPage = collectionPaginationState.page - 1

    setCollectionPaginationState({
      ...collectionPaginationState,
      page: newPage,
    })

    refetchCollections({
      ...collectionPaginationState,
      page: newPage,
    })
  }

  const handleCollectionsNextClick = () => {
    const newPage = collectionPaginationState.page + 1

    setCollectionPaginationState({
      ...collectionPaginationState,
      page: newPage,
    })

    refetchCollections({
      ...collectionPaginationState,
      page: newPage,
    })
  }

  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setCollectionPaginationState({
      page: 1,
      pageSize: +value,
    })

    refetchCollections({
      page: 1,
      pageSize: +value,
    })
  }

  const handleUpdateOrganization = () => {
    setLoadingState(true)

    const collections = collectionsState.map((collection) => {
      return { name: collection.name, id: collection.collectionId }
    })

    const variables = {
      id: params?.id,
      status: statusState,
      collections,
      paymentTerms: paymentTermsState,
      priceTables: priceTablesState,
    }

    updateOrganization({ variables })
      .then(() => {
        setLoadingState(false)
        toast.dispatch({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch({ id: params?.id })
      })
      .catch((error) => {
        setLoadingState(false)
        console.error(error)
        toast.dispatch({
          type: 'error',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
  }

  const handleAddCollections = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newCollections = [] as Collection[]

    selectedRows.forEach((row: any) => {
      newCollections.push({ name: row.name, collectionId: row.collectionId })
    })

    setCollectionsState([...collectionsState, ...newCollections])
  }

  const handleRemoveCollections = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const collectionsToRemove = [] as string[]

    selectedRows.forEach((row: any) => {
      collectionsToRemove.push(row.collectionId)
    })

    const newCollectionList = collectionsState.filter(
      (collection) => !collectionsToRemove.includes(collection.collectionId)
    )

    setCollectionsState(newCollectionList)
  }

  const handleAddPaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams

    setPaymentTermsState([...paymentTermsState, ...selectedRows])
  }

  const handleRemovePaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const paymentTermsToRemove = [] as number[]

    selectedRows.forEach((row) => {
      paymentTermsToRemove.push(row.id)
    })

    const newPaymentTerms = paymentTermsState.filter(
      (paymentTerm) => !paymentTermsToRemove.includes(paymentTerm.id)
    )

    setPaymentTermsState(newPaymentTerms)
  }

  const handleAddPriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newPriceTables = [] as string[]

    selectedRows.forEach((row: any) => {
      newPriceTables.push(row.name)
    })

    setPriceTablesState((prevState) => [...prevState, ...newPriceTables])
  }

  const handleRemovePriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const priceTablesToRemove = [] as string[]

    selectedRows.forEach((row: any) => {
      priceTablesToRemove.push(row.name)
    })

    const newPriceTablesList = priceTablesState.filter(
      (priceTable) => !priceTablesToRemove.includes(priceTable)
    )

    setPriceTablesState(newPriceTablesList)
  }

  const handleAddNewCostCenter = () => {
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
      organizationId: params.id,
      input: {
        name: newCostCenterName,
        addresses: [newAddress],
      },
    }

    createCostCenter({ variables })
      .then(() => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        toast.dispatch({
          type: 'success',
          message: formatMessage(messages.toastAddCostCenterSuccess),
        })
        refetchCostCenters({ ...costCenterPaginationState, id: params?.id })
      })
      .catch((error) => {
        setNewCostCenterModalState(false)
        setLoadingState(false)
        console.error(error)
        toast.dispatch({
          type: 'error',
          message: formatMessage(messages.toastAddCostCenterFailure),
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
    setNewCostCenterModalState(false)
    setNewCostCenterName('')
    setNewCostCenterAddressState(addValidation(getEmptyAddress(country)))
  }

  const getSchema = () => ({
    properties: {
      name: {
        title: formatMessage(messages.columnName),
      },
    },
  })

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

  if (!data) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.pageTitle)}
            linkLabel={formatMessage(messages.back)}
            onLinkClick={() => {
              navigate({
                page: 'admin.app.b2b-organizations.organizations',
              })
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="admin/b2b-organizations.organization-details.empty-state" />
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
          title={formatMessage(messages.pageTitle)}
          linkLabel={formatMessage(messages.back)}
          onLinkClick={() => {
            navigate({
              page: 'admin.app.b2b-organizations.organizations',
            })
          }}
        >
          <Button
            variation="primary"
            isLoading={loadingState}
            onClick={() => handleUpdateOrganization()}
          >
            <FormattedMessage id="admin/b2b-organizations.organization-details.button.save" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <Input
          size="large"
          label={
            <h4 className="t-heading-5 mb0 pt3">
              <FormattedMessage id="admin/b2b-organizations.organization-details.organization-name" />
            </h4>
          }
          value={organizationNameState}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setOrganizationNameState(e.target.value)
          }}
          required
        />
        <div className="pv3">
          <Dropdown
            label={
              <h4 className="t-heading-5 mb0 pt3">
                <FormattedMessage id="admin/b2b-organizations.organization-details.status" />
              </h4>
            }
            placeholder={formatMessage(messages.status)}
            options={statusOptions}
            value={statusState}
            onChange={(_: any, v: string) => setStatusState(v)}
          />
        </div>
        <h4 className="t-heading-5 mb0 pt3">
          <FormattedMessage id="admin/b2b-organizations.organization-details.created" />
        </h4>
        <div className="mv3">
          {formatDate(data.getOrganizationById.created, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
        </div>
      </PageBlock>
      <PageBlock title={formatMessage(messages.costCenters)}>
        <Table
          fullWidth
          schema={getCostCenterSchema()}
          items={costCentersData?.getCostCentersByOrganizationId?.data}
          onRowClick={({ rowData: { id } }: CellRendererProps) => {
            if (!id) return

            navigate({
              page: 'admin.app.b2b-organizations.costCenter-details',
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
      <PageBlock variation="half" title={formatMessage(messages.collections)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={collectionsState}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.removeFromOrg),
                handleCallback: (rowParams: any) =>
                  handleRemoveCollections(rowParams),
              },
            }}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={collectionOptions}
            pagination={{
              onNextClick: handleCollectionsNextClick,
              onPrevClick: handleCollectionsPrevClick,
              onRowsChange: handleRowsChange,
              currentItemFrom:
                (collectionPaginationState.page - 1) *
                  collectionPaginationState.pageSize +
                1,
              currentItemTo:
                collectionsData?.collections?.paging?.total <
                collectionPaginationState.page *
                  collectionPaginationState.pageSize
                  ? collectionsData?.collections?.paging?.total
                  : collectionPaginationState.page *
                    collectionPaginationState.pageSize,
              textShowRows: formatMessage(messages.showRows),
              textOf: formatMessage(messages.of),
              totalItems: collectionsData?.collections?.paging?.total ?? 0,
              rowsOptions: [25, 50, 100],
            }}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.addToOrg),
                handleCallback: (rowParams: any) =>
                  handleAddCollections(rowParams),
              },
            }}
          />
        </div>
      </PageBlock>
      <PageBlock variation="half" title={formatMessage(messages.paymentTerms)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={paymentTermsState}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.removeFromOrg),
                handleCallback: (rowParams: any) =>
                  handleRemovePaymentTerms(rowParams),
              },
            }}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={paymentTermsOptions}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.addToOrg),
                handleCallback: (rowParams: any) =>
                  handleAddPaymentTerms(rowParams),
              },
            }}
          />
        </div>
      </PageBlock>
      <PageBlock variation="half" title={formatMessage(messages.priceTables)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={priceTablesState.map((priceTable) => {
              return { name: priceTable }
            })}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.removeFromOrg),
                handleCallback: (rowParams: any) =>
                  handleRemovePriceTables(rowParams),
              },
            }}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={priceTableOptions}
            bulkActions={{
              texts: {
                rowsSelected: (qty: number) =>
                  formatMessage(messages.selectedRows, {
                    qty,
                  }),
              },
              main: {
                label: formatMessage(messages.addToOrg),
                handleCallback: (rowParams: any) =>
                  handleAddPriceTables(rowParams),
              },
            }}
          />
        </div>
      </PageBlock>
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleAddNewCostCenter(),
          label: formatMessage(messages.add),
          disabled:
            !newCostCenterName || !isValidAddress(newCostCenterAddressState),
        }}
        cancelation={{
          onClick: () => handleCloseModal(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={newCostCenterModalState}
        onClose={() => handleCloseModal()}
        closeOnOverlayClick={false}
      >
        <p className="f3 f1-ns fw3 gray">
          <FormattedMessage id="admin/b2b-organizations.organization-details.add-costCenter" />
        </p>
        <div className="w-100 mv6">
          <Input
            size="large"
            label={formatMessage(messages.costCenterName)}
            value={newCostCenterName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNewCostCenterName(e.target.value)
            }}
            required
          />
        </div>
        <div className="w-100 mv6">
          <FormattedMessage id="admin/b2b-organizations.organization-details.add-costCenter.helpText" />
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

export default OrganizationDetails
