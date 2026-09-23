import React from 'react'
import { Search, csx, useSearchState } from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'
import { useIntl } from 'react-intl'

import type { FetchListOptions } from '../../../organizations/hooks'
import { organizationMessages as messages } from '../../utils/messages'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

interface Props {
  onSearch: (options: Partial<FetchListOptions>) => void
  customFieldName?: string
}

const OrganizationsListSearch: React.FC<Props> = ({
  onSearch,
  customFieldName = '',
}) => {
  const { formatMessage } = useIntl()
  const search = useSearchState()

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLFormElement> = event => {
    if (event.key !== 'Enter') return

    onSearch({
      search: search.value,
      page: 1,
    })
  }

  const { onClear, ...inputProps } = search.getInputProps()

  const handleSearchClear = () => {
    onClear()

    onSearch({
      search: '',
      page: 1,
    })
  }

  const placeholder = customFieldName
    ? formatMessage(messages.searchCustomFieldPlaceholder, {
        fieldName: customFieldName,
      })
    : formatMessage(messages.searchPlaceholder)

  return (
    <Search
      rel=""
      {...inputProps}
      onClear={handleSearchClear}
      onKeyDown={handleSearchKeyDown}
      placeholder={placeholder}
      className={csx({ marginRight: '$space-5' })}
    />
  )
}

export default OrganizationsListSearch
