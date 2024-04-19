import type { ChangeEvent } from 'react'
import React, { Fragment, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import { organizationBulkAction } from '../utils/organizationBulkAction'
import GET_COLLECTIONS from '../../graphql/getCollections.graphql'

export interface Collection {
  collectionId: string
  name: string
}

const OrganizationDetailsCollections = ({
  getSchema,
  collectionsState,
  setCollectionsState,
}: {
  getSchema: (argument?: any) => any
  collectionsState: Collection[]
  setCollectionsState: (value: any) => void
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()
  /**
   * States
   */

  const [collectionOptions, setCollectionOptions] = useState([] as Collection[])
  const [collectionPaginationState, setCollectionPaginationState] = useState({
    page: 1,
    pageSize: 25,
  })

  /**
   * Queries
   */
  const {
    data: collectionsData,
    refetch: refetchCollections,
    loading,
  } = useQuery(GET_COLLECTIONS, {
    variables: collectionPaginationState,
    notifyOnNetworkStatusChange: true,
    ssr: false,
  })

  /**
   * Effects
   */

  useEffect(() => {
    if (!collectionsData?.collections?.items?.length) {
      return
    }

    const collections =
      collectionsData.collections.items.map((collection: any) => {
        return { name: collection.name, collectionId: collection.id }
      }) ?? []

    setCollectionOptions(collections)
  }, [collectionsData])

  /**
   * Functions
   */
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

  return (
    <Fragment>
      <PageBlock variation="half" title={formatMessage(messages.collections)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={collectionsState}
            bulkActions={organizationBulkAction(
              handleRemoveCollections,
              messages.removeFromOrg,
              formatMessage
            )}
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
            loading={loading}
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
              rowsOptions: [25, 50],
            }}
            bulkActions={organizationBulkAction(
              handleAddCollections,
              messages.addToOrg,
              formatMessage
            )}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsCollections
