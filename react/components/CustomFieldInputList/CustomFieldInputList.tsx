import React from 'react'
import { Spinner } from 'vtex.styleguide'

import CustomFieldInput from '../../admin/OrganizationDetailsCustomField'

interface Props {
  customFields: CustomField[] | null
  onChange: (customFields: CustomField[]) => void
}

const CustomFieldInputList: React.FC<Props> = ({ customFields, onChange }) => {
  const isLoading = !customFields

  const handleUpdate = (index: number, customField: CustomField) => {
    if (!customFields) return

    const newCustomFields = [...customFields]

    newCustomFields[index] = customField
    onChange(newCustomFields)
  }

  return (
    <>
      {isLoading ? (
        <div className="mb5">
          <Spinner />
        </div>
      ) : (
        customFields?.map((customField: CustomField, index: number) => {
          return (
            <CustomFieldInput
              key={`${customField.name}`}
              index={index}
              handleUpdate={handleUpdate}
              customField={customField}
            />
          )
        })
      )}
    </>
  )
}

export default CustomFieldInputList
