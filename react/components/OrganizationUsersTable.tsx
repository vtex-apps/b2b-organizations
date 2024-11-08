import React, { Fragment, useState, useEffect, useContext } from 'react'
import type { FunctionComponent, ChangeEvent } from 'react'
import { useIntl } from 'react-intl'
import { Table, ToastContext } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useQuery, useMutation } from 'react-apollo'

import { organizationMessages as storeMessages } from './utils/messages'
import { organizationMessages as adminMessages } from '../admin/utils/messages'
import NewUserModal from './NewUserModal'
import EditUserModal from './EditUserModal'
import RemoveUserModal from './RemoveUserModal'
import GET_USERS from '../graphql/getUsers.graphql'
import ADD_USER from '../graphql/addUser.graphql'
import UPDATE_USER from '../graphql/updateUser.graphql'
import REMOVE_USER from '../graphql/removeUser.graphql'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'
import IMPERSONATE_USER from '../graphql/impersonateB2BUser.graphql'
import { B2B_CHECKOUT_SESSION_KEY } from '../utils/constants'
import { sendImpersonateMetric } from '../utils/metrics/impersonate'

interface Props {
  organizationId: string
  permissions: string[]
  refetchCostCenters: boolean
  isAdmin?: boolean
  isSalesAdmin?: boolean
}

interface CellRendererProps {
  cellData: unknown
  rowData: B2BUserSimple
  updateCellMeasurements: () => void
}

export interface B2BUserSimple extends UserDetails {
  costCenterName: string
  role: RoleSimple
  organizationName: string
}

interface RoleSimple {
  name: string
  slug: string
}

const compareUsers = (a: B2BUserSimple, b: B2BUserSimple) => {
  return a.email.toLowerCase() < b.email.toLowerCase() ? -1 : 1
}

const initialState = {
  search: '',
  page: 1,
  pageSize: 25,
  sortOrder: 'ASC',
  sortedBy: 'email',
  organizationId: null,
  organizations: ['active', 'on-hold', 'inactive'],
}

const ruleClickEnabled = ({
  isAdmin,
  canEditSales,
  slug,
  canEdit,
  isSalesAdmin,
}: {
  isAdmin: boolean
  canEditSales: boolean
  slug: string
  canEdit: boolean
  isSalesAdmin: boolean
}) => {
  return !(
    !isAdmin &&
    ((!canEdit && !canEditSales) ||
      (slug.match(/sales-admin/) && !isSalesAdmin && !canEdit) ||
      (!slug.match(/sales/) && canEditSales) ||
      (slug.match(/sales/) && canEdit))
  )
}

const OrganizationUsersTable: FunctionComponent<Props> = ({
  organizationId,
  permissions,
  isAdmin = false,
  isSalesAdmin = false,
}) => {
  const { formatMessage } = useIntl()
  const { showToast } = useContext(ToastContext)
  const toast = isAdmin ? useToast() : null
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [updateUserLoading, setUpdateUserLoading] = useState(false)
  const [removeUserLoading, setRemoveUserLoading] = useState(false)
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editUserDetails, setEditUserDetails] = useState({} as UserDetails)
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false)
  const [usersState, setUsersState] = useState([])

  const contextualToast = (
    message: string,
    type: 'critical' | 'positive' | 'info' | 'warning' | undefined
  ) => {
    if (isAdmin && toast) {
      toast({ variant: type, message })
    } else {
      showToast(message)
    }
  }

  const canManageOrganization = permissions.includes('manage-organization')

  const canEdit = isAdmin || permissions.includes('add-users-organization')

  const canEditSales =
    isAdmin ||
    permissions.includes('add-sales-users-all') ||
    permissions.includes('add-sales-users-current')

  const canImpersonateAll = permissions.includes('impersonate-users-all')
  const canImpersonateOrg = permissions.includes(
    'impersonate-users-organization'
  )

  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: {
      ...initialState,
      organizationId: isSalesAdmin ? null : organizationId,
    },
    fetchPolicy: 'network-only',
    ssr: false,
    notifyOnNetworkStatusChange: true,
    skip: !organizationId,
  })

  const [variableState, setVariables] = useState(initialState)

  const { data: costCenterData } = useQuery(GET_COST_CENTER, {
    ssr: false,
    skip: isAdmin,
  })

  const canImpersonateCost = (rowData: B2BUserSimple) =>
    permissions.includes('impersonate-users-costcenter') &&
    rowData.costId === costCenterData?.getCostCenterByIdStorefront?.id

  const [addUser] = useMutation(ADD_USER)
  const [updateUser] = useMutation(UPDATE_USER)
  const [removeUser] = useMutation(REMOVE_USER)
  const [impersonateUser] = useMutation(IMPERSONATE_USER)

  useEffect(() => {
    if (!data?.getUsersPaginated?.data?.length) return

    const users = data.getUsersPaginated.data.sort(compareUsers)

    setUsersState(users)
  }, [data])

  const handleAddUser = (user: UserInput) => {
    setAddUserLoading(true)
    addUser({ variables: user })
      .then(
        ({
          data: {
            addUser: { status },
          },
        }) => {
          setAddUserModalOpen(false)
          if (status === 'error') {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastAddUserFailure
                  : storeMessages.toastAddUserFailure
              ),
              'critical'
            )
          } else if (status === 'duplicated-organization') {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastUserDuplicatedOrganization
                  : storeMessages.toastUserDuplicatedOrganization
              ),
              'critical'
            )
          } else if (status === 'duplicated') {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastUserDuplicated
                  : storeMessages.toastUserDuplicated
              ),
              'critical'
            )
          } else {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastAddUserSuccess
                  : storeMessages.toastAddUserSuccess
              ),
              'positive'
            )
          }

          setTimeout(() => {
            setAddUserLoading(false)
            refetch()
          }, 2000)
        }
      )
      .catch(error => {
        console.error(error)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastAddUserFailure
              : storeMessages.toastAddUserFailure
          ),
          'critical'
        )
        setAddUserLoading(false)
      })
  }

  const handleCloseAddUserModal = () => {
    setAddUserModalOpen(false)
  }

  const handleUpdateUser = (user: UserDetails) => {
    setUpdateUserLoading(true)
    updateUser({ variables: user })
      .then(
        ({
          data: {
            updateUser: { status },
          },
        }) => {
          setEditUserModalOpen(false)
          setEditUserDetails({} as UserDetails)
          if (status === 'error') {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastUpdateUserFailure
                  : storeMessages.toastUpdateUserFailure
              ),
              'critical'
            )
          } else {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastUpdateUserSuccess
                  : storeMessages.toastUpdateUserSuccess
              ),
              'positive'
            )
          }

          setTimeout(() => {
            setUpdateUserLoading(false)
            refetch()
          }, 2000)
        }
      )
      .catch(error => {
        console.error(error)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastUpdateUserFailure
              : storeMessages.toastUpdateUserFailure
          ),
          'critical'
        )
        setUpdateUserLoading(false)
      })
  }

  const handleCloseUpdateUserModal = () => {
    setEditUserModalOpen(false)
    setEditUserDetails({} as UserDetails)
  }

  const handleShowRemoveUserModal = () => {
    setEditUserModalOpen(false)
    setRemoveUserModalOpen(true)
  }

  const handleCloseRemoveUserModal = () => {
    setRemoveUserModalOpen(false)
    setEditUserDetails({} as UserDetails)
  }

  const handleRemoveUser = () => {
    setRemoveUserLoading(true)
    removeUser({ variables: editUserDetails })
      .then(() => {
        setRemoveUserModalOpen(false)
        setEditUserDetails({} as UserDetails)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastRemoveUserSuccess
              : storeMessages.toastRemoveUserSuccess
          ),
          'positive'
        )
        setRemoveUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastRemoveUserFailure
              : storeMessages.toastRemoveUserFailure
          ),
          'critical'
        )
        setRemoveUserLoading(false)
      })
  }

  const handleImpersonation = (rowData: B2BUserSimple) => {
    if (
      !canImpersonateAll &&
      !canImpersonateOrg &&
      !canImpersonateCost(rowData)
    ) {
      showToast(formatMessage(storeMessages.toastImpersonateForbidden))

      return
    }

    showToast(formatMessage(storeMessages.toastImpersonateStarting))

    if (sessionStorage.getItem(B2B_CHECKOUT_SESSION_KEY)) {
      sessionStorage.removeItem(B2B_CHECKOUT_SESSION_KEY)
    }

    impersonateUser({
      variables: { id: rowData.id },
    })
      .then(result => {
        if (result?.data?.impersonateB2BUser?.status === 'error') {
          console.error(
            'Impersonation error:',
            result.data.impersonateB2BUser.message
          )
          if (
            result.data.impersonateB2BUser.message === 'userId not found in CL'
          ) {
            showToast(formatMessage(storeMessages.toastImpersonateIdMissing))
          } else {
            showToast(formatMessage(storeMessages.toastImpersonateFailure))
          }
        } else {
          const metricParams = {
            costCenterData,
            target: rowData,
          }

          sendImpersonateMetric(metricParams)
          window.location.reload()
        }
      })
      .catch(error => {
        console.error(error)
        showToast(formatMessage(storeMessages.toastImpersonateFailure))
      })
  }

  const getSchema = () => {
    const isEnabled = ({ role: { slug } }: { role: { slug: string } }) => {
      if (!canManageOrganization) {
        return ruleClickEnabled({
          isAdmin,
          canEditSales,
          slug,
          canEdit,
          isSalesAdmin,
        })
      }

      return canManageOrganization
    }

    const properties = {
      email: {
        title: formatMessage(
          isAdmin ? adminMessages.columnEmail : storeMessages.columnEmail
        ),
        cellRenderer: ({ rowData: { email, role } }: CellRendererProps) => (
          <span className={!isEnabled({ role }) ? 'c-disabled' : ''}>
            {email}
          </span>
        ),
      },
      roleId: {
        title: formatMessage(
          isAdmin ? adminMessages.columnRole : storeMessages.columnRole
        ),
        cellRenderer: ({ rowData: { role } }: CellRendererProps) => (
          <span className={!isEnabled({ role }) ? 'c-disabled' : ''}>
            {role?.name ?? ''}
          </span>
        ),
      },
      organizationName: {
        title: formatMessage(storeMessages.columnOrganizationName),
        cellRenderer: ({
          rowData: { organizationName, role },
        }: CellRendererProps) => (
          <span className={!isEnabled({ role }) ? 'c-disabled' : ''}>
            {organizationName}
          </span>
        ),
      },
      costCenterName: {
        title: formatMessage(
          isAdmin
            ? adminMessages.columnCostCenter
            : storeMessages.columnCostCenter
        ),
        cellRenderer: ({
          rowData: { costCenterName, role },
        }: CellRendererProps) => (
          <span className={!isEnabled({ role }) ? 'c-disabled' : ''}>
            {costCenterName}
          </span>
        ),
      },
    }

    if (!isSalesAdmin) {
      delete properties.organizationName
    }

    return { properties }
  }

  const handleNextClick = () => {
    const newPage = variableState.page + 1

    setVariables({
      ...variableState,
      page: newPage,
    })

    refetch({
      ...variableState,
      page: newPage,
      organizationId: isSalesAdmin ? null : organizationId,
    })
  }

  const handlePrevClick = () => {
    if (variableState.page === 1) return

    const newPage = variableState.page - 1

    setVariables({
      ...variableState,
      page: newPage,
    })

    refetch({
      ...variableState,
      page: newPage,
      organizationId: isSalesAdmin ? null : organizationId,
    })
  }

  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e

    setVariables({
      ...variableState,
      page: 1,
      pageSize: +value,
    })

    refetch({
      ...variableState,
      page: 1,
      pageSize: +value,
      organizationId: isSalesAdmin ? null : organizationId,
    })
  }

  const handleInputSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value },
    } = e

    setVariables({
      ...variableState,
      search: value,
    })
  }

  const handleInputSearchClear = () => {
    setVariables({
      ...variableState,
      search: '',
    })

    refetch({
      ...variableState,
      search: '',
      page: 1,
      organizationId: isSalesAdmin ? null : organizationId,
    })
  }

  const handleInputSearchSubmit = () => {
    refetch({
      ...variableState,
      organizationId: isSalesAdmin ? null : organizationId,
      page: 1,
    })
  }

  const handleRowClick = ({ rowData }: CellRendererProps) => {
    const canClick =
      canManageOrganization ||
      ruleClickEnabled({
        isAdmin,
        canEditSales,
        slug: rowData.role?.slug ?? '',
        canEdit,
        isSalesAdmin,
      })

    if (!canClick) return

    setEditUserDetails({
      id: rowData.id,
      roleId: rowData.roleId,
      userId: rowData.userId,
      clId: rowData.clId,
      orgId: rowData.orgId,
      costId: rowData.costId,
      name: rowData.name,
      email: rowData.email,
      canImpersonate: rowData.canImpersonate,
    })
    setEditUserModalOpen(true)
  }

  const handleSort = ({
    sortOrder: _sortOrder,
    sortedBy: _sortedBy,
  }: {
    sortOrder: string
    sortedBy: string
  }) => {
    setVariables({
      ...variableState,
      sortOrder: _sortOrder,
      sortedBy: _sortedBy,
    })
    refetch({
      ...variableState,
      page: 1,
      organizationId: isSalesAdmin ? null : organizationId,
      sortOrder: _sortOrder,
      sortedBy: _sortedBy,
    })
  }

  const lineActions = isAdmin
    ? null
    : [
        {
          label: () => formatMessage(storeMessages.impersonate),
          onClick: ({ rowData }: CellRendererProps) =>
            handleImpersonation(rowData),
        },
      ]

  const { page, pageSize, search, sortedBy, sortOrder } = variableState
  const { total } = data?.getUsersPaginated?.pagination ?? 0
  const toolbar = {
    inputSearch: {
      value: search,
      placeholder: formatMessage(
        isAdmin
          ? adminMessages.searchPlaceholder
          : storeMessages.searchPlaceholder
      ),
      onChange: handleInputSearchChange,
      onClear: handleInputSearchClear,
      onSubmit: handleInputSearchSubmit,
    },
    newLine: {
      label: formatMessage(isAdmin ? adminMessages.new : storeMessages.new),
      handleCallback: () => setAddUserModalOpen(true),
      disabled: !canEdit && !canEditSales,
    },
  }

  const pagination = {
    onNextClick: handleNextClick,
    onPrevClick: handlePrevClick,
    onRowsChange: handleRowsChange,
    currentItemFrom: (page - 1) * pageSize + 1,
    currentItemTo: total < page * pageSize ? total : page * pageSize,
    textShowRows: formatMessage(
      isAdmin ? adminMessages.showRows : storeMessages.showRows
    ),
    textOf: formatMessage(isAdmin ? adminMessages.of : storeMessages.of),
    totalItems: total ?? 0,
    rowsOptions: [25, 50, 100],
  }

  return (
    <Fragment>
      <Table
        fullWidth
        schema={getSchema()}
        items={usersState}
        loading={loading || addUserLoading || updateUserLoading}
        emptyStateLabel={formatMessage(
          isAdmin ? adminMessages.usersEmptyState : storeMessages.emptyState
        )}
        lineActions={lineActions}
        sort={{
          sortedBy,
          sortOrder,
        }}
        pagination={pagination}
        toolbar={toolbar}
        onSort={handleSort}
        onRowClick={handleRowClick}
      />
      {addUserModalOpen && (
        <NewUserModal
          handleAddNewUser={handleAddUser}
          handleCloseModal={handleCloseAddUserModal}
          loading={addUserLoading}
          isOpen={addUserModalOpen}
          organizationId={organizationId}
          isAdmin={isAdmin}
          canEdit={canEdit}
          canEditSales={canEditSales}
          isSalesAdmin={isSalesAdmin}
          canManageOrg={canManageOrganization}
        />
      )}
      {editUserModalOpen && (
        <EditUserModal
          handleUpdateUser={handleUpdateUser}
          handleCloseModal={handleCloseUpdateUserModal}
          handleRemoveUser={handleShowRemoveUserModal}
          loading={updateUserLoading}
          isOpen={editUserModalOpen}
          organizationId={editUserDetails.orgId}
          user={editUserDetails}
          isAdmin={isAdmin}
          canEdit={canEdit}
          canEditSales={canEditSales}
          isSalesAdmin={isSalesAdmin}
          canManageOrg={canManageOrganization}
        />
      )}
      <RemoveUserModal
        handleRemoveUser={handleRemoveUser}
        handleCloseModal={handleCloseRemoveUserModal}
        loading={removeUserLoading}
        isOpen={removeUserModalOpen}
        user={editUserDetails}
        isAdmin={isAdmin}
      />
    </Fragment>
  )
}

export default OrganizationUsersTable
