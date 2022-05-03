import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { AutocompleteInput } from 'vtex.styleguide'

import GET_ORGANIZATIONS from '../graphql/getOrganizations.graphql'
import GET_ORGANIZATION_BY_ID from '../graphql/getOrganization.graphql'

const initialState = {
  status: ['active', 'on-hold', 'inactive'],
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'name',
}

interface Props {
  onChange: (value: { value: string | null; label: string }) => void
  organizationId: string
}

const OrganizationsAutocomplete = ({ onChange, organizationId }: Props) => {
  const [term, setTerm] = useState('')
  const [values, setValues] = useState([] as any)
  const { data, loading, refetch } = useQuery(GET_ORGANIZATIONS, {
    variables: initialState,
    ssr: false,
    notifyOnNetworkStatusChange: true,
  })

  const { data: organization } = useQuery(GET_ORGANIZATION_BY_ID, {
    variables: { id: organizationId },
    ssr: false,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const options = {
    onSelect: (value: any) => onChange(value),
    loading,
    value: values,
  }

  const onClear = () => {
    setTerm('')
    onChange({ value: null, label: '' })
  }

  useEffect(() => {
    if (!organization) {
      return
    }

    const { name, id } = organization.getOrganizationById

    setTerm(name)
    onChange({ value: id, label: name })
  }, [organization])

  useEffect(() => {
    if (data?.getOrganizations?.data) {
      setValues(
        data.getOrganizations.data.map((item: any) => {
          return {
            value: item.id,
            label: item.name,
          }
        })
      )
    }
  }, [data])

  useEffect(() => {
    if (term && term.length > 2) {
      refetch({
        ...initialState,
        search: term,
      })
    } else if (term === '') {
      onClear()
    }
  }, [term])

  const input = {
    onChange: (_term: string) => {
      setTerm(_term)
    },
    onClear,
    placeholder: 'Search organization...',
    value: term,
  }

  return <AutocompleteInput input={input} options={options} />
}

export default OrganizationsAutocomplete