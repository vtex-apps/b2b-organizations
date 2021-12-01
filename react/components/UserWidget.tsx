import React from 'react'
import type { FunctionComponent } from 'react'
import { useQuery } from 'react-apollo'
import { useIntl, defineMessages } from 'react-intl'
import { Button } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'

import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import GET_PERMISSIONS from '../graphql/getPermissions.graphql'
import GET_ORGANIZATION from '../graphql/getOrganizationStorefront.graphql'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  role: {
    id: `${storePrefix}user-widget.role`,
  },
  organization: {
    id: `${storePrefix}user-widget.organization`,
  },
  costCenter: {
    id: `${storePrefix}user-widget.costCenter`,
  },
  manageOrganization: {
    id: `${storePrefix}user-widget.manage-organization`,
  },
})

const CSS_HANDLES = [
  'userWidgetContainer',
  'userWidgetItem',
  'userWidgetButton',
] as const

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const UserWidget: FunctionComponent = () => {
  const { navigate, rootPath } = useRuntime()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(CSS_HANDLES)

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

  if (
    !isAuthenticated ||
    !permissionsData ||
    !organizationData ||
    !costCenterData
  )
    return null

  return (
    <div
      className={`${handles.userWidgetContainer} flex mv3 justify-end items-center`}
    >
      <div
        className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
      >
        {`${formatMessage(messages.organization)} ${
          organizationData?.getOrganizationByIdStorefront?.name
        }`}
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
  )
}

export default UserWidget
