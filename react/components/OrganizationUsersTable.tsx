import React, { useState, useContext } from 'react'
import type { FunctionComponent, ChangeEvent } from 'react'
import { useIntl, defineMessages, FormattedMessage } from 'react-intl'
import {
  Layout,
  PageHeader,
  PageBlock,
  Spinner,
  Table,
  ToastContext,
} from 'vtex.styleguide'
import { useQuery, useMutation } from 'react-apollo'
import { useRuntime } from 'vtex.render-runtime'

const OrganizationUsersTable: FunctionComponent = () => {
  return <Table />
}

export default OrganizationUsersTable
