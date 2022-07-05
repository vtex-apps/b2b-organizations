import { FormattedMessage, useIntl } from 'react-intl'
import { PageBlock, Table } from 'vtex.styleguide'
import React, { Fragment, useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'

import { organizationMessages as messages } from '../utils/messages'
import GET_PAYMENT_TERMS from '../../graphql/getPaymentTerms.graphql'

export interface PaymentTerm {
  paymentTermId: number
  name: string
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

  const { data: paymentTermsData } = useQuery<{
    getPaymentTerms: PaymentTerm[]
  }>(GET_PAYMENT_TERMS, { ssr: false })

  /**
   * Effects
   */

  useEffect(() => {
    if (
      !paymentTermsData?.getPaymentTerms?.length ||
      paymentTermsOptions.length
    ) {
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
    return messages.removeFromOrg
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

  const bulkActions = (handleCallback: (params: any) => void) => {
    return {
      texts: {
        rowsSelected: (qty: number) =>
          formatMessage(messages.selectedRows, {
            qty,
          }),
      },
      main: {
        label: formatMessage(handleCallback.name === 'handleRemovePaymentTerms' ? messages.removeFromOrg : messages.addToOrg),
        handleCallback,
      },
    }
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
            bulkActions={bulkActions(handleRemovePaymentTerms)}
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
            bulkActions={bulkActions(handleAddPaymentTerms)}
          />
        </div>
      </PageBlock>
    </Fragment>
  )
}

export default OrganizationDetailsPayTerms
