import React, { useState, useEffect } from 'react'
import { Input, IconDelete, IconPlus, Toggle, Dropdown } from 'vtex.styleguide'
import { Button, Flex, csx } from '@vtex/admin-ui'
import { useIntl } from 'react-intl'

import { organizationCustomFieldsMessages as customFieldsMessages } from './utils/messages'

interface CustomFieldProps {
  customField: CustomField
  name: string
  handleUpdate: (customField: CustomField) => void
}

interface DropdownValue {
  value: string
  label: string
}

const DefaultCustomField: React.FC<CustomFieldProps> = ({
  name,
  handleUpdate,
  customField,
  customField: { type, value, dropdownValues, useOnRegistration = false },
}) => {
  const { formatMessage } = useIntl()

  const [dropdownValuesLocal, setDropdownValuesLocal] = useState<
    DropdownValue[]
  >([])

  const [useOnRegistrationLocal, setUseOnRegistrationLocal] = useState(false)

  useEffect(() => {
    setDropdownValuesLocal(dropdownValues ?? [])
    setUseOnRegistrationLocal(!!useOnRegistration)
  }, [dropdownValues, useOnRegistration])

  const fieldOptionsNew = [
    {
      value: 'text',
      label: formatMessage(customFieldsMessages.customFieldsTextLabel),
    },
    {
      value: 'dropdown',
      label: formatMessage(customFieldsMessages.customFieldsDropdownLabel),
    },
  ]

  const [dropdownState, setDropdownState] = useState('text')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedCustomField = {
      ...customField,
      name: e.target.value,
    }

    handleUpdate(updatedCustomField)
  }

  const handleDropdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedType = e.target.value === 'text' ? 'text' : 'dropdown'

    handleUpdate({
      ...customField,
      type: updatedType,
      dropdownValues: [],
    })
    setDropdownState(updatedType)
    setDropdownValuesLocal([])
  }

  const handleDropdownItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    i: number,
    labelUpdate?: boolean
  ) => {
    const { value: eventValue } = e.target

    setDropdownValuesLocal(prev => {
      const newDropdownValues = [...prev]

      newDropdownValues[i] = {
        ...prev[i],
        ...(labelUpdate && { label: eventValue }),
        ...(!labelUpdate && { value: eventValue }),
      }

      const updatedCustomField = {
        name: value ?? name,
        type: dropdownState === 'dropdown' ? 'dropdown' : type,
        dropdownValues: newDropdownValues,
      }

      handleUpdate(updatedCustomField)

      return newDropdownValues
    })
  }

  const handleAddDropdownItem = () => {
    setDropdownValuesLocal(prevValues => [
      ...prevValues,
      { value: '', label: '' },
    ])
  }

  const handleDeleteDropdownItem = (i: number) => {
    setDropdownValuesLocal(prev => {
      const newDropdownValues = [...prev]

      newDropdownValues.splice(i, 1)

      return newDropdownValues
    })
  }

  const handleToggle = () => {
    setUseOnRegistrationLocal(prev => {
      const updatedCustomField = {
        ...customField,
        useOnRegistration: !prev,
      }

      handleUpdate(updatedCustomField)

      return !prev
    })
  }

  useEffect(() => {
    setDropdownState(
      type === 'dropdown' ? fieldOptionsNew[1].value : fieldOptionsNew[0].value
    )
  }, [type])

  return (
    <div className="w-100 mv6 flex">
      <Flex className="w-20 mr4 pv6">
        <Toggle
          checked={useOnRegistrationLocal}
          onChange={handleToggle}
          label={formatMessage(
            customFieldsMessages.customFieldsTableUseOnRegistration
          )}
        />
      </Flex>

      <Dropdown
        label={formatMessage(customFieldsMessages.customFieldsTableFieldType)}
        size="large"
        options={fieldOptionsNew ?? []}
        onChange={handleDropdownChange}
        value={dropdownState}
        className="w-100"
      />
      <Flex direction="column" className="w-100 ml4">
        <Input
          autocomplete="off"
          size="large"
          label={name}
          value={customField.name}
          type={type}
          onChange={handleChange}
        />
        {/* Create inputs for value and label of a dropdown */}
        {dropdownValuesLocal ? (
          <Flex direction="column" className="w-100">
            {dropdownValuesLocal?.map(
              (dropdownValue: DropdownValue, i: number) => (
                <Flex
                  direction="row"
                  align="end"
                  className="w-100"
                  key={`dropdown${dropdownValue.label}`}
                >
                  <Flex className="w-50 mr6">
                    <Input
                      autocomplete="off"
                      size="medium"
                      label={formatMessage(
                        customFieldsMessages.customFieldsDropdownLineValue
                      )}
                      value={dropdownValue.value}
                      type="text"
                      className="mr4 w-50"
                      style={{
                        border: '1px solid red',
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleDropdownItemChange(e, i)
                      }
                    />
                  </Flex>
                  <Input
                    autocomplete="off"
                    size="medium"
                    label={formatMessage(
                      customFieldsMessages.customFieldsDropdownLineLabel
                    )}
                    value={dropdownValue.label}
                    type="text"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleDropdownItemChange(e, i, true)
                    }
                  />
                  <Button
                    icon={
                      <IconDelete
                        title={formatMessage(
                          customFieldsMessages.customFieldsRemoveDropdownLine
                        )}
                      />
                    }
                    aria-label={formatMessage(
                      customFieldsMessages.customFieldsRemoveDropdownLine
                    )}
                    variant="secondary"
                    onClick={() => handleDeleteDropdownItem(i)}
                    className={csx({
                      marginLeft: '10px',
                    })}
                  />
                </Flex>
              )
            )}
          </Flex>
        ) : null}
      </Flex>
      {dropdownState === 'dropdown' ? (
        <Button
          icon={
            <IconPlus
              title={formatMessage(
                customFieldsMessages.customFieldsAddDropdownLine
              )}
            />
          }
          aria-label={formatMessage(
            customFieldsMessages.customFieldsAddDropdownLine
          )}
          onClick={handleAddDropdownItem}
          className={csx({
            marginTop: '35px',
            marginLeft: '10px',
          })}
        />
      ) : null}
    </div>
  )
}

export default DefaultCustomField
