import React, { Fragment, useEffect, useState } from 'react'
import type { FunctionComponent } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { useIntl, FormattedMessage } from 'react-intl'
import {
  AutocompleteInput,
  Button,
  Input,
  Modal,
  Spinner,
  Tag,
} from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { useRuntime } from 'vtex.render-runtime'

import {
  organizationMessages as storeMessages,
  userWidgetMessages as messages,
} from './utils/messages'
import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import USER_WIDGET_QUERY from '../graphql/userWidgetQuery.graphql'
import SET_CURRENT_ORGANIZATION from '../graphql/setCurrentOrganization.graphql'
import STOP_IMPERSONATION from '../graphql/impersonateUser.graphql'
import { B2B_CHECKOUT_SESSION_KEY } from '../utils/constants'
import '../css/user-widget.css'
import { sendStopImpersonateMetric } from '../utils/metrics/impersonate'
import type { ChangeTeamParams } from '../utils/metrics/changeTeam'
import { sendChangeTeamMetric } from '../utils/metrics/changeTeam'

const CSS_HANDLES = [
  'userWidgetContainer',
  'userWidgetLoading',
  'userWidgetRow',
  'userWidgetItem',
  'userWidgetButton',
  'userWidgetImpersonationItem',
  'userWidgetImpersonationButton',
  'userWidgetImpersonationError',
  'userWidgetOrganizationError',
  'userWidgetModal',
  'userWidgetCompanyName',
  'userWidgetCostCenterName',
  'userWidgetRole',
  'col',
  'userWidgetModalRow',
  'userWidgetModalH1',
  'userWidgetModalH2',
  'userWidgetModalH3',
  'userWidgetModalH4',
  'userWidgetModalInput',
  'userWidgetModalJoinButton',
  'userWidgetModalTotal',
  'userWidgetModalTable',
  'userWidgetModalTableContainer',
  'userWidgetModalTableRow',
  'userWidgetModalTableRowChecked',
  'userWidgetModalTableCell',
  'userWidgetModalTableRadio',
] as const

const SESSION_STORAGE_SHOW_MODAL = 'b2b-organizations-showModal'

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('b2b-organizations_isAuthenticated'))) ??
  false

const CustomOrganizationOption = (props: any) => {
  const { roundedBottom, searchTerm, value, selected, onClick } = props
  const [highlightOption, setHighlightOption] = useState(false)

  const renderOptionHighlightedText = () => {
    const highlightableText = typeof value === 'string' ? value : value.label
    const index = highlightableText
      .toLowerCase()
      .indexOf(searchTerm.toLowerCase())

    if (index === -1) {
      return highlightableText
    }

    const prefix = highlightableText.substring(0, index)
    const match = highlightableText.substr(index, searchTerm.length)
    const suffix = highlightableText.substring(`${index}${match.length}`)

    return (
      <span className="truncate">
        <span className="fw7">{prefix}</span>
        {match}
        <span className="fw7">{suffix}</span>
      </span>
    )
  }

  const buttonClasses = `bn w-100 tl pointer pa4 f6 ${
    roundedBottom ? 'br2 br--bottom' : ''
  } ${highlightOption || selected ? 'bg-muted-5' : 'bg-base'}`

  // --- This is a good practice. Use <button />.
  return (
    <button
      className={buttonClasses}
      onFocus={() => setHighlightOption(true)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={onClick}
      disabled={value.status !== 'active'}
    >
      <div className="flex items-center">
        <span className="pr2">{renderOptionHighlightedText()}</span>
        {typeof value !== 'string' && (
          <div className="t-mini c-muted-1">{value.caption}</div>
        )}
      </div>
    </button>
  )
}

interface VtexFunctionComponent<T = Record<string, unknown>>
  extends FunctionComponent<T> {
  schema?: {
    title?: string
    properties?: Record<string, unknown>
  }
}

interface UserWidgetProps {
  showDropdown?: boolean
  showLoadingIndicator?: boolean
}

const sortOrganizations = (a: any, b: any) =>
  a.organizationName < b.organizationName ? -1 : 1

const UserWidget: VtexFunctionComponent<UserWidgetProps> = ({
  showDropdown = true,
  showLoadingIndicator = false,
}) => {
  const { navigate, rootPath } = useRuntime()
  const { formatMessage } = useIntl()
  const handles = useCssHandles(CSS_HANDLES)
  const [loadingState, setLoadingState] = useState(false)
  const [errorState, setErrorState] = useState(false)
  const [errorOrganization, setErrorOrganization] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [radioValue, setRadioValue] = useState('')
  const [checkSession, setCheckSession] = useState(false)

  const [organizationsState, setOrganizationsState] = useState({
    organizationOptions: [],
    costCenterOptions: [],
    organizationInput: '',
    costCenterInput: '',
    currentOrganization: '',
    currentRoleName: '',
    currentCostCenter: '',
    currentOrganizationStatus: '',
    dataList: [],
    totalDataList: 0,
  })

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'b2b-organizations_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )

    if (!checkSession) {
      fetch('/api/sessions?items=public.facets,public.sc').then(response => {
        if (response.status === 200) {
          response.json().then(data => {
            if (window.__RUNTIME__) {
              const segmentToken = {
                ...JSON.parse(atob(window.__RUNTIME__.segmentToken)),
                ...(data?.namespaces?.public?.facets?.value
                  ? { facets: data?.namespaces?.public?.facets?.value }
                  : {}),
                ...(data?.namespaces?.public?.sc?.value
                  ? { sc: data?.namespaces?.public?.sc?.value }
                  : {}),
              }

              window.__RUNTIME__.segmentToken = btoa(
                JSON.stringify(segmentToken)
              )
              setCheckSession(true)
            }
          })
        }
      })
    }
  }

  const { data: userWidgetData, loading: userWidgetLoading } = useQuery(
    USER_WIDGET_QUERY,
    {
      ssr: false,
      skip: !isAuthenticated,
    }
  ) as any

  const [stopImpersonation] = useMutation(STOP_IMPERSONATION)
  const [setCurrentOrganization] = useMutation(SET_CURRENT_ORGANIZATION)

  const handleStopImpersonation = async () => {
    setLoadingState(true)
    setErrorState(false)

    stopImpersonation()
      .then(() => {
        if (sessionStorage.getItem(B2B_CHECKOUT_SESSION_KEY)) {
          sessionStorage.removeItem(B2B_CHECKOUT_SESSION_KEY)
        }

        const metricParams = {
          sessionResponse,
          email: userWidgetData?.checkImpersonation?.email,
          ...organizationsState,
        }

        sendStopImpersonateMetric(metricParams)
        window.location.reload()
      })
      .catch(error => {
        console.error(error)
        setErrorState(true)
        setLoadingState(false)
      })
  }

  const joinOrganization = async () => {
    const [orgId, costId] = radioValue.split(',')

    setLoadingState(true)
    try {
      await setCurrentOrganization({
        variables: {
          orgId,
          costId,
        },
      })
    } catch (error) {
      setErrorOrganization(true)
    } finally {
      setLoadingState(false)
    }

    window.location.reload()
  }

  const handleSetCurrentOrganization = async () => {
    setLoadingState(true)
    try {
      await setCurrentOrganization({
        variables: {
          orgId: organizationsState.currentOrganization,
          costId: organizationsState.currentCostCenter,
        },
      })

      const metricParams: ChangeTeamParams = {
        sessionResponse,
        ...organizationsState,
      }

      sendChangeTeamMetric(metricParams)
    } catch (error) {
      setErrorOrganization(true)
    } finally {
      setLoadingState(false)
    }

    window.location.reload()
  }

  const organizationAutoCompleteInput = {
    onChange: (text: string) => {
      setOrganizationsState({
        ...organizationsState,
        organizationInput: text,
      })
    },
    placeholder: `${formatMessage(storeMessages.autocompleteSearching)}...`,
    value: organizationsState.organizationInput,
  }

  const costCenterAutoCompleteInput = {
    onChange: (text: string) => {
      setOrganizationsState({
        ...organizationsState,
        costCenterInput: text,
      })
    },
    placeholder: `${formatMessage(
      storeMessages.autocompleteSearchingCostCenter
    )}...`,
    value: organizationsState.costCenterInput,
  }

  useEffect(() => {
    const dataList = userWidgetData?.getOrganizationsByEmail
      ?.filter((organization: any) => {
        return (
          organization.organizationName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          organization.costCenterName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      })
      .sort(sortOrganizations)

    setOrganizationsState({
      ...organizationsState,
      dataList,
      totalDataList: dataList?.length,
    })
  }, [searchTerm])

  useEffect(() => {
    if (!userWidgetData?.getOrganizationsByEmail) {
      return
    }

    const uiSettings = userWidgetData?.getB2BSettings?.uiSettings

    if (uiSettings?.showModal) {
      const totalCompanies = userWidgetData?.getOrganizationsByEmail?.length
      const storageShowModal = sessionStorage.getItem(
        SESSION_STORAGE_SHOW_MODAL
      )

      setShowModal(totalCompanies > 1 && !storageShowModal)

      sessionStorage.setItem(SESSION_STORAGE_SHOW_MODAL, 'true')
    }

    const currentOrganization =
      userWidgetData?.getOrganizationByIdStorefront?.id

    const currentCostCenter = userWidgetData?.getCostCenterByIdStorefront?.id

    setOrganizationsState({
      ...organizationsState,
      costCenterInput: userWidgetData?.getCostCenterByIdStorefront?.name,
      organizationInput: userWidgetData?.getOrganizationByIdStorefront?.name,
      organizationOptions: userWidgetData?.getOrganizationsByEmail
        .slice(0, 15)
        .map(
          (organization: {
            orgId: string
            organizationName: string
            organizationStatus: string
          }) => ({
            value: organization.orgId,
            label: organization.organizationName,
            status: organization.organizationStatus,
          })
        ),
      currentRoleName: userWidgetData?.getOrganizationsByEmail?.find(
        (organizations: any) => organizations.costId === currentCostCenter
      )?.role?.name,
      costCenterOptions: userWidgetData?.getOrganizationsByEmail
        .filter(
          (organization: { orgId: string }) =>
            organization.orgId === currentOrganization
        )
        .map((organization: { costId: string; costCenterName: string }) => ({
          value: organization.costId,
          label: organization.costCenterName,
        })),
      currentOrganization,
      currentCostCenter,
      dataList: userWidgetData?.getOrganizationsByEmail?.sort(
        sortOrganizations
      ),
      totalDataList: userWidgetData?.getOrganizationsByEmail?.length,
      currentOrganizationStatus:
        userWidgetData?.getOrganizationByIdStorefront?.status,
    })
  }, [userWidgetData])

  const handleStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Tag type="success" size="small">
            {formatMessage(messages.active)}
          </Tag>
        )

      case 'on-hold':
        return (
          <Tag type="warning" size="small">
            {formatMessage(messages.onHold)}
          </Tag>
        )

      case 'inactive':
        return (
          <Tag type="error" size="small">
            {formatMessage(messages.inactive)}
          </Tag>
        )

      default:
        return ''
    }
  }

  const autoCompleteOrganizationOptions = {
    value: organizationsState.organizationOptions,
    renderOption: (props: any) => <CustomOrganizationOption {...props} />,
    onSelect: (itemSelected: { value: string }) => {
      setOrganizationsState({
        ...organizationsState,
        costCenterInput: '',
        currentOrganization: itemSelected.value,
        costCenterOptions: userWidgetData?.getOrganizationsByEmail
          .filter(
            (organization: { orgId: string }) =>
              organization.orgId === itemSelected.value
          )
          .map((organization: { costId: string; costCenterName: string }) => ({
            value: organization.costId,
            label: organization.costCenterName,
          })) as [],
      })
    },
  }

  const autoCompleteCostCentersOptions = {
    value: organizationsState.costCenterOptions,
    onSelect: (itemSelected: { value: string }) => {
      setOrganizationsState({
        ...organizationsState,
        currentCostCenter: itemSelected.value,
      })
    },
  }

  if (showLoadingIndicator && userWidgetLoading) {
    return (
      <div className={handles.userWidgetLoading}>
        <Spinner color="currentColor" />
      </div>
    )
  }

  if (
    !isAuthenticated ||
    !userWidgetData?.checkUserPermission ||
    !userWidgetData?.getOrganizationByIdStorefront ||
    !userWidgetData?.getCostCenterByIdStorefront
  )
    return null

  return (
    <div
      className={`${handles.userWidgetContainer} w-100 flex flex-column mv3 bg-base--inverted`}
    >
      <Modal
        responsiveFullScreen={true}
        centered
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className={`${handles.userWidgetModalRow} flex`}>
          <div className={`${handles.col}`}>
            <div>
              <h1 className={`${handles.userWidgetModalH1} flex`}>
                {formatMessage(messages.selectCompany)}
              </h1>
              <div className={`${handles.userWidgetModalInput} flex`}>
                <Input
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                  placeholder={`${formatMessage(messages.search)}...`}
                />
                <Button variation="primary">
                  {formatMessage(messages.search)}
                </Button>
              </div>
              <div className={`${handles.userWidgetModalTotal} pt4 mb4`}>
                {organizationsState?.totalDataList}{' '}
                {formatMessage(messages.organizationsFound)}
              </div>
              <div className={handles.userWidgetModalTableContainer}>
                <table className={handles.userWidgetModalTable}>
                  <tbody>
                    {organizationsState?.dataList?.map((organization: any) => {
                      const id = [organization.orgId, organization.costId].join(
                        ','
                      )

                      return (
                        <tr
                          key={id}
                          className={`${handles.userWidgetModalTableRow} ${
                            id === radioValue
                              ? handles.userWidgetModalTableRowChecked
                              : ''
                          }`}
                          onClick={() => setRadioValue(id)}
                        >
                          <td className={handles.userWidgetModalTableCell}>
                            <input
                              id={id}
                              value={id}
                              checked={id === radioValue}
                              onChange={(e: any) =>
                                setRadioValue(e.target.value)
                              }
                              type="radio"
                              className={handles.userWidgetModalTableRadio}
                            />
                          </td>
                          <td className={handles.userWidgetModalTableCell}>
                            <label htmlFor={id}>
                              {organization.organizationName}
                            </label>
                          </td>
                          <td className={handles.userWidgetModalTableCell}>
                            <label htmlFor={id}>
                              {organization.costCenterName}
                            </label>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={handles.userWidgetModalJoinButton}>
              <Button
                variation="primary"
                disabled={!radioValue || !radioValue.trim().length}
                onClick={() => joinOrganization()}
                isLoading={loadingState}
              >
                {formatMessage(messages.join)}
              </Button>
            </div>
          </div>
          <div className={`${handles.col}`}>
            <h2 className={`${handles.userWidgetModalH2} flex`}>
              {formatMessage(messages.currentOrganization)}
            </h2>
            <h3
              className={`${handles.userWidgetModalH3} flex`}
            >{`${userWidgetData?.getOrganizationByIdStorefront?.name}`}</h3>
            <h4
              className={`${handles.userWidgetModalH4} flex`}
            >{`${userWidgetData?.getCostCenterByIdStorefront?.name}`}</h4>
          </div>
        </div>
      </Modal>
      {userWidgetData?.getB2BSettings?.uiSettings?.showModal && (
        <Fragment>
          <div className={`${handles.userWidgetRow} flex pr4 pl4 items-center`}>
            <div
              className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3 flex items-center w-100`}
            >
              <div className={`${handles.userWidgetCompanyName} mr4`}>
                {`${formatMessage(messages.organization)} ${
                  userWidgetData?.getOrganizationByIdStorefront?.name
                }`}
              </div>
              <div className={`${handles.userWidgetCostCenterName} mr4`}>
                {`${formatMessage(messages.costCenter)} ${
                  userWidgetData?.getCostCenterByIdStorefront?.name
                }`}
              </div>
              <div className={`${handles.userWidgetRole}`}>
                {`${formatMessage(messages.role)} ${
                  organizationsState.currentRoleName
                }`}
              </div>
              <div className="ml-auto">
                {userWidgetData?.getOrganizationsByEmail?.length > 1 && (
                  <Button variant="primary" onClick={() => setShowModal(true)}>
                    {formatMessage(messages.changeOrganization)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Fragment>
      )}
      {!userWidgetData?.getB2BSettings?.uiSettings?.showModal && (
        <Fragment>
          <div
            className={`${handles.userWidgetRow} flex justify-center items-center`}
          >
            <div
              className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
            >
              {(!userWidgetData?.checkImpersonation?.email &&
                organizationsState.organizationOptions.length > 1 &&
                showDropdown && (
                  <AutocompleteInput
                    input={organizationAutoCompleteInput}
                    options={autoCompleteOrganizationOptions}
                  />
                )) || (
                <Fragment>
                  {`${formatMessage(messages.organization)} ${
                    userWidgetData?.getOrganizationByIdStorefront?.name
                  }`}
                  {handleStatusMessage(
                    userWidgetData?.getOrganizationByIdStorefront?.status ?? ''
                  )}
                </Fragment>
              )}
            </div>
            <div
              className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
            >
              {(!userWidgetData?.checkImpersonation?.email &&
                organizationsState.organizationOptions.length > 1 &&
                showDropdown && (
                  <AutocompleteInput
                    input={costCenterAutoCompleteInput}
                    options={autoCompleteCostCentersOptions}
                  />
                )) || (
                <Fragment>
                  {`${formatMessage(messages.costCenter)} ${
                    userWidgetData?.getCostCenterByIdStorefront?.name
                  }`}
                </Fragment>
              )}
            </div>
            {!userWidgetData?.checkImpersonation?.email &&
              organizationsState.organizationOptions.length > 1 &&
              showDropdown && (
                <div
                  className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
                >
                  <Button
                    variation="primary"
                    size="small"
                    disabled={
                      organizationsState.currentCostCenter ===
                      userWidgetData?.getCostCenterByIdStorefront?.id
                    }
                    isLoading={loadingState}
                    onClick={() => handleSetCurrentOrganization()}
                  >
                    {formatMessage(messages.setCurrentOrganization)}
                  </Button>
                  {errorOrganization && (
                    <div
                      className={`${handles.userWidgetOrganizationError} error`}
                    >
                      <FormattedMessage id="store/b2b-organizations.set-organization-error" />
                    </div>
                  )}
                </div>
              )}
            <div
              className={`${handles.userWidgetItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
            >
              {`${formatMessage(messages.role)} ${
                organizationsState.currentRoleName
              }`}
            </div>
            <div className={`${handles.userWidgetButton} pa3`}>
              <Button
                variation="secondary"
                size="small"
                onClick={() =>
                  navigate({
                    to: `${rootPath ?? ''}/account#/organization`,
                  })
                }
              >
                {formatMessage(messages.manageOrganization)}
              </Button>
            </div>
          </div>
          {userWidgetData?.checkImpersonation?.email && (
            <div
              className={`${handles.userWidgetRow} flex justify-center items-center`}
            >
              <div
                className={`${handles.userWidgetImpersonationItem} pa3 br2 bg-base--inverted hover-bg-base--inverted active-bg-base--inverted c-on-base--inverted hover-c-on-base--inverted active-c-on-base--inverted dib mr3`}
              >
                {`${formatMessage(messages.impersonating)} ${
                  userWidgetData?.checkImpersonation.email
                }`}
              </div>
              <div className={`${handles.userWidgetImpersonationButton} pa3`}>
                <Button
                  variation="danger"
                  size="small"
                  onClick={() => handleStopImpersonation()}
                  isLoading={loadingState}
                >
                  {formatMessage(messages.stopImpersonation)}
                </Button>
                {errorState && (
                  <div
                    className={`${handles.userWidgetImpersonationError} error`}
                  >
                    <FormattedMessage id="store/b2b-organizations.stop-impersonation-error" />
                  </div>
                )}
              </div>
            </div>
          )}
        </Fragment>
      )}
    </div>
  )
}

UserWidget.schema = {
  title: 'userWidget',
  properties: {
    showDropdown: {
      title: 'showDropdown',
      type: 'boolean',
      default: true,
    },
    showLoadingIndicator: {
      title: 'showLoadingIndicator',
      type: 'boolean',
      default: false,
    },
  },
}

export default UserWidget
