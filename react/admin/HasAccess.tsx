import React, { useEffect, useState } from 'react'
import { Alert } from 'vtex.styleguide'
import { FormattedMessage } from 'react-intl'
import { Spinner } from '@vtex/admin-ui'

import { useOrgPermission } from '../hooks/useOrgPermission'
import type { ORGANIZATION_EDIT } from '../utils/constants'
import { ORGANIZATION_VIEW } from '../utils/constants'

interface HasAccessProps {
  children: React.ReactElement
  permission?: typeof ORGANIZATION_EDIT | typeof ORGANIZATION_VIEW
  /** Admin pages rely on VTEX Admin access; storefront uses B2B permission checks. */
  authContext?: 'admin' | 'storefront'
}

function StorefrontHasAccess({
  children,
  permission = ORGANIZATION_VIEW,
}: Omit<HasAccessProps, 'authContext'>) {
  const { data: canBuyerOrgPermission, isLoading } = useOrgPermission({
    resourceCode: permission,
    authContext: 'storefront',
  })

  const [showTimeoutError, setShowTimeoutError] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    if (!isLoading && canBuyerOrgPermission === undefined) {
      timeoutId = setTimeout(() => {
        setShowTimeoutError(true)
      }, 10000)
    } else {
      setShowTimeoutError(false)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, canBuyerOrgPermission])

  if (showTimeoutError) {
    return (
      <div className="pa7">
        <Alert type="warning">
          <FormattedMessage
            id="admin/b2b-organizations.organizations.permission-timeout-message"
            defaultMessage="Permission check is taking longer than expected. Please refresh the page or try again later."
          />
        </Alert>
      </div>
    )
  }

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

export default function HasAccess({
  children,
  permission,
  authContext = 'admin',
}: HasAccessProps) {
  if (authContext === 'admin') {
    return children
  }

  return (
    <StorefrontHasAccess permission={permission}>{children}</StorefrontHasAccess>
  )
}
