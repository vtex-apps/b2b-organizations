import type { FC } from 'react'
import React, { useState, useContext, useEffect, Fragment } from 'react'
import {
  Input,
  Button,
  ToastContext,
  Layout,
  PageHeader,
  PageBlock,
} from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'

import { getSession } from '../modules/session'
import storageFactory from '../utils/storage'
import CREATE_ORGANIZATION_REQUEST from '../graphql/createOrganizationRequest.graphql'

const localStore = storageFactory(() => localStorage)

const useSessionResponse = () => {
  const [session, setSession] = useState<any>()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then((sessionResponse) => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}

let isAuthenticated =
  JSON.parse(String(localStore.getItem('orderquote_isAuthenticated'))) ?? false

const CSS_HANDLES = [
  'newOrganizationContainer',
  'newOrganizationInput',
  'newOrganizationButtonsContainer',
  'newOrganizationButtonSubmit',
] as const

const RequestOrganizationForm: FC = () => {
  const { formatMessage } = useIntl()

  const { showToast } = useContext(ToastContext)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)
  const [createOrganizationRequest] = useMutation(CREATE_ORGANIZATION_REQUEST)

  const [formState, setFormState] = useState({
    organizationName: '',
    defaultCostCenterName: '',
    defaultCostCenterLine1: '',
    defaultCostCenterLine2: '',
    defaultCostCenterCity: '',
    defaultCostCenterState: '',
    defaultCostCenterPostalCode: '',
    isSubmitting: false,
  })

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'orderquote_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const translateMessage = (message: MessageDescriptor) => {
    return formatMessage(message)
  }

  const toastMessage = (messsageKey: string) => {
    const message = translateMessage({
      id: messsageKey,
    })

    const action = undefined

    showToast({ message, action })
  }

  const handleSubmit = () => {
    setFormState({
      ...formState,
      isSubmitting: true,
    })

    const organizationRequest = {
      name: formState.organizationName,
      defaultCostCenter: {
        name: formState.defaultCostCenterName,
        address: {
          line1: formState.defaultCostCenterLine1,
          line2: formState.defaultCostCenterLine2,
          city: formState.defaultCostCenterCity,
          state: formState.defaultCostCenterState,
          postalCode: formState.defaultCostCenterPostalCode,
        },
      },
    }

    createOrganizationRequest({
      variables: {
        input: organizationRequest,
      },
    })
      .then(() => {
        toastMessage(
          'store/b2b-organizations.request-new-organization.submit.toast-success'
        )
      })
      .catch((error) => {
        console.error(error)
        toastMessage(
          'store/b2b-organizations.request-new-organization.submit.toast-failure'
        )
      })

    setFormState({
      ...formState,
      isSubmitting: false,
    })
  }

  return (
    <div className={`${handles.newOrganizationContainer} pv6 ph4 mw9 center`}>
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={translateMessage({
              id: 'store/b2b-organizations.request-new-organization.title',
            })}
          />
        }
      >
        {!isAuthenticated ? (
          <PageBlock>
            <div>
              <FormattedMessage id="store/b2b-organizations.not-authenticated" />
            </div>
          </PageBlock>
        ) : (
          <Fragment>
            <PageBlock>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.organization-name.label',
                  })}
                  value={formState.organizationName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      organizationName: e.target.value,
                    })
                  }}
                />
              </div>
            </PageBlock>
            <PageBlock
              variation="full"
              title={translateMessage({
                id: 'store/b2b-organizations.request-new-organization.default-cost-center.title',
              })}
            >
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-name.label',
                  })}
                  value={formState.defaultCostCenterName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterName: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-line1.label',
                  })}
                  value={formState.defaultCostCenterLine1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterLine1: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-line2.label',
                  })}
                  value={formState.defaultCostCenterLine2}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterLine2: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-city.label',
                  })}
                  value={formState.defaultCostCenterCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterCity: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-state.label',
                  })}
                  value={formState.defaultCostCenterState}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterState: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationInput} mb5 flex flex-column`}
              >
                <Input
                  size="large"
                  label={translateMessage({
                    id: 'store/b2b-organizations.request-new-organization.default-cost-center-postal-code.label',
                  })}
                  value={formState.defaultCostCenterPostalCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormState({
                      ...formState,
                      defaultCostCenterPostalCode: e.target.value,
                    })
                  }}
                />
              </div>
              <div
                className={`${handles.newOrganizationButtonsContainer} mb5 flex flex-column items-end pt6`}
              >
                <div className="flex justify-content flex-row">
                  <div
                    className={`no-wrap ${handles.newOrganizationButtonSubmit}`}
                  >
                    <Button
                      variation="primary"
                      isLoading={formState.isSubmitting}
                      onClick={() => {
                        handleSubmit()
                      }}
                      disabled={
                        !formState.organizationName ||
                        !formState.defaultCostCenterName ||
                        !formState.defaultCostCenterLine1 ||
                        !formState.defaultCostCenterCity ||
                        !formState.defaultCostCenterState ||
                        !formState.defaultCostCenterPostalCode
                      }
                    >
                      <FormattedMessage id="store/b2b-organizations.request-new-organization.submit-button.label" />
                    </Button>
                  </div>
                </div>
              </div>
            </PageBlock>
          </Fragment>
        )}
      </Layout>
    </div>
  )
}

interface MessageDescriptor {
  id: string
  description?: string | Record<string, unknown>
  defaultMessage?: string
  values?: Record<string, unknown>
}

export default RequestOrganizationForm
