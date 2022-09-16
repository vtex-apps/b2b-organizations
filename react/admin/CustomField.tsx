import React from 'react'
import { Input } from 'vtex.styleguide'

interface CustomFieldProps extends CustomField {
  index: number
  handleUpdate: (index: number, customField: CustomField) => void
  isDefaultCustomField?: boolean
}

const OrganizationCustomField: React.FC<CustomFieldProps> = ({
  index,
  handleUpdate,
  name,
  type,
  value,
  isDefaultCustomField,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCustomField = {
      type,
      // if located inside Custom Fields tab, where we setup default fields for all organizations, update name of the custom field. In case located inside Organizations details, update value of the field
      name: isDefaultCustomField ? e.target.value : name,
      // value key is added organizations details page
      ...(!isDefaultCustomField && { value: e.target.value }),
    }

    handleUpdate(index, updatedCustomField)
  }

  return (
    <div className="w-100 mv6">
      <Input
        autocomplete="off"
        size="large"
        label={name}
        value={value}
        type={type}
        onChange={handleChange}
      />
    </div>
  )
}

export default OrganizationCustomField
