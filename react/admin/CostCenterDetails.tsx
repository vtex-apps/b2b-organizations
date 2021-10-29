import type { FunctionComponent } from 'react'
import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import {
  Layout,
  PageHeader,
  PageBlock,
  Card,
  ActionMenu,
  IconOptionsDots,
  Button,
  Spinner,
  Input,
  ModalDialog,
} from 'vtex.styleguide'
import { useToast } from '@vtex/admin-ui'
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import {
  AddressRules,
  AddressSummary,
  AddressForm,
  AddressContainer,
  CountrySelector,
  PostalCodeGetter,
} from 'vtex.address-form'
import { StyleguideInput } from 'vtex.address-form/inputs'
import { addValidation } from 'vtex.address-form/helpers'

import { getEmptyAddress, isValidAddress } from '../utils/addresses'
import GET_COST_CENTER from '../graphql/getCostCenter.graphql'
import UPDATE_COST_CENTER from '../graphql/updateCostCenter.graphql'
import DELETE_COST_CENTER from '../graphql/deleteCostCenter.graphql'
import GET_LOGISTICS from '../graphql/getLogistics.graphql'

const adminPrefix = 'admin/b2b-organizations.'

const messages = defineMessages({
  toastUpdateSuccess: {
    id: `${adminPrefix}costCenter-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${adminPrefix}costCenter-details.toast.update-failure`,
  },
  toastDeleteFailure: {
    id: `${adminPrefix}costCenter-details.toast.delete-failure`,
  },
  addressEdit: {
    id: `${adminPrefix}costCenter-details.address.edit`,
  },
  addressDelete: {
    id: `${adminPrefix}costCenter-details.address.delete`,
  },
  pageTitle: {
    id: `${adminPrefix}costCenter-details.title`,
  },
  back: {
    id: `${adminPrefix}back`,
  },
  costCenterName: {
    id: `${adminPrefix}costCenter-details.costCenter-name`,
  },
  addresses: {
    id: `${adminPrefix}costCenter-details.addresses`,
  },
  add: {
    id: `${adminPrefix}costCenter-details.button.add`,
  },
  cancel: {
    id: `${adminPrefix}costCenter-details.button.cancel`,
  },
  update: {
    id: `${adminPrefix}costCenter-details.button.update`,
  },
  deleteConfirm: {
    id: `${adminPrefix}costCenter-details.button.delete-confirm`,
  },
})

const CostCenterDetails: FunctionComponent = () => {
  const { formatMessage } = useIntl()

  const {
    culture: { country },
    route: { params },
    navigate,
  } = useRuntime()

  const showToast = useToast()

  const [loadingState, setLoadingState] = useState(false)
  const [costCenterName, setCostCenterName] = useState('')
  const [addresses, setAddresses] = useState([] as Address[])
  const [newAddressModalState, setNewAddressModalState] = useState({
    isOpen: false,
  })

  const [editAddressModalState, setEditAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [deleteAddressModalState, setDeleteAddressModalState] = useState({
    addressId: '',
    isOpen: false,
  })

  const [deleteCostCenterModalState, setDeleteCostCenterModalState] = useState({
    isOpen: false,
  })

  const [newAddressState, setNewAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const [editAddressState, setEditAddressState] = useState(() =>
    addValidation(getEmptyAddress(country))
  )

  const { data, loading, refetch } = useQuery(GET_COST_CENTER, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const { data: logisticsData } = useQuery(GET_LOGISTICS, { ssr: false })

  const [updateCostCenter] = useMutation(UPDATE_COST_CENTER)
  const [deleteCostCenter] = useMutation(DELETE_COST_CENTER)

  const translateCountries = () => {
    const { shipsTo = [] } = logisticsData?.logistics ?? {}

    return shipsTo.map((code: string) => ({
      label: formatMessage({ id: `country.${code}` }),
      value: code,
    }))
  }

  useEffect(() => {
    if (addresses.length || !data?.getCostCenterById?.addresses?.length) return

    setCostCenterName(data.getCostCenterById.name)
    setAddresses(data.getCostCenterById.addresses)
  }, [data])

  const handleUpdateCostCenter = () => {
    setLoadingState(true)
    const variables = {
      id: params.id,
      input: {
        name: costCenterName,
        addresses,
      },
    }

    updateCostCenter({ variables })
      .then(() => {
        showToast({
          type: 'success',
          message: formatMessage(messages.toastUpdateSuccess),
        })
        refetch()
        setLoadingState(false)
      })
      .catch(error => {
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastUpdateFailure),
        })
        setLoadingState(false)
      })
  }

  const handleDeleteCostCenter = () => {
    // add modal dialog
    setLoadingState(true)
    deleteCostCenter({ variables: { id: params?.id } })
      .then(() => {
        navigate({
          page: 'admin.app.b2b-organizations.organization-details',
          params: { id: data.getCostCenterById.organization },
        })
      })
      .catch(error => {
        console.error(error)
        showToast({
          type: 'error',
          message: formatMessage(messages.toastDeleteFailure),
        })
        setLoadingState(false)
      })
  }

  const handleCloseModals = () => {
    setDeleteAddressModalState({ addressId: '', isOpen: false })
    setEditAddressModalState({ addressId: '', isOpen: false })
    setEditAddressState(() => addValidation(getEmptyAddress(country)))
    setNewAddressModalState({ isOpen: false })
    setNewAddressState(() => addValidation(getEmptyAddress(country)))
    setDeleteCostCenterModalState({ isOpen: false })
  }

  const handleNewAddressModal = () => {
    setNewAddressModalState({ isOpen: true })
  }

  const handleEditAddressModal = (addressId: string) => {
    const editAddress = addresses.find(
      address => address.addressId === addressId
    )

    if (!editAddress) return

    setEditAddressState(() => addValidation(editAddress))
    setEditAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteAddressModal = (addressId: string) => {
    setDeleteAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteCostCenterModal = () => {
    setDeleteCostCenterModalState({ isOpen: true })
  }

  const handleNewAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = newAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setNewAddressState(newAddress)
  }

  const handleAddNewAddress = () => {
    const newAddress = {
      addressId: newAddressState.addressId.value,
      addressType: newAddressState.addressType.value,
      city: newAddressState.city.value,
      complement: newAddressState.complement.value,
      country: newAddressState.country.value,
      receiverName: newAddressState.receiverName.value,
      geoCoordinates: newAddressState.geoCoordinates.value,
      neighborhood: newAddressState.neighborhood.value,
      number: newAddressState.number.value,
      postalCode: newAddressState.postalCode.value,
      reference: newAddressState.reference.value,
      state: newAddressState.state.value,
      street: newAddressState.street.value,
      addressQuery: newAddressState.addressQuery.value,
    }

    setAddresses([...addresses, newAddress])
    handleCloseModals()
  }

  const handleEditAddressChange = (changedAddress: AddressFormFields) => {
    const curAddress = editAddressState

    const newAddress = { ...curAddress, ...changedAddress }

    setEditAddressState(newAddress)
  }

  const handleEditAddress = () => {
    const { addressId } = editAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addressArray[addressIndex] = {
      addressId: editAddressState.addressId.value,
      addressType: editAddressState.addressType.value,
      city: editAddressState.city.value,
      complement: editAddressState.complement.value,
      country: editAddressState.country.value,
      receiverName: editAddressState.receiverName.value,
      geoCoordinates: editAddressState.geoCoordinates.value,
      neighborhood: editAddressState.neighborhood.value,
      number: editAddressState.number.value,
      postalCode: editAddressState.postalCode.value,
      reference: editAddressState.reference.value,
      state: editAddressState.state.value,
      street: editAddressState.street.value,
      addressQuery: editAddressState.addressQuery.value,
    }

    setAddresses(addressArray)
    handleCloseModals()
  }

  const options = (addressId: string) => [
    {
      label: formatMessage(messages.addressEdit),
      onClick: () => handleEditAddressModal(addressId),
    },
    {
      label: formatMessage(messages.addressDelete),
      onClick: () => handleDeleteAddressModal(addressId),
    },
  ]

  if (!data) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.pageTitle)}
            linkLabel={formatMessage(messages.back)}
            onLinkClick={() => {
              navigate({
                page: 'admin.app.b2b-organizations.organizations',
              })
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.empty-state" />
          )}
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      fullWidth
      pageHeader={
        <PageHeader
          title={formatMessage(messages.pageTitle)}
          linkLabel={formatMessage(messages.back)}
          onLinkClick={() => {
            navigate({
              page: 'admin.app.b2b-organizations.organization-details',
              params: { id: data.getCostCenterById.organization },
            })
          }}
        >
          <span className="mr4">
            <Button
              variation="primary"
              isLoading={loadingState}
              disabled={!costCenterName || !addresses.length}
              onClick={() => handleUpdateCostCenter()}
            >
              <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.save" />
            </Button>
          </span>
          <Button
            variation="danger"
            isLoading={loadingState}
            onClick={() => handleDeleteCostCenterModal()}
          >
            <FormattedMessage id="admin/b2b-organizations.costCenter-details.button.delete" />
          </Button>
        </PageHeader>
      }
    >
      <PageBlock>
        <Input
          size="large"
          label={formatMessage(messages.costCenterName)}
          value={costCenterName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCostCenterName(e.target.value)
          }}
          required
        />
      </PageBlock>
      <PageBlock title={formatMessage(messages.addresses)}>
        <div className="flex">
          {addresses.map((address: any, index) => {
            return (
              <div key={index} className="w-25 ma3">
                <Card>
                  <div className="flex justify-between">
                    <div>
                      <AddressRules
                        shouldUseIOFetching
                        country={address.country}
                        useGeolocation={false}
                      >
                        <AddressSummary canEditData={false} address={address} />
                      </AddressRules>
                    </div>
                    <div>
                      <ActionMenu
                        buttonProps={{
                          variation: 'tertiary',
                          icon: <IconOptionsDots color="currentColor" />,
                        }}
                        options={options(address.addressId)}
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
          <div className="w-25 ma3">
            <Card>
              <div className="flex justify-center">
                <Button
                  variation="primary"
                  onClick={() => handleNewAddressModal()}
                >
                  <FormattedMessage id="admin/b2b-organizations.costCenter-details.address.new" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageBlock>

      {/* New Address Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleAddNewAddress(),
          label: formatMessage(messages.add),
          disabled: !isValidAddress(newAddressState),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={newAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <AddressRules
          country={newAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={newAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleNewAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
          </AddressContainer>
        </AddressRules>
      </ModalDialog>

      {/* Edit Address Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleEditAddress(),
          label: formatMessage(messages.update),
          disabled: !isValidAddress(editAddressState),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={editAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <AddressRules
          country={editAddressState?.country?.value}
          shouldUseIOFetching
          useGeolocation={false}
        >
          <AddressContainer
            address={editAddressState}
            Input={StyleguideInput}
            onChangeAddress={handleEditAddressChange}
            autoCompletePostalCode
          >
            <CountrySelector shipsTo={translateCountries()} />

            <PostalCodeGetter />

            <AddressForm
              Input={StyleguideInput}
              omitAutoCompletedFields={false}
              omitPostalCodeFields
            />
          </AddressContainer>
        </AddressRules>
      </ModalDialog>

      {/* Delete Address Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => {},
          label: formatMessage(messages.deleteConfirm),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={deleteAddressModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <p>
          <FormattedMessage id="admin/b2b-organizations.costCenter-details.delete-address-confirmation" />
        </p>
      </ModalDialog>

      {/* Delete Cost Center Modal */}
      <ModalDialog
        centered
        confirmation={{
          onClick: () => handleDeleteCostCenter(),
          label: formatMessage(messages.deleteConfirm),
        }}
        cancelation={{
          onClick: () => handleCloseModals(),
          label: formatMessage(messages.cancel),
        }}
        loading={loadingState}
        isOpen={deleteCostCenterModalState.isOpen}
        onClose={() => handleCloseModals()}
        closeOnOverlayClick={false}
      >
        <p>
          <FormattedMessage id="admin/b2b-organizations.costCenter-details.delete-costCenter-confirmation" />
        </p>
      </ModalDialog>
    </Layout>
  )
}

export default CostCenterDetails
