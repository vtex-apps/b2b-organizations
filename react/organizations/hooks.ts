import { useQuery } from 'react-apollo'

import GET_ORGANIZATIONS from '../graphql/getOrganizations.graphql'

export const INITIAL_FETCH_LIST_OPTIONS = {
  status: ['active', 'on-hold', 'inactive'],
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

export const useOrganizationsList = () => {
  return useQuery(GET_ORGANIZATIONS, {
    variables: INITIAL_FETCH_LIST_OPTIONS,
    ssr: false,
  })
}
