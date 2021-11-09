import React, { Fragment, useState, useEffect, useContext } from 'react'
import type { FunctionComponent } from 'react'
import { useIntl, defineMessages } from 'react-intl'
import { Table, ToastContext } from 'vtex.styleguide'
import { useQuery, useMutation } from 'react-apollo'

import NewUserModal from './NewUserModal'
import EditUserModal from './EditUserModal'
import GET_USERS from '../graphql/getUsers.graphql'
import SAVE_USER from '../graphql/saveUser.graphql'
import REMOVE_USER from '../graphql/removeUser.graphql'
import RemoveUserModal from './RemoveUserModal'

interface Props {
  organizationId: string
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
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
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
  new: {
    id: `${storePrefix}organization-details.button.new`,
  },
})

const OrganizationUsersTable: FunctionComponent<Props> = ({
  organizationId,
}) => {
  const { formatMessage } = useIntl()
  const { showToast } = useContext(ToastContext)
  const [addUserLoading, setAddUserLoading] = useState(false)
  const [updateUserLoading, setUpdateUserLoading] = useState(false)
  const [removeUserLoading, setRemoveUserLoading] = useState(false)
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editUserDetails, setEditUserDetails] = useState({} as UserDetails)
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false)
  const [usersState, setUsersState] = useState([])

  const { data, refetch } = useQuery(GET_USERS, {
    variables: { organizationId },
    ssr: false,
    skip: !organizationId,
  })

  const [saveUser] = useMutation(SAVE_USER)
  const [removeUser] = useMutation(REMOVE_USER)

  useEffect(() => {
    if (!data?.getUsers?.length) return

    setUsersState(data.getUsers)
  }, [data])

  const handleAddUser = (user: UserInput) => {
    setAddUserLoading(true)
    saveUser({ variables: user })
      .then(() => {
        setAddUserModalOpen(false)
        showToast(formatMessage(messages.toastAddSuccess))
        setAddUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        showToast(formatMessage(messages.toastAddFailure))
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
        showToast(formatMessage(messages.toastUpdateSuccess))
        setUpdateUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        showToast(formatMessage(messages.toastUpdateFailure))
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
        showToast(formatMessage(messages.toastRemoveSuccess))
        setRemoveUserLoading(false)
        refetch()
      })
      .catch(error => {
        console.error(error)
        showToast(formatMessage(messages.toastRemoveFailure))
        setRemoveUserLoading(false)
      })
  }

  const getSchema = () => ({
    properties: {
      email: {
        title: formatMessage(messages.columnEmail),
      },
      roleId: {
        title: formatMessage(messages.columnRole),
        cellRenderer: ({ rowData: { role } }: CellRendererProps) => (
          <span>{role?.name ?? ''}</span>
        ),
      },
      costCenterName: {
        title: formatMessage(messages.columnCostCenter),
      },
    },
  })

  return (
    <Fragment>
      <Table
        fullWidth
        schema={getSchema()}
        items={usersState}
        emptyStateLabel={formatMessage(messages.emptyState)}
        onRowClick={({ rowData }: CellRendererProps) => {
          if (!rowData) return

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
            label: formatMessage(messages.new),
            handleCallback: () => setAddUserModalOpen(true),
          },
        }}
      />
      <NewUserModal
        handleAddNewUser={handleAddUser}
        handleCloseModal={handleCloseAddUserModal}
        loading={addUserLoading}
        isOpen={addUserModalOpen}
        organizationId={organizationId}
      />
      <EditUserModal
        handleUpdateUser={handleUpdateUser}
        handleCloseModal={handleCloseUpdateUserModal}
        handleRemoveUser={handleShowRemoveUserModal}
        loading={updateUserLoading}
        isOpen={editUserModalOpen}
        organizationId={organizationId}
        user={editUserDetails}
      />
      <RemoveUserModal
        handleRemoveUser={handleRemoveUser}
        handleCloseModal={handleCloseRemoveUserModal}
        loading={removeUserLoading}
        isOpen={removeUserModalOpen}
        user={editUserDetails}
      />
    </Fragment>
  )
}

export default OrganizationUsersTable
