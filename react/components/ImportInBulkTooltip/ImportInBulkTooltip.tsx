import React from 'react'
import { Tooltip } from '@vtex/admin-ui'
import type { ReactNode } from 'react'

import { useTranslate } from '../../hooks'

export type ImportInBulkTooltipProps = {
  visible?: boolean
  children: ReactNode
}

const ImportInBulkTooltip = ({
  visible,
  children,
}: ImportInBulkTooltipProps) => {
  const { translate: t } = useTranslate()

  return visible ? (
    <Tooltip text={t('permissionAlertTooltip') as string} placement="left">
      <div>{children}</div>
    </Tooltip>
  ) : (
    <>{children}</>
  )
}

export default ImportInBulkTooltip
