import axios from 'axios'

const ANALYTICS_URL = 'https://rc.vtex.com/api/analytics/schemaless-events'

type ImpersonateMetric = {
  kind: 'impersonate-ui-event'
  description: 'Impersonate User Action - UI'
}

type StopImpersonateMetric = {
  kind: 'stop-impersonate-ui-event'
  description: 'Stop Impersonate User Action - UI'
}

export type ChangeTeamMetric = {
  kind: 'change-team-ui-event'
  description: 'User change team/organization - UI'
}

export type Metric = {
  name: 'b2b-suite-buyerorg-data'
  account: string
} & (ImpersonateMetric | StopImpersonateMetric | ChangeTeamMetric)

export const sendMetric = async (metric: Metric) => {
  try {
    await axios.post(ANALYTICS_URL, metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}
