import React from 'react'
import { useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'

import GET_B2B_SETTINGS from '../graphql/getB2BSettings.graphql'
import storageFactory from '../utils/storage'

function getContrastColor(hexColor: string) {
  const color = hexColor.replace('#', '')

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  return brightness > 128 ? '#000000' : '#FFFFFF'
}

const localStore = storageFactory(() => localStorage)
const isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const WarningTopbarInactiveOrganization = () => {
  const { data, loading } = useQuery(GET_B2B_SETTINGS, {
    ssr: false,
  })

  if (
    loading ||
    data?.getB2BSettings?.uiSettings?.autoApprove ||
    !isAuthenticated
  ) {
    return <></>
  }

  return (
    <div
      className="pv3"
      style={{
        width: '100%',
        textAlign: 'center',
        fontWeight: 500,
        color: getContrastColor(
          data?.getB2BSettings?.uiSettings?.topBar?.hexColor ?? '#656896'
        ),
        background:
          data?.getB2BSettings?.uiSettings?.topBar?.hexColor ?? '#656896',
      }}
    >
      {data?.getB2BSettings?.uiSettings?.topBar?.name || (
        <FormattedMessage id="store/b2b-organizations.warning-topbar-inative-org.message" />
      )}
    </div>
  )
}

export default WarningTopbarInactiveOrganization
