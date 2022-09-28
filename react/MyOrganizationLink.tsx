import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useQuery } from 'react-apollo'

import { useSessionResponse } from './modules/session'
import GetBinding from './graphql/getBinding.graphql'

const messages = defineMessages({
  linkText: {
    id: 'store/b2b-organizations.my-account-link',
  },
})

const MyOrganizationLink: FC = ({ render }: any) => {
  const { formatMessage } = useIntl()
  const sessionResponse: any = useSessionResponse()
  const userEmail = sessionResponse?.namespaces?.profile?.email?.value

  const [show, setShow] = useState(false)

  const { data } = useQuery(GetBinding, {
    variables: { email: userEmail },
  })

  useEffect(() => {
    if (!data) {
      return
    }

    if (data.getBinding === true) {
      setShow(true)
    }
  }, [data, userEmail, sessionResponse])

  const parameter = {
    name: formatMessage(messages.linkText),
    path: `/organization`,
  }

  return show ? render([parameter]) : null
}

export default MyOrganizationLink
