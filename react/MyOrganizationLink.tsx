import type { FC } from 'react'
import { defineMessages, useIntl } from 'react-intl'

const messages = defineMessages({
  linkText: {
    id: 'store/b2b-organizations.my-account-link',
  },
})

const MyOrganizationLink: FC = ({ render }: any) => {
  const { formatMessage } = useIntl()

  return render([
    {
      name: formatMessage(messages.linkText),
      path: '/organization',
    },
  ])
}

export default MyOrganizationLink
