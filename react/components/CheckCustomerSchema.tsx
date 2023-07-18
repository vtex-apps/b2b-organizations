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
        <div className="mb5">
          <Alert
            type="error"
            action={{
              label: formatMessage(
                isAdmin ? adminMessages.checkItOut : storeMessages.checkItOut
              ),
              onClick: () =>
                window.open(
                  'https://developers.vtex.com/vtex-developer-docs/docs/vtex-b2b-suite',
                  '_blank'
                ),
            }}
          >
            {formatMessage(
              isAdmin
                ? adminMessages.invalidSchema
                : storeMessages.invalidSchema
            )}
          </Alert>
        </div>
      )}
    </Fragment>
  )
}

export default CheckCustomerSchema
