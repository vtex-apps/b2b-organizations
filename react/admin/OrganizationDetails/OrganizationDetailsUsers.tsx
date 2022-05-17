import { PageBlock } from 'vtex.styleguide'
import React, { Fragment } from 'react'
import { useIntl } from 'react-intl'

import OrganizationUsersTable from '../../components/OrganizationUsersTable'
import { organizationMessages as messages } from '../utils/messages'

const OrganizationDetailsUsers = ({
  params,
  loadingState,
}: {
  params: any
  loadingState: any
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()

  return (
    <Fragment>
      <PageBlock title={formatMessage(messages.users)}>
        <OrganizationUsersTable
          organizationId={params?.id}
          permissions={[]}
          refetchCostCenters={loadingState}
          isAdmin={true}
        />
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsUsers
