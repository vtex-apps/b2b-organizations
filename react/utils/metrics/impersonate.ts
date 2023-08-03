import type { B2BUserSimple } from '../../components/OrganizationUsersTable'
import { getSession } from '../../modules/session'
import type { Metric, SessionResponseParam } from './metrics'
import { sendMetric } from './metrics'

type ImpersonatePerson = {
  email: string
  buyer_org_id: string
  cost_center_id: string
  cost_center_name: string
}

type ImpersonateUser = ImpersonatePerson
type ImpersonateTarget = ImpersonatePerson & { buyer_org_name: string }

type ImpersonateFieldsMetric = {
  user: ImpersonateUser
  target: ImpersonateTarget
  date: string
}

type ImpersonateMetric = Metric & { fields: ImpersonateFieldsMetric }

export type ImpersonateMetricParams = {
  costCenterData: {
    getCostCenterByIdStorefront: {
      id: string
      name: string
      organization: string
    }
  }
  target: B2BUserSimple
}

export type StopImpersonateMetricParams = {
  sessionResponse: SessionResponseParam
  currentCostCenter: string
  costCenterInput: string
  currentOrganization: string
  organizationInput: string
  email: string
}

const buildImpersonateMetric = async (
  metricParams: ImpersonateMetricParams
) => {
  const { target, costCenterData } = metricParams

  const session = await getSession()
  const sessionResponse = (session?.response as unknown) as SessionResponseParam

  return {
    name: 'b2b-suite-buyerorg-data' as const,
    kind: 'impersonate-ui-event',
    description: 'Impersonate User Action - UI',
    account: sessionResponse?.namespaces?.account?.accountName?.value,
    fields: {
      user: {
        email: sessionResponse?.namespaces?.profile?.email?.value,
        buyer_org_id: costCenterData?.getCostCenterByIdStorefront.organization,
        cost_center_id: costCenterData?.getCostCenterByIdStorefront.id,
        cost_center_name: costCenterData?.getCostCenterByIdStorefront.name,
      },
      target: {
        email: target.email,
        buyer_org_id: target.orgId,
        buyer_org_name: target.organizationName,
        cost_center_id: target.costId,
        cost_center_name: target.costCenterName,
      },
      date: new Date().toISOString(),
    },
  } as ImpersonateMetric
}

const buildStopImpersonateMetric = (
  metricParams: StopImpersonateMetricParams
) => {
  return {
    name: 'b2b-suite-buyerorg-data' as const,
    kind: 'stop-impersonate-ui-event',
    description: 'Stop Impersonate User Action - UI',
    account:
      metricParams.sessionResponse?.namespaces?.account?.accountName?.value,
    fields: {
      user: {
        email:
          metricParams.sessionResponse?.namespaces?.authentication
            ?.storeUserEmail?.value,
      },
      target: {
        email: metricParams.email,
        buyer_org_id: metricParams.currentOrganization,
        buyer_org_name: metricParams.organizationInput,
        cost_center_id: metricParams.currentCostCenter,
        cost_center_name: metricParams.costCenterInput,
      },
      date: new Date().toISOString(),
    },
  } as ImpersonateMetric
}

export const sendImpersonateMetric = async (
  metricParams: ImpersonateMetricParams
) => {
  try {
    const metric = await buildImpersonateMetric(metricParams)

    await sendMetric(metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}

export const sendStopImpersonateMetric = async (
  metricParams: StopImpersonateMetricParams
) => {
  try {
    const metric = buildStopImpersonateMetric(metricParams)

    await sendMetric(metric)
  } catch (error) {
    console.warn('Unable to log metrics', error)
  }
}
