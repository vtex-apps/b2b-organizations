import React, { Fragment, useState, useEffect, useContext } from 'react'
import type { FunctionComponent } from 'react'
import { useIntl, defineMessages } from 'react-intl'
import { Table, ToastContext } from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useQuery, useMutation } from 'react-apollo'

import NewUserModal from './NewUserModal'
import EditUserModal from './EditUserModal'
import RemoveUserModal from './RemoveUserModal'
import GET_USERS from '../graphql/getUsers.graphql'
import SAVE_USER from '../graphql/saveUser.graphql'
import REMOVE_USER from '../graphql/removeUser.graphql'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'
import IMPERSONATE_USER from '../graphql/impersonateUser.graphql'

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

const storePrefix = 'store/b2b-organizations.'
const adminPrefix = 'admin/b2b-organizations.'

const storeMessages = defineMessages({
  columnEmail: {
    id: `${storePrefix}organization-users.column.email`,
  },
  columnRole: {
    id: `${storePrefix}organization-users.column.role`,
  },
  columnCostCenter: {
    id: `${storePrefix}organization-users.column.costCenter`,
  },
  emptyState: {
    id: `${storePrefix}organization-users.emptyState`,
  },
  toastAddSuccess: {
    id: `${storePrefix}organization-users.toast.add-success`,
  },
  toastAddFailure: {
    id: `${storePrefix}organization-users.toast.add-failure`,
  },
  toastUpdateSuccess: {
    id: `${storePrefix}organization-users.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${storePrefix}organization-users.toast.update-failure`,
  },
  toastRemoveSuccess: {
    id: `${storePrefix}organization-users.toast.remove-success`,
  },
  toastRemoveFailure: {
    id: `${storePrefix}organization-users.toast.remove-failure`,
  },
  toastImpersonateStarting: {
    id: `${storePrefix}organization-users.toast.impersonate-starting`,
  },
  toastImpersonateSuccess: {
    id: `${storePrefix}organization-users.toast.impersonate-success`,
  },
  toastImpersonateFailure: {
    id: `${storePrefix}organization-users.toast.impersonate-failure`,
  },
  toastImpersonateForbidden: {
    id: `${storePrefix}organization-users.toast.impersonate-forbidden`,
  },
  toastImpersonateIdMissing: {
    id: `${storePrefix}organization-users.toast.impersonate-id-missing`,
  },
  new: {
    id: `${storePrefix}organization-details.button.new`,
  },
  impersonate: {
    id: `${storePrefix}organization-users.impersonate`,
  },
})

const adminMessages = defineMessages({
  columnEmail: {
    id: `${adminPrefix}organization-users.column.email`,
  },
  columnRole: {
    id: `${adminPrefix}organization-users.column.role`,
  },
  columnCostCenter: {
    id: `${adminPrefix}organization-users.column.costCenter`,
  },
  emptyState: {
    id: `${adminPrefix}organization-users.emptyState`,
  },
  toastAddSuccess: {
    id: `${adminPrefix}organization-users.toast.add-success`,
  },
  toastAddFailure: {
    id: `${adminPrefix}organization-users.toast.add-failure`,
  },
  toastUpdateSuccess: {
    id: `${adminPrefix}organization-users.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}organization-users.toast.update-failure`,
  },
  toastRemoveSuccess: {
    id: `${adminPrefix}organization-users.toast.remove-success`,
  },
  toastRemoveFailure: {
    id: `${adminPrefix}organization-users.toast.remove-failure`,
  },
  new: {
    id: `${adminPrefix}organization-details.button.new`,
  },
})

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
    ssr: false,
    skip: !organizationId,
  })

  const { data: costCenterData } = useQuery(GET_COST_CENTER, {
    ssr: false,
    skip: isAdmin,
  })

  const [saveUser] = useMutation(SAVE_USER)
  const [removeUser] = useMutation(REMOVE_USER)
  const [impersonateUser] = useMutation(IMPERSONATE_USER)

  useEffect(() => {
    if (!data?.getUsers?.length) return

    const users = data.getUsers.sort(compareUsers)

    setUsersState(users)
  }, [data])

  const handleAddUser = (user: UserInput) => {
    setAddUserLoading(true)
    saveUser({ variables: user })
      .then(() => {
        setAddUserModalOpen(false)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastAddSuccess
              : storeMessages.toastAddSuccess
          ),
          'success'
        )
        setAddUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastAddFailure
              : storeMessages.toastAddFailure
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
    saveUser({ variables: user })
      .then(() => {
        setEditUserModalOpen(false)
        setEditUserDetails({} as UserDetails)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastUpdateSuccess
              : storeMessages.toastUpdateSuccess
          ),
          'success'
        )
        setUpdateUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        contextualToast(
          formatMessage(
            isAdmin
              ? adminMessages.toastUpdateFailure
              : storeMessages.toastUpdateFailure
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
              ? adminMessages.toastRemoveSuccess
              : storeMessages.toastRemoveSuccess
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
              ? adminMessages.toastRemoveFailure
              : storeMessages.toastRemoveFailure
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

    if (!rowData.userId) {
      showToast(formatMessage(storeMessages.toastImpersonateIdMissing))

      return
    }

    showToast(formatMessage(storeMessages.toastImpersonateStarting))

    impersonateUser({
      variables: { clId: rowData.clId, userId: rowData.userId },
    })
      .then(() => {
        window.location.reload()
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
        loading={loading}
        emptyStateLabel={formatMessage(
          isAdmin ? adminMessages.emptyState : storeMessages.emptyState
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
