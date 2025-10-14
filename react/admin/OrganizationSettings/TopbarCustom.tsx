import type { ChangeEvent } from 'react'
import React from 'react'
import { useIntl, FormattedMessage } from 'react-intl'
import { Box, ColorPicker, Textarea } from 'vtex.styleguide'

import { organizationSettingsMessages } from '../utils/messages'

type Color = { hex: string }

interface TopbarCustomProps {
  colorState: {
    color: Color
    history: string[]
  }
  message: string
  onChangeColor: (color: Color) => void
  onChangeMessage: (text: string) => void
}

export function TopbarCustom({
  colorState,
  message,
  onChangeColor,
  onChangeMessage,
}: TopbarCustomProps) {
  const { formatMessage } = useIntl()

  return (
    <div className="mv4 topbar-custom">
      <Box style={{ padding: 0 }}>
        <h3 className="t-heading-3">
          <FormattedMessage id="admin/b2b-organizations.warning-topbar-inative-org.form.title" />
        </h3>
        <p className="t-small mw9 mb5">
          <FormattedMessage id="admin/b2b-organizations.warning-topbar-inative-org.form.help-text" />
        </p>
        <ColorPicker
          label={formatMessage(
            organizationSettingsMessages.formColorPickerLabel
          )}
          color={colorState.color}
          colorHistory={colorState.history}
          onChange={onChangeColor}
        />
        <Textarea
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChangeMessage(event.target.value)
          }
          value={message}
          label={formatMessage(organizationSettingsMessages.formTextareaLabel)}
          name="message"
          size="small"
          helpText={formatMessage(
            organizationSettingsMessages.formTextareaHelpText
          )}
        />
      </Box>
    </div>
  )
}
