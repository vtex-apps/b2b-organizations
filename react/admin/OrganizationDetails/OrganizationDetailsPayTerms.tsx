import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import React, { Fragment, useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import { organizationBulkAction } from '../utils/organizationBulkAction'
import GET_PAYMENT_TERMS from '../../graphql/getPaymentTerms.graphql'

export interface PaymentTerm {
  paymentTermId: number
  name: string
  id?: number
}

const OrganizationDetailsPayTerms = ({
  getSchema,
  paymentTermsState,
  setPaymentTermsState,
}: {
  getSchema: (argument?: any) => any
  paymentTermsState: PaymentTerm[]
  setPaymentTermsState: (value: any) => void
}) => {
  /**
   * Hooks
   */
  const { formatMessage } = useIntl()
  /**
   * States
   */

  const [paymentTermsOptions, setPaymentTermsOptions] = useState(
    [] as PaymentTerm[]
  )

  /**
   * Queries
   */

  const { data: paymentTermsData, loading } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  /**
   * Effects
   */

  useEffect(() => {
    if (!paymentTermsData?.getPaymentTerms?.length) {
      return
    }

    const paymentTerms =
      paymentTermsData.getPaymentTerms.map((paymentTerm: any) => {
        return { name: paymentTerm.name, paymentTermId: paymentTerm.id }
      }) ?? []

    setPaymentTermsOptions(paymentTerms)
  }, [paymentTermsData])

  /**
   * Functions
   */

  const handleRemovePaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const paymentTermsToRemove = [] as number[]

    selectedRows.forEach(row => {
      paymentTermsToRemove.push(row.paymentTermId)
    })

    const newPaymentTerms = paymentTermsState.filter(
      paymentTerm => !paymentTermsToRemove.includes(paymentTerm.paymentTermId)
    )

    setPaymentTermsState(newPaymentTerms)
  }

  const handleAddPaymentTerms = (rowParams: {
    selectedRows: PaymentTerm[]
  }) => {
    const { selectedRows = [] } = rowParams
    const newPaymentTerms = [] as PaymentTerm[]

    selectedRows.forEach((row: any) => {
      if (
        !paymentTermsState.some(
          paymentTerm => paymentTerm.paymentTermId === row.paymentTermId
        )
      ) {
        newPaymentTerms.push({
          name: row.name,
          paymentTermId: row.paymentTermId,
        })
      }
    })

    setPaymentTermsState([...paymentTermsState, ...newPaymentTerms])
  }

  return (
    <Fragment>
      <PageBlock variation="half" title={formatMessage(messages.paymentTerms)}>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.assigned-to-org" />
          </h4>
          <Table
            fullWidth
            schema={getSchema()}
            items={paymentTermsState}
            bulkActions={organizationBulkAction(
              handleRemovePaymentTerms,
              messages.removeFromOrg,
              formatMessage
            )}
          />
        </div>
        <div>
          <h4 className="t-heading-4 mt0 mb0">
            <FormattedMessage id="admin/b2b-organizations.organization-details.available" />
          </h4>
          <Table
            fullWidth
            schema={getSchema('availablePayments')}
            items={paymentTermsOptions}
            loading={loading}
            bulkActions={organizationBulkAction(
              handleAddPaymentTerms,
              messages.addToOrg,
              formatMessage
            )}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsPayTerms
