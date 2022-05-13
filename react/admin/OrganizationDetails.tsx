import type { FunctionComponent } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  Button,
  IconCheck,
  Tabs,
  Tab,
  Spinner,
  PageBlock,
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { HashRouter, Route, Switch } from 'react-router-dom'

import { organizationMessages as messages } from './utils/messages'
import GET_ORGANIZATION from '../graphql/getOrganization.graphql'
import UPDATE_ORGANIZATION from '../graphql/updateOrganization.graphql'
import OrganizationDetailsConstCenters from './OrganizationDetails/OrganizationDetailsConstCenters'
import type { Collection } from './OrganizationDetails/OrganizationDetailsCollections'
import OrganizationDetailsCollections from './OrganizationDetails/OrganizationDetailsCollections'
import type { PaymentTerm } from './OrganizationDetails/OrganizationDetailsPayTerms'
import OrganizationDetailsPayTerms from './OrganizationDetails/OrganizationDetailsPayTerms'
import type { PriceTable } from './OrganizationDetails/OrganizationDetailsPriceTables'
import OrganizationDetailsPriceTables from './OrganizationDetails/OrganizationDetailsPriceTables'
import OrganizationDetailsUsers from './OrganizationDetails/OrganizationDetailsUsers'
import OrganizationDetailsDefault from './OrganizationDetails/OrganizationDetailsDefault'
import useHashRouter from './OrganizationDetails/useHashRouter'

export interface CellRendererProps<RowType> {
  cellData: unknown
  rowData: RowType
  updateCellMeasurements: () => void
}

const SESSION_STORAGE_KEY = 'organization-details-tab'

const OrganizationDetails: FunctionComponent = () => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()
  const {
    route: { params },
    navigate,
  } = useRuntime()

  const showToast = useToast()

  /**
   * States
   */
  const [organizationNameState, setOrganizationNameState] = useState('')
  const [statusState, setStatusState] = useState('')
  const [collectionsState, setCollectionsState] = useState([] as Collection[])
  const [priceTablesState, setPriceTablesState] = useState([] as string[])
  const [paymentTermsState, setPaymentTermsState] = useState(
    [] as PaymentTerm[]
  )

  const routerRef = useRef(null as any)
  const { tab, handleTabChange } = useHashRouter({
    routerRef,
    sessionKey: SESSION_STORAGE_KEY,
  })

  const [loadingState, setLoadingState] = useState(false)

  /**
   * Queries
   */
  const { data, loading, refetch } = useQuery(GET_ORGANIZATION, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  /**
   * Mutations
   */
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION)

  /**
   * Functions
   */
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

  /**
   * Effects
   */
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

  /**
   * Data Variables
   */
  const tabsList = [
    {
      label: 'Default',
      tab: 'default',
      component: (
        <OrganizationDetailsDefault
          organizationNameState={organizationNameState}
          setOrganizationNameState={setOrganizationNameState}
          statusState={statusState}
          setStatusState={setStatusState}
          data={data}
        />
      ),
    },
    {
      label: 'Cost Centers',
      tab: 'cost-centers',
      component: (
        <OrganizationDetailsConstCenters
          setLoadingState={setLoadingState}
          showToast={showToast}
          loadingState={loadingState}
        />
      ),
    },
    {
      label: 'Collections',
      tab: 'collections',
      component: (
        <OrganizationDetailsCollections
          getSchema={getSchema}
          collectionsState={collectionsState}
          setCollectionsState={setCollectionsState}
        />
      ),
    },
    {
      label: 'Pay terms',
      tab: 'pay-terms',

      component: (
        <OrganizationDetailsPayTerms
          getSchema={getSchema}
          paymentTermsState={paymentTermsState}
          setPaymentTermsState={setPaymentTermsState}
        />
      ),
    },
    {
      label: 'Price Tables',
      tab: 'price-tables',
      component: (
        <OrganizationDetailsPriceTables
          getSchema={getSchema}
          priceTablesState={priceTablesState}
          setPriceTablesState={setPriceTablesState}
        />
      ),
    },
    {
      label: 'Users',
      tab: 'users',
      component: (
        <OrganizationDetailsUsers params={params} loadingState={loadingState} />
      ),
    },
  ]

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
      {loading ? (
        <PageBlock>
          <Spinner />
        </PageBlock>
      ) : (
        (data && (
          <HashRouter ref={routerRef}>
            <Tabs>
              {tabsList.map((item: { label: string; tab: string }) => (
                <Tab
                  label={item.label}
                  active={tab === item.tab}
                  onClick={() => handleTabChange(item.tab)}
                />
              ))}
            </Tabs>

            <Switch>
              {tabsList.map(({ tab: path, component }) => (
                <Route path={`/${path}`} exact>
                  {component}
                </Route>
              ))}
            </Switch>
          </HashRouter>
        )) ?? (
          <PageBlock>
            <FormattedMessage id="admin/b2b-organizations.organization-details.empty-state" />
          </PageBlock>
        )
      )}
    </Layout>
  )
}

export default OrganizationDetails
