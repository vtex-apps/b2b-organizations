import React, { useState } from 'react'
import type { FunctionComponent } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'
import { Button, Tag } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'

import { userWidgetMessages as messages } from './utils/messages'
import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import GET_ORGANIZATION from '../graphql/getOrganizationStorefront.graphql'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'
import CHECK_IMPERSONATION from '../graphql/checkImpersonation.graphql'
import STOP_IMPERSONATION from '../graphql/impersonateUser.graphql'

const CSS_HANDLES = [
  'userWidgetContainer',
  'userWidgetRow',
  'userWidgetItem',
  'userWidgetButton',
  'userWidgetImpersonationItem',
  'userWidgetImpersonationButton',
  'userWidgetImpersonationError',
] as const

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const UserWidget: FunctionComponent = () => {
  const { navigate, rootPath } = useRuntime()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(CSS_HANDLES)
  const [loadingState, setLoadingState] = useState(false)
  const [errorState, setErrorState] = useState(false)

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'b2b-organizations_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const { data: permissionsData } = useQuery(GET_PERMISSIONS, {
    ssr: false,
    skip: !isAuthenticated,
  })

  const { data: organizationData } = useQuery(GET_ORGANIZATION, {
    ssr: false,
    skip: !isAuthenticated,
  })

  const { data: costCenterData } = useQuery(GET_COST_CENTER, {
    ssr: false,
    skip: !isAuthenticated,
  })

  const { data: impersonationData } = useQuery(CHECK_IMPERSONATION, {
    ssr: false,
    skip: !isAuthenticated,
  })

  const [stopImpersonation] = useMutation(STOP_IMPERSONATION)

  const handleStopImpersonation = async () => {
    setLoadingState(true)
    setErrorState(false)

    stopImpersonation()
      .then(() => {
        if (sessionStorage.getItem('b2b-checkout-settings')) {
          sessionStorage.removeItem('b2b-checkout-settings')
        }

        window.location.reload()
      })
      .catch(error => {
        console.error(error)
        setErrorState(true)
        setLoadingState(false)
      })
  }

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

  if (
    !isAuthenticated ||
    !permissionsData ||
    !organizationData ||
    !costCenterData
  )
    return null

  return (
    <div
      className={`${handles.userWidgetContainer} w-100 flex flex-column mv3`}
    >
      <div className={`${handles.userWidgetRow} flex justify-end items-center`}>
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {`${formatMessage(messages.organization)} ${
            organizationData?.getOrganizationByIdStorefront?.name
          }`}{' '}
          {handleStatusMessage(
            organizationData?.getOrganizationByIdStorefront?.status ?? ''
          )}
        </div>
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {`${formatMessage(messages.costCenter)} ${
            costCenterData?.getCostCenterByIdStorefront?.name
          }`}
        </div>
        <div
          className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
        >
          {`${formatMessage(messages.role)} ${
            permissionsData?.checkUserPermission?.role?.name
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
      {impersonationData?.checkImpersonation?.email && (
        <div
          className={`${handles.userWidgetRow} flex justify-end items-center`}
        >
          <div
            className={`${handles.userWidgetImpersonationItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
          >
            {`${formatMessage(messages.impersonating)} ${
              impersonationData.checkImpersonation.email
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
