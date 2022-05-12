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
  IconCheck,
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'

import OrganizationUsersTable from '../components/OrganizationUsersTable'
import { organizationMessages as messages } from './utils/messages'
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import UPDATE_ORGANIZATION from '../graphql/updateOrganization.graphql'
import GET_COLLECTIONS from '../graphql/getCollections.graphql'
import GET_PAYMENT_TERMS from '../graphql/getPaymentTerms.graphql'
import GET_PRICE_TABLES from '../graphql/getPriceTables.graphql'
import GET_SALES_CHANNELS from '../graphql/getSalesChannels.graphql'
import OrganizationDetailsConstCenters from './OrganizationDetails/OrganizationDetailsConstCenters'

export interface CellRendererProps<RowType> {
  cellData: unknown
  rowData: RowType
  updateCellMeasurements: () => void
}

interface Collection {
  collectionId: string
  name: string
}

interface PriceTable {
  tableId: string
  name?: string
}

interface PaymentTerm {
  paymentTermId: number
  name: string
}

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
    route: { params },
    navigate,
  } = useRuntime()

  const showToast = useToast()

  const [organizationNameState, setOrganizationNameState] = useState('')
  const [statusState, setStatusState] = useState('')
  const [collectionsState, setCollectionsState] = useState([] as Collection[])
  const [collectionOptions, setCollectionOptions] = useState([] as Collection[])
  const [priceTablesState, setPriceTablesState] = useState([] as string[])
  const [priceTableOptions, setPriceTableOptions] = useState([] as PriceTable[])

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

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const {
    data: collectionsData,
    refetch: refetchCollections,
  } = useQuery(GET_COLLECTIONS, { ssr: false })

  const { data: paymentTermsData } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  const { data: priceTablesData } = useQuery(GET_PRICE_TABLES, { ssr: false })
  const { data: salesChannelsData } = useQuery(GET_SALES_CHANNELS, {
    ssr: false,
  })

  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION)

  useEffect(() => {
    if (!data?.getOrganizationById || statusState) return

    const collections =
      data.getOrganizationById.collections?.map((collection: any) => {
        return { name: collection.name, collectionId: collection.id }
      }) ?? []

    const paymentTerms =
      data.getOrganizationById.paymentTerms?.map((paymentTerm: any) => {
        return { name: paymentTerm.name, paymentTermId: paymentTerm.id }
      }) ?? []

    setOrganizationNameState(data.getOrganizationById.name)
    setStatusState(data.getOrganizationById.status)
    setCollectionsState(collections)
    setPaymentTermsState(paymentTerms)
    setPriceTablesState(data.getOrganizationById.priceTables ?? [])
  }, [data])

  useEffect(() => {
    if (
      !priceTablesData?.priceTables?.length ||
      !salesChannelsData?.salesChannels?.length
    ) {
      return
    }

    const options = [] as PriceTable[]

    salesChannelsData.salesChannels.forEach(
      (channel: { id: string; name: string }) => {
        options.push({
          tableId: channel.id,
          name: `${channel.name} (${channel.id})`,
        })
      }
    )

    priceTablesData.priceTables.forEach((priceTable: string) => {
      if (!options.find(option => option.tableId === priceTable)) {
        options.push({ tableId: priceTable })
      }
    })

    setPriceTableOptions(options)
  }, [priceTablesData, salesChannelsData])

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

    const paymentTerms =
      paymentTermsData.getPaymentTerms.map((paymentTerm: any) => {
        return { name: paymentTerm.name, paymentTermId: paymentTerm.id }
      }) ?? []

    setPaymentTermsOptions(paymentTerms)
  }, [paymentTermsData])

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

    const collections = collectionsState.map(collection => {
      return { name: collection.name, id: collection.collectionId }
    })

    const paymentTerms = paymentTermsState.map(paymentTerm => {
      return { name: paymentTerm.name, id: paymentTerm.paymentTermId }
    })

    const variables = {
      id: params?.id,
      name: organizationNameState,
      status: statusState,
      collections,
      paymentTerms,
      priceTables: priceTablesState,
    }

    updateOrganization({ variables })
      .then(() => {
        setLoadingState(false)
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch({ id: params?.id })
      })
      .catch(error => {
        setLoadingState(false)
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
  }

  const handleAddCollections = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newCollections = [] as Collection[]

    selectedRows.forEach((row: any) => {
      if (
        !collectionsState.some(
          collection => collection.collectionId === row.collectionId
        )
      ) {
        newCollections.push({ name: row.name, collectionId: row.collectionId })
      }
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
      collection => !collectionsToRemove.includes(collection.collectionId)
    )

    setCollectionsState(newCollectionList)
  }

  const handleAddPaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const newPaymentTerms = [] as PaymentTerm[]

    selectedRows.forEach((row: any) => {
      if (
        !paymentTermsState.some(
          paymentTerm => paymentTerm.paymentTermId === row.paymentTermId
        )
      ) {
        newPaymentTerms.push({
          name: row.name,
          paymentTermId: row.paymentTermId,
        })
      }
    })

    setPaymentTermsState([...paymentTermsState, ...newPaymentTerms])
  }

  const handleRemovePaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const paymentTermsToRemove = [] as number[]

    selectedRows.forEach(row => {
      paymentTermsToRemove.push(row.paymentTermId)
    })

    const newPaymentTerms = paymentTermsState.filter(
      paymentTerm => !paymentTermsToRemove.includes(paymentTerm.paymentTermId)
    )

    setPaymentTermsState(newPaymentTerms)
  }

  const handleAddPriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const newPriceTables = [] as string[]

    selectedRows.forEach((row: PriceTable) => {
      if (!priceTablesState.includes(row.tableId)) {
        newPriceTables.push(row.tableId)
      }
    })

    setPriceTablesState(prevState => [...prevState, ...newPriceTables])
  }

  const handleRemovePriceTables = (rowParams: any) => {
    const { selectedRows = [] } = rowParams
    const priceTablesToRemove = [] as string[]

    selectedRows.forEach((row: PriceTable) => {
      priceTablesToRemove.push(row.tableId)
    })

    const newPriceTablesList = priceTablesState.filter(
      priceTable => !priceTablesToRemove.includes(priceTable)
    )

    setPriceTablesState(newPriceTablesList)
  }

  const getSchema = (
    type?: 'availablePriceTables' | 'availableCollections' | 'availablePayments'
  ) => {
    let cellRenderer

    switch (type) {
      case 'availablePriceTables':
        cellRenderer = ({
          rowData: { tableId, name },
        }: CellRendererProps<PriceTable>) => {
          const assigned = priceTablesState.includes(tableId)

          return (
            <span className={assigned ? 'c-disabled' : ''}>
              {name ?? tableId}
              {assigned && <IconCheck />}
            </span>
          )
        }

        break

      case 'availableCollections':
        cellRenderer = ({
          rowData: { name },
        }: CellRendererProps<Collection>) => {
          const assigned = collectionsState.some(
            collection => collection.name === name
          )

          return (
            <span className={assigned ? 'c-disabled' : ''}>
              {name}
              {assigned && <IconCheck />}
            </span>
          )
        }

        break

      case 'availablePayments':
        cellRenderer = ({
          rowData: { name },
        }: CellRendererProps<PaymentTerm>) => {
          const assigned = paymentTermsState.some(
            payment => payment.name === name
          )

          return (
            <span className={assigned ? 'c-disabled' : ''}>
              {name}
              {assigned && <IconCheck />}
            </span>
          )
        }

        break

      default:
        break
    }

    return {
      properties: {
        name: {
          title: formatMessage(messages.detailsColumnName),
          ...(cellRenderer && { cellRenderer }),
        },
      },
    }
  }

  if (!data) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.detailsPageTitle)}
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
          title={formatMessage(messages.detailsPageTitle)}
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
      {/* <HashRouter ref={routerRef}> */}
      {/*  <Tabs> */}
      {/*    <Tab */}
      {/*      label={formatMessage(messages.tablePageTitle)} */}
      {/*      active={tab === 'organizations'} */}
      {/*      onClick={() => handleTabChange('organizations')} */}
      {/*    /> */}
      {/*    <Tab */}
      {/*      label={formatMessage(requestMessages.tablePageTitle)} */}
      {/*      active={tab === 'requests'} */}
      {/*      onClick={() => handleTabChange('requests')} */}
      {/*    /> */}
      {/*  </Tabs> */}
      {/*  <Container> */}
      {/*    <Switch> */}
      {/*      <Route path="/organizations" exact component={OrganizationsList} /> */}
      {/*      <Route */}
      {/*        path="/requests" */}
      {/*        exact */}
      {/*        component={OrganizationRequestsTable} */}
      {/*      /> */}
      {/*    </Switch> */}
      {/*  </Container> */}
      {/* </HashRouter> */}

      <PageBlock>
        <Input
          autocomplete="off"
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
            onChange={(_: void, v: string) => setStatusState(v)}
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
      <OrganizationDetailsConstCenters
        setLoadingState={setLoadingState}
        showToast={showToast}
        loadingState={loadingState}
      />
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
            schema={getSchema('availableCollections')}
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
            schema={getSchema('availablePayments')}
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
            items={priceTablesState.map(priceTable => {
              return {
                tableId: priceTable,
                name:
                  priceTableOptions.find(
                    option => option.tableId === priceTable
                  )?.name ?? priceTable,
              }
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
            schema={getSchema('availablePriceTables')}
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
      <PageBlock title={formatMessage(messages.users)}>
        <OrganizationUsersTable
          organizationId={params?.id}
          permissions={[]}
          refetchCostCenters={loadingState}
          isAdmin={true}
        />
      </PageBlock>
    </Layout>
  )
}

export default OrganizationDetails
