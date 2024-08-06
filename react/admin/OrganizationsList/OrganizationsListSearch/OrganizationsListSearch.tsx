import React from 'react'
import { Search, csx, useSearchState } from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'
import { useIntl } from 'react-intl'

import type { FetchListOptions } from '../../../organizations/hooks'
import { organizationMessages as adminMessages } from '../../utils/messages'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

interface Props {
  onSearch: (options: Partial<FetchListOptions>) => void
}

const OrganizationsListSearch: React.FC<Props> = ({ onSearch }) => {
  const { formatMessage } = useIntl()
  const search = useSearchState()
  const { onClear, ...inputProps } = search.getInputProps()

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLFormElement> = event => {
    if (event.key !== 'Enter') return

    onSearch({
      search: search.value,
      page: 1,
    })
  }

  const handleSearchClear = () => {
    onClear()

    onSearch({
      search: '',
      page: 1,
    })
  }

  return (
    <Search
      rel=""
      {...inputProps}
      title={formatMessage(adminMessages.searchPlaceholder)}
      placeholder={formatMessage(adminMessages.searchPlaceholder)}
      onClear={handleSearchClear}
      onKeyDown={handleSearchKeyDown}
      className={csx({ marginRight: '$space-5' })}
    />
  )
}

export default OrganizationsListSearch
