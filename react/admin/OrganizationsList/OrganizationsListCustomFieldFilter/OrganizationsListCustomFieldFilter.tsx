import React, { useEffect, useMemo } from 'react'
import { Dropdown, csx, useDropdownState } from '@vtex/admin-ui'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'

import GET_ORGANIZATION_CUSTOM_FIELDS from '../../../graphql/getOrganizationCustomFields.graphql'
import { organizationMessages as messages } from '../../utils/messages'

const NAME_SEARCH_OPTION_ID = ''

interface CustomFieldSearchOption {
  id: string
  label: string
}

interface Props {
  selectedCustomFieldName: string
  onChange: (customFieldName: string) => void
}

const OrganizationsListCustomFieldFilter: React.FC<Props> = ({
  selectedCustomFieldName,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  const { data, loading } = useQuery(GET_ORGANIZATION_CUSTOM_FIELDS, {
    ssr: false,
  })

  const nameSearchOption = useMemo<CustomFieldSearchOption>(
    () => ({
      id: NAME_SEARCH_OPTION_ID,
      label: formatMessage(messages.customFieldFilterName),
    }),
    [formatMessage]
  )

  const customFieldOptions = useMemo<CustomFieldSearchOption[]>(() => {
    const organizationCustomFields = data?.getOrganizationCustomFields ?? []

    return organizationCustomFields.map((field: CustomFieldSetting) => ({
      id: field.name,
      label: field.name,
    }))
  }, [data])

  const options = useMemo(() => [nameSearchOption, ...customFieldOptions], [
    nameSearchOption,
    customFieldOptions,
  ])

  const optionLabels = useMemo(() => options.map(option => option.label), [
    options,
  ])

  const dropdownState = useDropdownState({
    items: optionLabels,
    initialSelectedItem: nameSearchOption.label,
  })

  useEffect(() => {
    if (loading) {
      return
    }

    const selectedLabel = dropdownState.selectedItem

    if (!selectedLabel) {
      return
    }

    const option =
      options.find(({ label }) => label === selectedLabel) ?? nameSearchOption

    if (option.id !== selectedCustomFieldName) {
      onChange(option.id)
    }
  }, [
    dropdownState.selectedItem,
    loading,
    nameSearchOption,
    onChange,
    options,
    selectedCustomFieldName,
  ])

  if (loading || customFieldOptions.length === 0) {
    return null
  }

  return (
    <Dropdown
      items={optionLabels}
      state={dropdownState}
      label={formatMessage(messages.customFieldFilterLabel)}
      className={csx({ marginRight: '$space-5' })}
    />
  )
}

export default OrganizationsListCustomFieldFilter
