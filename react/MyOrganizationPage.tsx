import React, { Fragment } from 'react'
import type { FC } from 'react'
import { useQuery } from 'react-apollo'
import { Route } from 'vtex.my-account-commons/Router'
import { Spinner } from 'vtex.styleguide'

import GET_ORGANIZATION from './graphql/getOrganizationStorefront.graphql'
import OrganizationDetails from './components/OrganizationDetails'
import CostCenterDetails from './components/CostCenterDetails'
import RequestOrganizationForm from './components/RequestOrganizationForm'

const MyOrganizationPage: FC = () => {
  const { data, loading } = useQuery(GET_ORGANIZATION, { ssr: false })

  const componentToRender = data?.getOrganizationByIdStorefront?.id
    ? OrganizationDetails
    : RequestOrganizationForm

  return (
    <Fragment>
      <Route
        exact
        path="/organization"
        component={loading ? Spinner : componentToRender}
      />
      <Route path="/organization/:id" component={OrganizationDetails} />
      <Route path="/cost-center/:id" component={CostCenterDetails} />
    </Fragment>
  )
}

export default MyOrganizationPage
