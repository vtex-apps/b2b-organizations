import type { FunctionComponent, ChangeEvent } from 'react'
import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Tag,
  Textarea,
  Spinner,
  Button,
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { AddressRules, AddressSummary } from 'vtex.address-form'

import { labelTypeByStatusMap } from './OrganizationRequestsTable'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import UPDATE_ORGANIZATION_REQUEST from '../graphql/updateOrganizationRequest.graphql'

const adminPrefix = 'admin/b2b-organizations.'

const messages = defineMessages({
  toastCreatedSuccess: {
    id: `${adminPrefix}organization-request-details.toast.created-success`,
  },
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-request-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-request-details.toast.update-failure`,
  },
  pageTitle: {
    id: `${adminPrefix}organization-request-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  addNote: {
    id: `${adminPrefix}organization-request-details.add-note.label`,
  },
})

const OrganizationRequestDetails: FunctionComponent = () => {
  const { formatMessage, formatDate } = useIntl()

  const {
    route: { params },
    navigate,
  } = useRuntime()

  const showToast = useToast()

  const [notesState, setNotesState] = useState('')
  const [loadingState, setLoadingState] = useState(false)

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION_REQUEST, {
    variables: { id: params?.id },
    skip: !params?.id,
  })

  const [updateOrganizationRequest] = useMutation(UPDATE_ORGANIZATION_REQUEST)

  const handleUpdateRequest = (status: string) => {
    setLoadingState(true)
    const variables = {
      id: params?.id,
      status,
      notes: notesState,
    }

    updateOrganizationRequest({ variables })
      .then(() => {
        setLoadingState(false)
        showToast({
          type: 'success',
          message:
            status === 'approved'
              ? formatMessage(messages.toastCreatedSuccess)
              : formatMessage(messages.toastUpdateSuccess),
        })
        refetch({ id: params?.id })
      })
      .catch(error => {
        setLoadingState(false)
        console.error(error)
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateFailure),
        })
      })
  }

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
                page: 'admin.app.b2b-organizations.organization-requests',
              })
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="admin/b2b-organizations.organization-request-details.empty-state" />
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
              page: 'admin.app.b2b-organizations.organization-requests',
            })
          }}
        />
      }
    >
      <PageBlock>
        <h4 className="t-heading-5 mb0 mt0">
          <FormattedMessage id="admin/b2b-organizations.organization-request-details.request-status" />
        </h4>
        <div className="mt4">
          <Tag
            type={labelTypeByStatusMap[data.getOrganizationRequestById.status]}
          >
            {data.getOrganizationRequestById.status}
          </Tag>
        </div>
        <h4 className="t-heading-5 mb0 pt4">
          <FormattedMessage id="admin/b2b-organizations.organization-request-details.created" />
        </h4>
        <div className="mv3">
          {formatDate(data.getOrganizationRequestById.created, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
        </div>
        <h4 className="t-heading-5 mb0 pt4">
          <FormattedMessage id="admin/b2b-organizations.organization-request-details.organization-name" />
        </h4>
        <div className="mv3">{data.getOrganizationRequestById.name}</div>
        <h4 className="t-heading-5 mb0 pt4">
          <FormattedMessage id="admin/b2b-organizations.organization-request-details.b2b-customer-admin" />
        </h4>
        <div className="mv3">
          {data.getOrganizationRequestById.b2bCustomerAdmin.email}
        </div>
        <h4 className="t-heading-5 mb0 pt4">
          <FormattedMessage id="admin/b2b-organizations.organization-request-details.default-cost-center" />
        </h4>
        <div className="mt4">
          {data.getOrganizationRequestById.defaultCostCenter.name}

          <AddressRules
            country={
              data.getOrganizationRequestById.defaultCostCenter.address.country
            }
            useGeolocation={false}
            shouldUseIOFetching
          >
            <AddressSummary
              canEditData={false}
              address={
                data.getOrganizationRequestById.defaultCostCenter.address
              }
            />
          </AddressRules>
        </div>
        <div className="mt3">
          <Textarea
            label={
              <h4 className="t-heading-5 mb0 pt4">
                {formatMessage(messages.addNote)}
              </h4>
            }
            value={notesState}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNotesState(e.target.value)
            }}
            characterCountdownText={
              <FormattedMessage
                id="admin/b2b-organizations.organization-request-details.add-note.charactersLeft"
                values={{ count: notesState.length }}
              />
            }
            maxLength="500"
            rows="4"
            disabled={data.getOrganizationRequestById.status !== 'pending'}
          />
        </div>
        <div className="mt3 flex">
          <Button
            variation="primary"
            onClick={() => handleUpdateRequest('approved')}
            isLoading={loadingState}
            disabled={data.getOrganizationRequestById.status !== 'pending'}
          >
            <FormattedMessage id="admin/b2b-organizations.organization-request-details.button.approve" />
          </Button>
          <div className="ml2">
            <Button
              variation="danger"
              onClick={() => handleUpdateRequest('declined')}
              isLoading={loadingState}
              disabled={data.getOrganizationRequestById.status !== 'pending'}
            >
              <FormattedMessage id="admin/b2b-organizations.organization-request-details.button.decline" />
            </Button>
          </div>
        </div>
      </PageBlock>
    </Layout>
  )
}

export default OrganizationRequestDetails
