import type { Session } from '../../modules/session'
import type { Metric } from './metrics'
import { sendMetric } from './metrics'

type ChangeTeamFieldsMetric = {
  date: string
  user_role: string
  user_email?: string
  org_id: string
  cost_center_id: string
}

type ChangeTeamMetric = Metric & { fields: ChangeTeamFieldsMetric }

export type StopImpersonateMetricParams = {
  sessionResponse: Session
  currentCostCenter: string
  costCenterInput: string
  currentOrganization: string
  organizationInput: string
  email: string
}

export type ChangeTeamParams = {
  sessionResponse: Session
  currentRoleName: string
  currentOrganization: string
  currentCostCenter: string
}

const buildMetric = (metricParams: ChangeTeamParams): ChangeTeamMetric => {
  return {
    name: 'b2b-suite-buyerorg-data' as const,
    account:
      metricParams.sessionResponse?.namespaces?.account?.accountName?.value,
    kind: 'change-team-ui-event',
    description: 'User change team/organization - UI',
    fields: {
      date: new Date().toISOString(),
      user_role: metricParams.currentRoleName,
      user_email:
        metricParams.sessionResponse?.namespaces?.profile?.email?.value,
      org_id: metricParams.currentOrganization,
      cost_center_id: metricParams.currentCostCenter,
    },
  }
}

export const sendChangeTeamMetric = async (metricParams: ChangeTeamParams) => {
  try {
    const metric: ChangeTeamMetric = buildMetric(metricParams)

    await sendMetric(metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}
