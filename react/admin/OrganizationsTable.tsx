import React from 'react'
import { PageHeader, PageBlock, Layout, Tabs, Tab } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { HashRouter, Switch, Route } from 'react-router-dom'

import {
  organizationMessages as messages,
  organizationRequestMessages as requestMessages,
  organizationSettingsMessages as settingsMessages,
} from './utils/messages'
import OrganizationsList from './OrganizationsList'
import OrganizationRequestsTable from './OrganizationRequestsTable'
import OrganizationSettings from './OrganizationSettings'
import useHashRouter from './OrganizationDetails/useHashRouter'
import OrganizationCustomFields from './CustomFields'
import CheckCustomerSchema from '../components/CheckCustomerSchema'

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
    routes: ['organizations', 'requests', 'settings', 'custom-fields'],
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
          <Tab
            label={formatMessage(settingsMessages.tablePageTitle)}
            active={tab === 'settings'}
            onClick={() => handleTabChange('settings')}
          />
          <Tab
            label={formatMessage(settingsMessages.customFieldsTitle)}
            active={tab === 'custom-fields'}
            onClick={() => handleTabChange('custom-fields')}
          />
        </Tabs>
        <Container>
          <div className="mb5">
            <CheckCustomerSchema isAdmin={true} />
          </div>
          <Switch>
            <Route path="/organizations" exact component={OrganizationsList} />
            <Route
              path="/requests"
              exact
              component={OrganizationRequestsTable}
            />
            <Route path="/settings" exact component={OrganizationSettings} />
            <Route
              path="/custom-fields"
              exact
              component={OrganizationCustomFields}
            />
          </Switch>
        </Container>
      </HashRouter>
    </Layout>
  )
}

export default OrganizationsTable
