import React, { Fragment, useState, useEffect, useContext } from 'react'
import type { FunctionComponent } from 'react'
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
import IMPERSONATE_USER from '../graphql/impersonateUser.graphql'
import { B2B_CHECKOUT_SESSION_KEY } from '../utils/constants'

interface Props {
  organizationId: string
  permissions: string[]
  refetchCostCenters: boolean
  isAdmin?: boolean
}

interface CellRendererProps {
  cellData: unknown
  rowData: B2BUserSimple
  updateCellMeasurements: () => void
}

interface B2BUserSimple extends UserDetails {
  costCenterName: string
  role: RoleSimple
}

interface RoleSimple {
  name: string
  slug: string
}

const compareUsers = (a: B2BUserSimple, b: B2BUserSimple) => {
  if (a.email < b.email) {
    return -1
  }

  if (a.email > b.email) {
    return 1
  }

  return 0
}

const OrganizationUsersTable: FunctionComponent<Props> = ({
  organizationId,
  permissions,
  refetchCostCenters,
  isAdmin = false,
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

  const contextualToast = (message: string, type: 'success' | 'error') => {
    if (isAdmin && toast) {
      toast({ type, message })
    } else {
      showToast(message)
    }
  }

  const canEdit = isAdmin || permissions.includes('add-users-organization')
  const canEditSales = isAdmin || permissions.includes('add-sales-users-all')
  const canImpersonateAll = permissions.includes('impersonate-users-all')
  const canImpersonateOrg = permissions.includes(
    'impersonate-users-organization'
  )

  const canImpersonateCost = permissions.includes(
    'impersonate-users-costcenter'
  )

  const { data, loading, refetch } = useQuery(GET_USERS, {
    variables: { organizationId },
    fetchPolicy: 'network-only',
    ssr: false,
    skip: !organizationId,
  })

  const { data: costCenterData } = useQuery(GET_COST_CENTER, {
    ssr: false,
    skip: isAdmin,
  })

  const [addUser] = useMutation(ADD_USER)
  const [updateUser] = useMutation(UPDATE_USER)
  const [removeUser] = useMutation(REMOVE_USER)
  const [impersonateUser] = useMutation(IMPERSONATE_USER)

  useEffect(() => {
    if (!data?.getUsers?.length) return

    const users = data.getUsers.sort(compareUsers)

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
              'error'
            )
          } else {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastAddUserSuccess
                  : storeMessages.toastAddUserSuccess
              ),
              'success'
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
          'error'
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
              'error'
            )
          } else {
            contextualToast(
              formatMessage(
                isAdmin
                  ? adminMessages.toastUpdateUserSuccess
                  : storeMessages.toastUpdateUserSuccess
              ),
              'success'
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
          'error'
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
          'success'
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
          'error'
        )
        setRemoveUserLoading(false)
      })
  }

  const handleImpersonation = (rowData: B2BUserSimple) => {
    if (
      (!canImpersonateAll && !canImpersonateOrg && !canImpersonateCost) ||
      rowData.role.slug.includes('sales')
    ) {
      showToast(formatMessage(storeMessages.toastImpersonateForbidden))

      return
    }

    if (
      !canImpersonateAll &&
      canImpersonateOrg &&
      rowData.role.slug.includes('admin')
    ) {
      showToast(formatMessage(storeMessages.toastImpersonateForbidden))

      return
    }

    if (
      !canImpersonateAll &&
      !canImpersonateOrg &&
      canImpersonateCost &&
      rowData.costId !== costCenterData?.getCostCenterByIdStorefront?.id
    ) {
      showToast(formatMessage(storeMessages.toastImpersonateForbidden))

      return
    }

    showToast(formatMessage(storeMessages.toastImpersonateStarting))

    if (sessionStorage.getItem(B2B_CHECKOUT_SESSION_KEY)) {
      sessionStorage.removeItem(B2B_CHECKOUT_SESSION_KEY)
    }

    impersonateUser({
      variables: { clId: rowData.clId, userId: rowData.userId },
    })
      .then(result => {
        if (result?.data?.impersonateUser?.status === 'error') {
          console.error(
            'Impersonation error:',
            result.data.impersonateUser.message
          )
          if (
            result.data.impersonateUser.message === 'userId not found in CL'
          ) {
            showToast(formatMessage(storeMessages.toastImpersonateIdMissing))
          } else {
            showToast(formatMessage(storeMessages.toastImpersonateFailure))
          }
        } else {
          window.location.reload()
        }
      })
      .catch(error => {
        console.error(error)
        showToast(formatMessage(storeMessages.toastImpersonateFailure))
      })
  }

  const getSchema = () => ({
    properties: {
      email: {
        title: formatMessage(
          isAdmin ? adminMessages.columnEmail : storeMessages.columnEmail
        ),
        cellRenderer: ({ rowData: { email, role } }: CellRendererProps) => (
          <span
            className={
              (!canEdit && !canEditSales) ||
              (canEdit && !canEditSales && role.slug.indexOf('sales') > -1)
                ? 'c-disabled'
                : ''
            }
          >
            {email}
          </span>
        ),
      },
      roleId: {
        title: formatMessage(
          isAdmin ? adminMessages.columnRole : storeMessages.columnRole
        ),
        cellRenderer: ({ rowData: { role } }: CellRendererProps) => (
          <span
            className={
              (!canEdit && !canEditSales) ||
              (canEdit && !canEditSales && role.slug.indexOf('sales') > -1)
                ? 'c-disabled'
                : ''
            }
          >
            {role.name ?? ''}
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
          <span
            className={
              (!canEdit && !canEditSales) ||
              (canEdit && !canEditSales && role.slug.indexOf('sales') > -1)
                ? 'c-disabled'
                : ''
            }
          >
            {costCenterName}
          </span>
        ),
      },
    },
  })

  const lineActions = isAdmin
    ? null
    : [
        {
          label: () => formatMessage(storeMessages.impersonate),
          onClick: ({ rowData }: CellRendererProps) =>
            handleImpersonation(rowData),
        },
      ]

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
        onRowClick={({ rowData }: CellRendererProps) => {
          if (
            !rowData ||
            (!canEdit && !canEditSales) ||
            (canEdit &&
              !canEditSales &&
              rowData.role.slug.indexOf('sales') > -1)
          )
            return

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
        }}
        toolbar={{
          newLine: {
            label: formatMessage(
              isAdmin ? adminMessages.new : storeMessages.new
            ),
            handleCallback: () => setAddUserModalOpen(true),
            disabled: !canEdit,
          },
        }}
      />
      {refetchCostCenters ? null : (
        <NewUserModal
          handleAddNewUser={handleAddUser}
          handleCloseModal={handleCloseAddUserModal}
          loading={addUserLoading}
          isOpen={addUserModalOpen}
          organizationId={organizationId}
          isAdmin={isAdmin}
        />
      )}
      {refetchCostCenters ? null : (
        <EditUserModal
          handleUpdateUser={handleUpdateUser}
          handleCloseModal={handleCloseUpdateUserModal}
          handleRemoveUser={handleShowRemoveUserModal}
          loading={updateUserLoading}
          isOpen={editUserModalOpen}
          organizationId={organizationId}
          user={editUserDetails}
          isAdmin={isAdmin}
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
