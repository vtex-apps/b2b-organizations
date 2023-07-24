import type { FunctionComponent, ChangeEvent } from 'react'
import React, { useState, Fragment } from 'react'
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
import { useIntl, FormattedMessage } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { AddressRules, AddressSummary } from 'vtex.address-form'

import { organizationRequestMessages as messages } from './utils/messages'
import { labelTypeByStatusMap } from './OrganizationRequestsTable'
import GET_ORGANIZATION_REQUEST from '../graphql/getOrganizationRequest.graphql'
import UPDATE_ORGANIZATION_REQUEST from '../graphql/updateOrganizationRequest.graphql'

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
          variant: 'positive',
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
          variant: 'critical',
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
            title={formatMessage(messages.detailsPageTitle)}
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
        {data.getOrganizationRequestById.tradeName && (
          <Fragment>
            <h4 className="t-heading-5 mb0 pt4">
              <FormattedMessage id="admin/b2b-organizations.organization-request-details.tradeName" />
            </h4>
            <div className="mv3">
              {data.getOrganizationRequestById.tradeName}
            </div>
          </Fragment>
        )}
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
          {data.getOrganizationRequestById.defaultCostCenter.phoneNumber && (
            <div>
              <FormattedMessage
                id="admin/b2b-organizations.organization-request-details.default-cost-center.phoneNumber"
                values={{
                  phoneNumber:
                    data.getOrganizationRequestById.defaultCostCenter
                      .phoneNumber,
                }}
              />
            </div>
          )}
          {data.getOrganizationRequestById.defaultCostCenter
            .businessDocument && (
            <div>
              <FormattedMessage
                id="admin/b2b-organizations.organization-request-details.default-cost-center.businessDocument"
                values={{
                  businessDocument:
                    data.getOrganizationRequestById.defaultCostCenter
                      .businessDocument,
                }}
              />
            </div>
          )}
          {data.getOrganizationRequestById.defaultCostCenter
            .stateRegistration && (
            <div>
              <FormattedMessage
                id="admin/b2b-organizations.organization-request-details.default-cost-center.stateRegistration"
                values={{
                  stateRegistration:
                    data.getOrganizationRequestById.defaultCostCenter
                      .stateRegistration,
                }}
              />
            </div>
          )}
          <br />
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
          <br />
          {data.getOrganizationRequestById.customFields && (
            <>
              <h5>
                <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields" />
              </h5>
              {data.getOrganizationRequestById.customFields.map(
                (item: CustomField) => (
                  <div className="pt2 pb2">
                    <div>
                      <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.name" />
                      : {item.name}
                    </div>
                    <div>
                      <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.type" />
                      : {item.type}
                    </div>
                    <div>
                      <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.value" />
                      : {item.value}
                    </div>
                    {item.dropdownValues && (
                      <div>
                        <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.dropdownValues" />
                        :{' '}
                        {item.dropdownValues.map(dropdown => (
                          <div className="pl2 mt2">
                            <div>
                              <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.label" />
                              : {dropdown.label}
                            </div>
                            <div>
                              <FormattedMessage id="admin/b2b-organizations.organization-request-admin.customFields.value" />
                              : {dropdown.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          )}
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
