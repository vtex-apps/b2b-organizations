import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { FormattedMessage, useIntl } from 'react-intl'
import { Button, Spinner } from 'vtex.styleguide'
import { useToast, Dropdown, useDropdownState } from '@vtex/admin-ui'

import GET_B2BSETTINGS from '../graphql/getB2BSettings.graphql'
import SAVE_B2BSETTINGS from '../graphql/updateB2BSettings.graphql'
import {
  organizationCustomFieldsMessages as customFieldsMessages,
  organizationSettingsMessages as settingMessage,
  organizationMessages as messages,
} from './utils/messages'
import CustomFieldsTable from './CustomFieldsTable'

const CustomFields: React.FC = () => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()
  const showToast = useToast()

  /**
   * States
   */

  const [activeCustomFields, setActiveCustomFields] = useState<CustomField[]>(
    []
  )

  const [organizationCustomFields, setOrganizationCustomFields] = useState<
    CustomField[]
  >([])

  const [costCenterCustomFields, setCostCenterCustomFields] = useState<
    CustomField[]
  >([])

  const customFieldsLocation = [
    formatMessage(messages.organizationsTitle),
    formatMessage(messages.costCenters),
  ]

  const customFieldsDropdownState = useDropdownState({
    items: customFieldsLocation,
    initialSelectedItem: formatMessage(messages.organizationsTitle),
  })

  const isOrgActive =
    customFieldsDropdownState.selectedItem ===
    formatMessage(messages.organizationsTitle)

  /**
   * Queries
   */
  const { data: b2bSettings, loading: b2bSettingsLoading } = useQuery(
    GET_B2BSETTINGS,
    {
      ssr: false,
    }
  )

  /**
   * Mutations
   */
  const [saveB2BSettingsRequest] = useMutation(SAVE_B2BSETTINGS)

  /**
   * Functions
   */
  const translateMessage = (message: MessageDescriptor) => {
    return formatMessage(message)
  }

  const toastMessage = (
    message: MessageDescriptor,
    type: 'critical' | 'info' | 'positive' | 'warning'
  ) => {
    const translatedMessage = translateMessage(message)

    showToast({ message: translatedMessage, duration: 5000, variant: type })
  }

  const saveB2BSettings = () => {
    const B2BSettingsInput = {
      organizationCustomFields,
      costCenterCustomFields,
    }

    saveB2BSettingsRequest({
      variables: {
        input: B2BSettingsInput,
      },
    })
      .then(() => {
        toastMessage(settingMessage.toastUpdateSuccess, 'positive')
      })
      .catch(() => {
        toastMessage(settingMessage.toastUpdateFailure, 'warning')
      })
  }

  const addCustomField = () => {
    setActiveCustomFields([...activeCustomFields, { name: '', type: 'text' }])
  }

  const removeCustomField = (indexToRemove: number) => {
    // remove item at the provided index
    const customFieldsWithoutLastItem = activeCustomFields.filter(
      (_, index) => index !== indexToRemove
    )

    setActiveCustomFields(customFieldsWithoutLastItem)
    if (isOrgActive) {
      setOrganizationCustomFields(customFieldsWithoutLastItem)
    } else {
      setCostCenterCustomFields(customFieldsWithoutLastItem)
    }
  }

  const handleUpdate = (index: number, customField: CustomField) => {
    // populate activeCustomFields array with values from inputs

    const newCustomFields = [...activeCustomFields]

    newCustomFields[index] = customField
    setActiveCustomFields(newCustomFields)

    if (isOrgActive) {
      setOrganizationCustomFields(newCustomFields)
    } else {
      setCostCenterCustomFields(newCustomFields)
    }
  }

  /**
   * Effects
   */

  const organizationCustomFieldsData =
    b2bSettings?.getB2BSettings?.organizationCustomFields

  const costCenterCustomFieldsData =
    b2bSettings?.getB2BSettings?.costCenterCustomFields

  useEffect(() => {
    if (organizationCustomFieldsData) {
      // in case activeCustomFields comes as null, make an empty array
      setOrganizationCustomFields(organizationCustomFieldsData ?? [])
    }
  }, [organizationCustomFieldsData?.length])

  useEffect(() => {
    if (costCenterCustomFieldsData) {
      setCostCenterCustomFields(costCenterCustomFieldsData ?? [])
    }
  }, [costCenterCustomFieldsData?.length])

  useEffect(() => {
    if (isOrgActive) {
      setActiveCustomFields(organizationCustomFields)
    } else {
      setActiveCustomFields(costCenterCustomFields)
    }
  }, [
    customFieldsDropdownState.selectedItem,
    organizationCustomFields?.length > 0,
    costCenterCustomFields?.length > 0,
  ])

  return (
    <>
      <div className="flex justify-between items-center">
        <Dropdown
          variant="primary"
          items={customFieldsLocation}
          state={customFieldsDropdownState}
          label="Organization or Cost Center"
        />
        <Button
          variation="primary"
          onClick={() => {
            saveB2BSettings()
          }}
        >
          Save Settings
        </Button>
      </div>

      <h4 className="mt6 t-heading-6">
        {formatMessage(customFieldsMessages.customFieldsExplanation)}
      </h4>

      {b2bSettingsLoading ? (
        <Spinner />
      ) : (
        <CustomFieldsTable
          customFields={activeCustomFields}
          handleDelete={removeCustomField}
          handleUpdate={handleUpdate}
        />
      )}

      <div className="mt6 flex flex-row-reverse">
        <Button variation="primary" onClick={() => addCustomField()}>
          <FormattedMessage id="admin/b2b-organizations.custom-fields.addField" />
        </Button>
      </div>
    </>
  )
}

export default CustomFields
