import React from 'react'
import { Input, Dropdown } from 'vtex.styleguide'

interface CustomFieldProps {
  index: number
  handleUpdate: (index: number, customField: CustomField) => void
  customField: CustomField
}

const OrganizationDetailsCustomField: React.FC<CustomFieldProps> = ({
  index,
  handleUpdate,
  customField,
  customField: { name, type, value = '', dropdownValues },
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCustomField = {
      ...customField,
      value: e.target.value,
    }

    handleUpdate(index, updatedCustomField)
  }

  if (type === 'dropdown') {
    return (
      <div className="mb5">
        <Dropdown
          key={index}
          label={name}
          size="large"
          options={dropdownValues ?? []}
          onChange={handleChange}
          value={value}
        />
      </div>
    )
  }

  return (
    <div className="mb5">
      <Input
        className="test-class-plus"
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

export default OrganizationDetailsCustomField
