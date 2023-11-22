import React from 'react'
import {
  Page,
  PageHeader,
  PageHeaderTop,
  PageHeaderTitle,
  PageHeaderBottom,
  TabList,
  Tab,
  PageContent,
  useTabState,
  PageHeaderActions,
} from '@vtex/admin-ui'
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
import BulkImportList from '../components/BulkImportList'
import CreateOrganizationButton from '../components/CreateOrganizationButton'

const SESSION_STORAGE_KEY = 'organization-tab'

const OrganizationsTable = () => {
  const { formatMessage } = useIntl()
  const { tab, handleTabChange, routerRef } = useHashRouter({
    sessionKey: SESSION_STORAGE_KEY,
    defaultPath: 'organizations',
    routes: ['organizations', 'requests', 'settings', 'custom-fields'],
  })

  const tabsState = useTabState({ selectedId: tab })

  return (
    <HashRouter ref={routerRef}>
      <Page>
        <PageHeader>
          <PageHeaderTop>
            <PageHeaderTitle>
              {formatMessage(messages.tablePageTitle)}
            </PageHeaderTitle>

            <PageHeaderActions>
              <Route
                path="/organizations"
                exact
                component={CreateOrganizationButton}
              />
            </PageHeaderActions>
          </PageHeaderTop>
          <PageHeaderBottom>
            <TabList state={tabsState}>
              <Tab
                id="organizations"
                onClick={() => handleTabChange('organizations')}
              >
                {formatMessage(messages.tablePageTitle)}
              </Tab>

              <Tab id="requests" onClick={() => handleTabChange('requests')}>
                {formatMessage(requestMessages.tablePageTitle)}
              </Tab>

              <Tab id="settings" onClick={() => handleTabChange('settings')}>
                {formatMessage(settingsMessages.tablePageTitle)}
              </Tab>

              <Tab
                id="custom-fields"
                onClick={() => handleTabChange('custom-fields')}
              >
                {formatMessage(settingsMessages.customFieldsTitle)}
              </Tab>
            </TabList>
          </PageHeaderBottom>
        </PageHeader>
        <PageContent layout="wide">
          <BulkImportList />
          <CheckCustomerSchema isAdmin={true} />
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
        </PageContent>
      </Page>
    </HashRouter>
  )
}

export default OrganizationsTable
