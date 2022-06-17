import React, { useState, useEffect, Fragment } from 'react'
import { useQuery } from 'react-apollo'
import { Alert } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

import CHECK_CUSTOMER_SCHEMA from '../graphql/checkCustomerSchema.graphql'
import { organizationMessages as storeMessages } from './utils/messages'
import { organizationMessages as adminMessages } from '../admin/utils/messages'

const CheckCustomerSchema = ({ isAdmin }: { isAdmin: boolean }) => {
  const { data } = useQuery(CHECK_CUSTOMER_SCHEMA)
  const { formatMessage } = useIntl()
  const [isInvalidSchema, setIsInvalidSchema] = useState(false)

  useEffect(() => {
    if (!data) {
      return
    }

    setIsInvalidSchema(!data.checkCustomerSchema)
  }, [data])

  return (
    <Fragment>
      {isInvalidSchema && (
        <Alert type="warning">
          {formatMessage(
            isAdmin ? adminMessages.invalidSchema : storeMessages.invalidSchema
          )}
        </Alert>
      )}
    </Fragment>
  )
}

export default CheckCustomerSchema
