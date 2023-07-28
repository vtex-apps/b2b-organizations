import type { Metric } from './metrics'
import { sendMetric } from './metrics'

type ImpersonatePerson = {
  email: string
  buy_org_id: string
  cost_center_id: string
  cost_center_name: string
}

type ImpersonateUser = ImpersonatePerson
type ImpersonateTarget = ImpersonatePerson & { buy_org_name: string }

type ImpersonateFieldsMetric = {
  user: ImpersonateUser
  target: ImpersonateTarget
  date: string
}

type ImpersonateMetric = Metric & { fields: ImpersonateFieldsMetric }

type ImpersonatePersonParams = {
  costCenterId: string
  costCenterName: string
  organizationId: string
  email: string
}

type ImpersonateUserParams = ImpersonatePersonParams
type ImpersonateTargetParams = ImpersonatePersonParams & {
  organizationName: string
}

export type ImpersonateMetricParams = {
  account: string
  target: ImpersonateTargetParams
  user: ImpersonateUserParams
}

const buildMetric = (metricParams: ImpersonateMetricParams) => {
  const { account, user, target } = metricParams

  const metric = {
    name: 'b2b-suite-buyerorg-data' as const,
    account,
    fields: {
      user: {
        email: user.email,
        buy_org_id: user.organizationId,
        cost_center_id: user.costCenterId,
        cost_center_name: user.costCenterName,
      },
      target: {
        email: target.email,
        buy_org_id: target.organizationId,
        buy_org_name: target.organizationName,
        cost_center_id: target.costCenterId,
        cost_center_name: target.costCenterName,
      },
      date: new Date().toISOString(),
    },
  }

  return metric
}

const buildImpersonateMetric = (
  metricParams: ImpersonateMetricParams
): ImpersonateMetric => {
  const metric: ImpersonateMetric = {
    kind: 'impersonate-ui-event',
    description: 'Impersonate User Action - UI',
    ...buildMetric(metricParams),
  }

  return metric
}

const buildStopImpersonateMetric = (
  metricParams: ImpersonateMetricParams
): ImpersonateMetric => {
  const metric: ImpersonateMetric = {
    kind: 'stop-impersonate-ui-event',
    description: 'Stop Impersonate User Action - UI',
    ...buildMetric(metricParams),
  }

  return metric
}

export const sendImpersonateMetric = async (
  metricParams: ImpersonateMetricParams
) => {
  try {
    const metric = buildImpersonateMetric(metricParams)

    await sendMetric(metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}

export const sendStopImpersonateMetric = async (
  metricParams: ImpersonateMetricParams
) => {
  try {
    const metric = buildStopImpersonateMetric(metricParams)

    await sendMetric(metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}
