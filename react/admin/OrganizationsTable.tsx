import React, { useEffect, useRef, useState } from 'react'
import { PageHeader, PageBlock, Layout, Tabs, Tab } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { HashRouter, Switch, Route } from 'react-router-dom'

import {
  organizationMessages as messages,
  organizationRequestMessages as requestMessages,
} from './utils/messages'
import OrganizationsList from './OrganizationsList'
import OrganizationRequestsTable from './OrganizationRequestsTable'

const SESSION_STORAGE_KEY = 'organization-tab'

const Container = ({ children }: any) => (
  <div className="mt6">
    <PageBlock>{children}</PageBlock>
  </div>
)

const OrganizationsTable = () => {
  const { formatMessage } = useIntl()
  const [tab, setTab] = React.useState('organizations')
  const routerRef = useRef(null as any)
  const [location, setLocation] = useState(null as any)

  const setupTab = (_tab: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, _tab)
    setTab(_tab)
  }

  const handleTabChange = (_tab: string) => {
    if (!routerRef?.current) {
      return
    }

    routerRef.current?.history?.push(`/${_tab}`)
    setupTab(_tab)
  }

  useEffect(() => {
    if (!location) return

    setupTab(location.pathname.replace('/', ''))
  }, [location])

  useEffect(() => {
    if (!routerRef?.current) return
    if (routerRef.current?.history?.location.pathname === '/') {
      const sessionTab = sessionStorage.getItem('organization-tab')

      routerRef.current?.history?.push(
        sessionTab ? `/${sessionTab}` : '/organizations'
      )
    }

    setLocation(routerRef.current?.history?.location)
  }, [routerRef])

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
