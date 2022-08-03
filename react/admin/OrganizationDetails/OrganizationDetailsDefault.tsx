import { Dropdown, Input, PageBlock } from 'vtex.styleguide'
import { FormattedMessage, useIntl } from 'react-intl'
import React, { Fragment } from 'react'
import type { FunctionComponent } from 'react'

import { organizationMessages as messages } from '../utils/messages'

interface Props {
  organizationNameState: string
  setOrganizationNameState: (value: string) => void
  organizationTradeNameState: string
  setOrganizationTradeNameState: (value: string) => void
  statusState: string
  setStatusState: (value: string) => void
  data: any
}

const OrganizationDetailsDefault: FunctionComponent<Props> = ({
  organizationNameState,
  setOrganizationNameState,
  organizationTradeNameState,
  setOrganizationTradeNameState,
  statusState,
  setStatusState,
  data,
}) => {
  /**
   * Hooks
   */
  const { formatMessage, formatDate } = useIntl()

  /**
   * States
   */
  const statusOptions = [
    {
      value: 'active',
      label: formatMessage(messages.statusActive),
    },
    {
      value: 'on-hold',
      label: formatMessage(messages.statusOnHold),
    },
    {
      value: 'inactive',
      label: formatMessage(messages.statusInactive),
    },
  ]

  return (
    <Fragment>
      <PageBlock>
        <Input
          autocomplete="off"
          size="large"
          label={
            <h4 className="t-heading-5 mb0 pt3">
              <FormattedMessage id="admin/b2b-organizations.organization-details.organization-name" />
            </h4>
          }
          value={organizationNameState}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setOrganizationNameState(e.target.value)
          }}
          required
        />
        <div className="pv3">
          <Input
            autocomplete="off"
            size="large"
            label={
              <h4 className="t-heading-5 mb0 pt3">
                <FormattedMessage id="admin/b2b-organizations.organization-details.tradeName" />
              </h4>
            }
            helpText={
              <FormattedMessage id="admin/b2b-organizations.organization-details.tradeName.helpText" />
            }
            value={organizationTradeNameState}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setOrganizationTradeNameState(e.target.value)
            }}
          />
        </div>
        <div className="pv3">
          <Dropdown
            label={
              <h4 className="t-heading-5 mb0 pt3">
                <FormattedMessage id="admin/b2b-organizations.organization-details.status" />
              </h4>
            }
            placeholder={formatMessage(messages.status)}
            options={statusOptions}
            value={statusState}
            onChange={(_: void, v: string) => setStatusState(v)}
          />
        </div>
        <h4 className="t-heading-5 mb0 pt3">
          <FormattedMessage id="admin/b2b-organizations.organization-details.created" />
        </h4>
        <div className="mv3">
          {formatDate(data.getOrganizationById.created, {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          })}
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsDefault
