import React, { useEffect } from 'react'
import {
  FilterDisclosure,
  FilterFooter,
  FilterListbox,
  FilterOptionCheckbox,
  FilterPopover,
  useFilterMultipleState,
} from '@vtex/admin-ui'
import { useIntl } from 'react-intl'

import { organizationMessages as messages } from '../../utils/messages'

const AllStatus = ['active', 'on-hold', 'inactive']

interface Props {
  onChange: (value: string[]) => void
}

const OrganizationsListStatusFilter: React.FC<Props> = ({ onChange }) => {
  const { formatMessage } = useIntl()
  const state = useFilterMultipleState()
  const { appliedItems } = state

  useEffect(() => {
    let statuses = appliedItems.map(({ id }) => id)

    if (statuses.length === 0) {
      statuses = AllStatus
    }

    onChange(statuses)
  }, [appliedItems])

  return (
    <>
      <FilterDisclosure state={state}>
        {formatMessage(messages.filterStatus)}
      </FilterDisclosure>

      <FilterPopover state={state}>
        <FilterListbox>
          {AllStatus.map(item => (
            <FilterOptionCheckbox key={item} label={item} id={item} />
          ))}
        </FilterListbox>
        <FilterFooter />
      </FilterPopover>
    </>
  )
}

export default OrganizationsListStatusFilter
