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
}

export default function HasAccess({
  children,
  permission = ORGANIZATION_VIEW,
}: HasAccessProps) {
  const { data: canBuyerOrgPermission, isLoading } = useOrgPermission({
    resourceCode: permission,
  })

  const [showTimeoutError, setShowTimeoutError] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    // Only set timeout if data is undefined (not loading)
    if (!isLoading && canBuyerOrgPermission === undefined) {
      // Set a timeout of 10 seconds to show an error message
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
