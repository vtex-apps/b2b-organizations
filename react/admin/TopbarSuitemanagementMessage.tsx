import React from 'react'
import { FormattedMessage } from 'react-intl'

const TopbarSuiteManagementMessage = () => {
  return (
    <div
      className="pv3 bg-warning"
      style={{
        width: '100vw',
        textAlign: 'center',
        fontWeight: 500,
      }}
    >
      <FormattedMessage id="admin/b2b-organizations.topbar-suite-management-message" />
    </div>
  )
}

export default TopbarSuiteManagementMessage
