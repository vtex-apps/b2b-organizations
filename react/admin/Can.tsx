import React from 'react'
import { Alert } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'
import { Spinner } from '@vtex/admin-ui'

import { useOrgPermission } from '../hooks/useOrgPermission'

interface CanProps {
  children: React.ReactElement
  permission?: 'buyer_organization_edit' | 'buyer_organization_view'
}

export default function Can({
  children,
  permission = 'buyer_organization_view',
}: CanProps) {
  const { data: canBuyerOrgPermission, isLoading } = useOrgPermission({
    resourceCode: permission,
  })

  if (isLoading || canBuyerOrgPermission === undefined) {
    return (
      <div className="pa7">
        <Spinner />
      </div>
    )
  }

  if (canBuyerOrgPermission) {
    return children
  }

  return (
    <div className="pa7">
      <Alert type="error">
        <FormattedMessage id="admin/b2b-organizations.organizations.not-allow-view-message" />
      </Alert>
    </div>
  )
}
