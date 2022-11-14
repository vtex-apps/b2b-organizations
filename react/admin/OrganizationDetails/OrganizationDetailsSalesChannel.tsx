import React, { Fragment, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, RadioGroup } from 'vtex.styleguide'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import GET_SALES_CHANNELS from '../../graphql/getSalesChannels.graphql'

interface SalesChannel {
  value: string
  label?: string
}

const OrganizationDetailsSalesChannel = ({
  salesChannelState,
  setSalesChannelState,
}: {
  salesChannelState: string
  setSalesChannelState: (value: any) => void
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()

  /**
   * States
   */
  const [salesChannelOptions, setSalesChannelOptions] = useState(
    [] as SalesChannel[]
  )

  /**
   * Queries
   */
  const { data: salesChannelsData } = useQuery(GET_SALES_CHANNELS, {
    ssr: false,
  })

  /**
   * Effects
   */
  useEffect(() => {
    if (!salesChannelsData?.salesChannels?.length) {
      return
    }

    const options = [] as SalesChannel[]

    salesChannelsData.salesChannels.forEach(
      (channel: { id: string; name: string }) => {
        options.push({
          value: channel.id,
          label: `${channel.name} (${channel.id})`,
        })
      }
    )

    setSalesChannelOptions(options)
  }, [salesChannelsData])

  return (
    <Fragment>
      <PageBlock title={formatMessage(messages.salesChannel)}>
        <div>
          <h4 className="t-heading-4 mt0 mb5">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <RadioGroup
            name="salesChannels"
            options={salesChannelOptions}
            value={salesChannelState}
            onChange={(e: any) => setSalesChannelState(e.currentTarget.value)}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsSalesChannel
