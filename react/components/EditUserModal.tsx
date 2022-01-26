import React, { useState, useEffect } from 'react'
import type { FunctionComponent } from 'react'
import { Modal, Input, Button, Dropdown } from 'vtex.styleguide'
import { defineMessages, useIntl, FormattedMessage } from 'react-intl'
import { useQuery } from 'react-apollo'

import GET_ROLES from '../graphql/getRoles.graphql'
import GET_COST_CENTERS from '../graphql/getCostCentersByOrganizationIdStorefront.graphql'

interface Props {
  loading: boolean
  isOpen: boolean
  user: UserDetails
  handleUpdateUser: (user: UserDetails) => void
  handleRemoveUser: () => void
  handleCloseModal: () => void
  organizationId: string
}

interface DropdownOption {
  value: string
  label: string
}

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  save: {
    id: `${storePrefix}organization-details.button.save`,
  },
  cancel: {
    id: `${storePrefix}organization-details.button.cancel`,
  },
  remove: {
    id: `${storePrefix}organization-details.button.remove-user`,
  },
  email: {
    id: `${storePrefix}user-details.email`,
  },
  costCenter: {
    id: `${storePrefix}user-details.placeholder-costCenter`,
  },
  role: {
    id: `${storePrefix}user-details.placeholder-role`,
  },
})

const EditUserModal: FunctionComponent<Props> = ({
  loading,
  isOpen,
  user,
  handleUpdateUser,
  handleRemoveUser,
  handleCloseModal,
  organizationId,
}) => {
  const { formatMessage } = useIntl()
  const [userState, setUserState] = useState({} as UserDetails)
  const [costCenterOptions, setCostCenterOptions] = useState(
    [] as DropdownOption[]
  )

  const [roleOptions, setRoleOptions] = useState([] as DropdownOption[])

  const { data: rolesData } = useQuery(GET_ROLES, {
    ssr: false,
  })

  const { data: costCentersData } = useQuery(GET_COST_CENTERS, {
    variables: { id: organizationId, pageSize: 100 },
    ssr: false,
  })

  useEffect(() => {
    if (
      !costCentersData?.getCostCentersByOrganizationIdStorefront?.data?.length
    ) {
      return
    }

    const options = costCentersData.getCostCentersByOrganizationIdStorefront.data.map(
      (costCenter: any) => {
        return { label: costCenter.name, value: costCenter.id }
      }
    )

    setCostCenterOptions(options)
  }, [costCentersData])

  useEffect(() => {
    if (!rolesData?.listRoles?.length) {
      return
    }

    const filteredArray = rolesData.listRoles.filter((role: any) =>
      role.slug.includes('customer')
    )

    const options = filteredArray.map((role: any) => {
      return { label: role.name, value: role.id }
    })

    setRoleOptions(options)
  }, [rolesData])

  useEffect(() => {
    if (!user?.id) return

    setUserState(user)
  }, [user])

  if (!costCenterOptions?.length || !roleOptions?.length) return null

  return (
    <Modal
      centered
      bottomBar={
        <div className="nowrap">
          <span className="mr4">
            <Button
              variation="tertiary"
              onClick={() => handleCloseModal()}
              disabled={loading}
            >
              {formatMessage(messages.cancel)}
            </Button>
          </span>
          <span className="mr4">
            <Button
              variation="danger"
              onClick={() => handleRemoveUser()}
              disabled={loading}
            >
              {formatMessage(messages.remove)}
            </Button>
          </span>
          <span>
            <Button
              variation="primary"
              onClick={() => handleUpdateUser(userState)}
              isLoading={loading}
              disabled={
                !userState.orgId || !userState.costId || !userState.roleId
              }
            >
              {formatMessage(messages.save)}
            </Button>
          </span>
        </div>
      }
      isOpen={isOpen}
      onClose={() => handleCloseModal()}
      closeOnOverlayClick={false}
    >
      <p className="f3 f1-ns fw3 gray">
        <FormattedMessage id="store/b2b-organizations.organization-details.edit-user" />
      </p>
      <div className="w-100 mv6">
        <Input
          size="large"
          label={formatMessage(messages.email)}
          value={userState.email}
          disabled
        />
      </div>
      <div className="w-100 mv6">
        <Dropdown
          label={
            <h4 className="t-heading-5 mb0 pt3">
              <FormattedMessage id="store/b2b-organizations.user-details.costCenter" />
            </h4>
          }
          placeholder={formatMessage(messages.costCenter)}
          options={costCenterOptions}
          value={userState.costId}
          onChange={(_: any, v: string) =>
            setUserState({ ...userState, costId: v })
          }
        />
      </div>
      <div className="w-100 mv6">
        <Dropdown
          label={
            <h4 className="t-heading-5 mb0 pt3">
              <FormattedMessage id="store/b2b-organizations.user-details.role" />
            </h4>
          }
          placeholder={formatMessage(messages.role)}
          options={roleOptions}
          value={userState.roleId}
          onChange={(_: any, v: string) =>
            setUserState({ ...userState, roleId: v })
          }
        />
      </div>
    </Modal>
  )
}

export default EditUserModal
