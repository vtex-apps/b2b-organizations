import React from 'react'
import { Search, csx, useSearchState } from '@vtex/admin-ui'
import type { TagProps } from '@vtex/admin-ui'

import type { FetchListOptions } from '../../../organizations/hooks'

export const TagVariantByStatus: Record<string, TagProps['variant']> = {
  active: 'green',
  inactive: 'red',
  'on-hold': 'orange',
}

interface Props {
  onSearch: (options: Partial<FetchListOptions>) => void
}

const OrganizationsListSearch: React.FC<Props> = ({ onSearch }) => {
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

  return (
    <Search
      rel=""
      {...inputProps}
      onClear={handleSearchClear}
      onKeyDown={handleSearchKeyDown}
      className={csx({ marginRight: '$space-5' })}
    />
  )
}

export default OrganizationsListSearch
