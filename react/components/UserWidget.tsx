import React, { Fragment, useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'
import { AutocompleteInput, Button, Tag } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'

import {
  organizationMessages as storeMessages,
  userWidgetMessages as messages,
} from './utils/messages'
import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import USER_WIDGET_QUERY from '../graphql/userWidgetQuery.graphql'
import SET_CURRENT_ORGANIZATION from '../graphql/setCurrentOrganization.graphql'
import STOP_IMPERSONATION from '../graphql/impersonateUser.graphql'
import { B2B_CHECKOUT_SESSION_KEY } from '../utils/constants'

const CSS_HANDLES = [
  'userWidgetContainer',
  'userWidgetRow',
  'userWidgetItem',
  'userWidgetButton',
  'userWidgetImpersonationItem',
  'userWidgetImpersonationButton',
  'userWidgetImpersonationError',
  'userWidgetOrganizationError',
] as const

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const CustomOrganizationOption = (props: any) => {
  const { roundedBottom, searchTerm, value, selected, onClick } = props
  const [highlightOption, setHighlightOption] = useState(false)

  const renderOptionHighlightedText = () => {
    const highlightableText = typeof value === 'string' ? value : value.label
    const index = highlightableText
      .toLowerCase()
      .indexOf(searchTerm.toLowerCase())

    if (index === -1) {
      return highlightableText
    }

    const prefix = highlightableText.substring(0, index)
    const match = highlightableText.substr(index, searchTerm.length)
    const suffix = highlightableText.substring(`${index}${match.length}`)

    return (
      <span className="truncate">
        <span className="fw7">{prefix}</span>
        {match}
        <span className="fw7">{suffix}</span>
      </span>
    )
  }

  const buttonClasses = `bn w-100 tl pointer pa4 f6 ${
    roundedBottom ? 'br2 br--bottom' : ''
  } ${highlightOption || selected ? 'bg-muted-5' : 'bg-base'}`

  // --- This is a good practice. Use <button />.
  return (
    <button
      className={buttonClasses}
      onFocus={() => setHighlightOption(true)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={onClick}
      disabled={value.status !== 'active'}
    >
      <div className="flex items-center">
        <span className="pr2">{renderOptionHighlightedText()}</span>
        {typeof value !== 'string' && (
          <div className="t-mini c-muted-1">{value.caption}</div>
        )}
      </div>
    </button>
  )
}

const UserWidget: FunctionComponent = () => {
  const { navigate, rootPath } = useRuntime()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(CSS_HANDLES)
  const [loadingState, setLoadingState] = useState(false)
  const [errorState, setErrorState] = useState(false)
  const [errorOrganization, setErrorOrganization] = useState(false)

  const [organizationsState, setOrganizationsState] = useState({
    organizationOptions: [],
    costCenterOptions: [],
    organizationInput: '',
    costCenterInput: '',
    currentOrganization: '',
    currentCostCenter: '',
    currentOrganizationStatus: '',
  })

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'b2b-organizations_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const { data: userWidgetData } = useQuery(USER_WIDGET_QUERY, {
    ssr: false,
    skip: !isAuthenticated,
  }) as any

  const [stopImpersonation] = useMutation(STOP_IMPERSONATION)
  const [setCurrentOrganization] = useMutation(SET_CURRENT_ORGANIZATION)

  const handleStopImpersonation = async () => {
    setLoadingState(true)
    setErrorState(false)

    stopImpersonation()
      .then(() => {
        if (sessionStorage.getItem(B2B_CHECKOUT_SESSION_KEY)) {
          sessionStorage.removeItem(B2B_CHECKOUT_SESSION_KEY)
        }

        window.location.reload()
      })
      .catch(error => {
        console.error(error)
        setErrorState(true)
        setLoadingState(false)
      })
  }

  const handleSetCurrentOrganization = async () => {
    setLoadingState(true)
    try {
      await setCurrentOrganization({
        variables: {
          orgId: organizationsState.currentOrganization,
          costId: organizationsState.currentCostCenter,
        },
      })
    } catch (error) {
      setErrorOrganization(true)
    } finally {
      setLoadingState(false)
    }

    window.location.reload()
  }

  const organizationAutoCompleteInput = {
    onChange: (text: string) => {
      setOrganizationsState({
        ...organizationsState,
        organizationInput: text,
      })
    },
    placeholder: `${formatMessage(storeMessages.autocompleteSearching)}...`,
    value: organizationsState.organizationInput,
  }

  const costCenterAutoCompleteInput = {
    onChange: (text: string) => {
      setOrganizationsState({
        ...organizationsState,
        costCenterInput: text,
      })
    },
    placeholder: `${formatMessage(storeMessages.autocompleteSearching)}...`,
    value: organizationsState.costCenterInput,
  }

  useEffect(() => {
    if (!userWidgetData?.getOrganizationsByEmail) {
      return
    }

    const currentOrganization =
      userWidgetData?.getOrganizationByIdStorefront?.id

    const currentCostCenter = userWidgetData?.getCostCenterByIdStorefront?.id

    setOrganizationsState({
      ...organizationsState,
      costCenterInput: userWidgetData?.getCostCenterByIdStorefront?.name,
      organizationInput: userWidgetData?.getOrganizationByIdStorefront?.name,
      organizationOptions: userWidgetData?.getOrganizationsByEmail.map(
        (organization: {
          orgId: string
          organizationName: string
          organizationStatus: string
        }) => ({
          value: organization.orgId,
          label: organization.organizationName,
          status: organization.organizationStatus,
        })
      ),
      costCenterOptions: userWidgetData?.getOrganizationsByEmail
        .filter(
          (organization: { orgId: string }) =>
            organization.orgId === currentOrganization
        )
        .map((organization: { costId: string; costCenterName: string }) => ({
          value: organization.costId,
          label: organization.costCenterName,
        })),
      currentOrganization,
      currentCostCenter,
      currentOrganizationStatus:
        userWidgetData?.getOrganizationByIdStorefront?.status,
    })
  }, [userWidgetData])

  const handleStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Tag type="success" size="small">
            {formatMessage(messages.active)}
          </Tag>
        )

      case 'on-hold':
        return (
          <Tag type="warning" size="small">
            {formatMessage(messages.onHold)}
          </Tag>
        )

      case 'inactive':
        return (
          <Tag type="error" size="small">
            {formatMessage(messages.inactive)}
          </Tag>
        )

      default:
        return ''
    }
  }

  const autoCompleteOrganizationOptions = {
    value: organizationsState.organizationOptions,
    renderOption: (props: any) => <CustomOrganizationOption {...props} />,
    onSelect: (itemSelected: { value: string }) => {
      setOrganizationsState({
        ...organizationsState,
        costCenterInput: '',
        currentOrganization: itemSelected.value,
        costCenterOptions: userWidgetData?.getOrganizationsByEmail
          .filter(
            (organization: { orgId: string }) =>
              organization.orgId === itemSelected.value
          )
          .map((organization: { costId: string; costCenterName: string }) => ({
            value: organization.costId,
            label: organization.costCenterName,
          })) as [],
      })
    },
  }

  const autoCompleteCostCentersOptions = {
    value: organizationsState.costCenterOptions,
    onSelect: (itemSelected: { value: string }) => {
      setOrganizationsState({
        ...organizationsState,
        currentCostCenter: itemSelected.value,
      })
    },
  }

  if (
    !isAuthenticated ||
    !userWidgetData?.checkUserPermission ||
    !userWidgetData?.getOrganizationByIdStorefront ||
    !userWidgetData?.getCostCenterByIdStorefront
  )
    return null

  return (
    <div
      className={`${handles.userWidgetContainer} w-100 flex flex-column mv3`}
    >
      <div
        className={`${handles.userWidgetRow} flex justify-center items-center`}
      >
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {(!userWidgetData?.checkImpersonation?.email &&
            organizationsState.organizationOptions.length > 1 && (
              <AutocompleteInput
                input={organizationAutoCompleteInput}
                options={autoCompleteOrganizationOptions}
              />
            )) || (
            <Fragment>
              {`${formatMessage(messages.organization)} ${
                userWidgetData?.getOrganizationByIdStorefront?.name
              }`}
              {handleStatusMessage(
                userWidgetData?.getOrganizationByIdStorefront?.status ?? ''
              )}
            </Fragment>
          )}
        </div>
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {(!userWidgetData?.checkImpersonation?.email &&
            organizationsState.organizationOptions.length > 1 && (
              <AutocompleteInput
                input={costCenterAutoCompleteInput}
                options={autoCompleteCostCentersOptions}
              />
            )) || (
            <Fragment>
              {`${formatMessage(messages.costCenter)} ${
                userWidgetData?.getCostCenterByIdStorefront?.name
              }`}
            </Fragment>
          )}
        </div>
        {!userWidgetData?.checkImpersonation?.email &&
          organizationsState.organizationOptions.length > 1 && (
            <div
              className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
            >
              <Button
                variation="primary"
                size="small"
                disabled={
                  organizationsState.currentCostCenter ===
                  userWidgetData?.getCostCenterByIdStorefront?.id
                }
                isLoading={loadingState}
                onClick={() => handleSetCurrentOrganization()}
              >
                {formatMessage(messages.setCurrentOrganization)}
              </Button>
              {errorOrganization && (
                <div className={`${handles.userWidgetOrganizationError} error`}>
                  <FormattedMessage id="store/b2b-organizations.set-organization-error" />
                </div>
              )}
            </div>
          )}
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {`${formatMessage(messages.role)} ${
            userWidgetData?.checkUserPermission?.role?.name
          }`}
        </div>
        <div className={`${handles.userWidgetButton} pa3`}>
          <Button
            variation="secondary"
            size="small"
            onClick={() =>
              navigate({
                to: `${rootPath ?? ''}/account#/organization`,
              })
            }
          >
            {formatMessage(messages.manageOrganization)}
          </Button>
        </div>
      </div>
      {userWidgetData?.checkImpersonation?.email && (
        <div
          className={`${handles.userWidgetRow} flex justify-center items-center`}
        >
          <div
            className={`${handles.userWidgetImpersonationItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
          >
            {`${formatMessage(messages.impersonating)} ${
              userWidgetData?.checkImpersonation.email
            }`}
          </div>
          <div className={`${handles.userWidgetImpersonationButton} pa3`}>
            <Button
              variation="danger"
              size="small"
              onClick={() => handleStopImpersonation()}
              isLoading={loadingState}
            >
              {formatMessage(messages.stopImpersonation)}
            </Button>
            {errorState && (
              <div className={`${handles.userWidgetImpersonationError} error`}>
                <FormattedMessage id="store/b2b-organizations.stop-impersonation-error" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserWidget
