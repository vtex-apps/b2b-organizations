import { useQuery } from 'react-apollo'

import GET_ORGANIZATIONS from '../graphql/getOrganizations.graphql'

export interface FetchListOptions {
  status: string[]
  search: string
  customFieldName: string
  page: number
  pageSize: number
  sortOrder: 'ASC' | 'DESC'
  sortedBy: string
}

export const INITIAL_FETCH_LIST_OPTIONS: FetchListOptions = {
  status: ['active', 'on-hold', 'inactive'],
  search: '',
  customFieldName: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

export const toGetOrganizationsVariables = (options: FetchListOptions) => {
  const { customFieldName, search, ...rest } = options

  return {
    ...rest,
    search: search || null,
    customFieldName: customFieldName || null,
  }
}

export const useOrganizationsList = () => {
  return useQuery(GET_ORGANIZATIONS, {
    variables: toGetOrganizationsVariables(INITIAL_FETCH_LIST_OPTIONS),
    ssr: false,
  })
}
