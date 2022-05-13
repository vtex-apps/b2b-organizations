import React from 'react'
import { PageHeader, PageBlock, Layout, Tabs, Tab } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { HashRouter, Switch, Route } from 'react-router-dom'

import {
  organizationMessages as messages,
  organizationRequestMessages as requestMessages,
} from './utils/messages'
import OrganizationsList from './OrganizationsList'
import OrganizationRequestsTable from './OrganizationRequestsTable'
import useHashRouter from './OrganizationDetails/useHashRouter'

const SESSION_STORAGE_KEY = 'organization-tab'

const Container = ({ children }: any) => (
  <div className="mt6">
    <PageBlock>{children}</PageBlock>
  </div>
)

const OrganizationsTable = () => {
  const { formatMessage } = useIntl()
  const { tab, handleTabChange, routerRef } = useHashRouter({
    sessionKey: SESSION_STORAGE_KEY,
    defaultPath: 'organizations',
    routes: ['organizations', 'requests'],
  })

  return (
    <Layout
      fullWidth
      pageHeader={<PageHeader title={formatMessage(messages.tablePageTitle)} />}
    >
      <HashRouter ref={routerRef}>
        <Tabs>
          <Tab
            label={formatMessage(messages.tablePageTitle)}
            active={tab === 'organizations'}
            onClick={() => handleTabChange('organizations')}
          />
          <Tab
            label={formatMessage(requestMessages.tablePageTitle)}
            active={tab === 'requests'}
            onClick={() => handleTabChange('requests')}
          />
        </Tabs>
        <Container>
          <Switch>
            <Route path="/organizations" exact component={OrganizationsList} />
            <Route
              path="/requests"
              exact
              component={OrganizationRequestsTable}
            />
          </Switch>
        </Container>
      </HashRouter>
    </Layout>
  )
}

export default OrganizationsTable
