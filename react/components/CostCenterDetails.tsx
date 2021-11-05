import type { FunctionComponent } from 'react'
import React, { useEffect, useState, useContext } from 'react'
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
  ToastContext,
} from 'vtex.styleguide'
import { useIntl, FormattedMessage, defineMessages } from 'react-intl'
import { useRuntime } from 'vtex.render-runtime'
import { AddressRules, AddressSummary } from 'vtex.address-form'

import storageFactory from '../utils/storage'
import { useSessionResponse } from '../modules/session'
import NewAddressModal from './NewAddressModal'
import EditAddressModal from './EditAddressModal'
import DeleteAddressModal from './DeleteAddressModal'
import DeleteCostCenterModal from './DeleteCostCenterModal'
import GET_COST_CENTER from '../graphql/getCostCenterStorefront.graphql'
import UPDATE_COST_CENTER from '../graphql/updateCostCenter.graphql'
import DELETE_COST_CENTER from '../graphql/deleteCostCenter.graphql'

const localStore = storageFactory(() => localStorage)
let isAuthenticated =
  JSON.parse(String(localStore.getItem('orderquote_isAuthenticated'))) ?? false

const storePrefix = 'store/b2b-organizations.'

const messages = defineMessages({
  toastUpdateSuccess: {
    id: `${storePrefix}costCenter-details.toast.update-success`,
  },
  toastUpdateFailure: {
    id: `${storePrefix}costCenter-details.toast.update-failure`,
  },
  toastDeleteFailure: {
    id: `${storePrefix}costCenter-details.toast.delete-failure`,
  },
  addressEdit: {
    id: `${storePrefix}costCenter-details.address.edit`,
  },
  addressDelete: {
    id: `${storePrefix}costCenter-details.address.delete`,
  },
  pageTitle: {
    id: `${storePrefix}costCenter-details.title`,
  },
  back: {
    id: `${storePrefix}back`,
  },
  costCenterName: {
    id: `${storePrefix}costCenter-details.costCenter-name`,
  },
  addresses: {
    id: `${storePrefix}costCenter-details.addresses`,
  },
})

const CostCenterDetails: FunctionComponent = () => {
  const { formatMessage } = useIntl()

  const {
    route: { params },
    navigate,
  } = useRuntime()

  const sessionResponse: any = useSessionResponse()

  if (sessionResponse) {
    isAuthenticated =
      sessionResponse?.namespaces?.profile?.isAuthenticated?.value === 'true'

    localStore.setItem(
      'orderquote_isAuthenticated',
      JSON.stringify(isAuthenticated)
    )
  }

  const { showToast } = useContext(ToastContext)

  const toastMessage = (message: MessageDescriptor) => {
    const translatedMessage = formatMessage(message)

    const action = undefined

    showToast({ message: translatedMessage, duration: 5000, action })
  }

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

  const { data, loading, refetch } = useQuery(GET_COST_CENTER, {
    variables: { id: params?.id },
    skip: !params?.id,
    ssr: false,
  })

  const [updateCostCenter] = useMutation(UPDATE_COST_CENTER)
  const [deleteCostCenter] = useMutation(DELETE_COST_CENTER)

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
        toastMessage(messages.toastUpdateSuccess)
        refetch()
        setLoadingState(false)
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastUpdateFailure)
        setLoadingState(false)
      })
  }

  const handleDeleteCostCenter = () => {
    setLoadingState(true)
    deleteCostCenter({ variables: { id: params?.id } })
      .then(() => {
        navigate({
          page: 'store.organization-details',
          params: { id: data.getCostCenterById.organization },
        })
      })
      .catch(error => {
        console.error(error)
        toastMessage(messages.toastDeleteFailure)
        setLoadingState(false)
      })
  }

  const handleCloseModals = () => {
    setDeleteAddressModalState({ addressId: '', isOpen: false })
    setEditAddressModalState({ addressId: '', isOpen: false })
    setNewAddressModalState({ isOpen: false })
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
    setEditAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteAddressModal = (addressId: string) => {
    setDeleteAddressModalState({ addressId, isOpen: true })
  }

  const handleDeleteCostCenterModal = () => {
    setDeleteCostCenterModalState({ isOpen: true })
  }

  const handleAddNewAddress = (address: AddressFormFields) => {
    const newAddress = {
      addressId: address.addressId.value,
      addressType: address.addressType.value,
      city: address.city.value,
      complement: address.complement.value,
      country: address.country.value,
      receiverName: address.receiverName.value,
      geoCoordinates: address.geoCoordinates.value,
      neighborhood: address.neighborhood.value,
      number: address.number.value,
      postalCode: address.postalCode.value,
      reference: address.reference.value,
      state: address.state.value,
      street: address.street.value,
      addressQuery: address.addressQuery.value,
    } as Address

    setAddresses([...addresses, newAddress])
    handleCloseModals()
  }

  const handleEditAddress = (modifiedAddress: AddressFormFields) => {
    const { addressId } = editAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addressArray[addressIndex] = {
      addressId: modifiedAddress.addressId.value,
      addressType: modifiedAddress.addressType.value,
      city: modifiedAddress.city.value,
      complement: modifiedAddress.complement.value,
      country: modifiedAddress.country.value,
      receiverName: modifiedAddress.receiverName.value,
      geoCoordinates: modifiedAddress.geoCoordinates.value,
      neighborhood: modifiedAddress.neighborhood.value,
      number: modifiedAddress.number.value,
      postalCode: modifiedAddress.postalCode.value,
      reference: modifiedAddress.reference.value,
      state: modifiedAddress.state.value,
      street: modifiedAddress.street.value,
      addressQuery: modifiedAddress.addressQuery.value,
    } as Address

    setAddresses(addressArray)
    handleCloseModals()
  }

  const handleDeleteAddress = () => {
    const { addressId } = deleteAddressModalState
    const addressArray = addresses

    const addressIndex = addresses.findIndex(
      address => address.addressId === addressId
    )

    addresses.splice(addressIndex, 1)
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

  if (!isAuthenticated) {
    return (
      <Layout
        fullWidth
        pageHeader={
          <PageHeader
            title={formatMessage(messages.pageTitle)}
            linkLabel={formatMessage(messages.back)}
            onLinkClick={() => {
              navigate({
                page: 'store.organization-details',
              })
            }}
          />
        }
      >
        <PageBlock>
          <FormattedMessage id="store/b2b-organizations.not-authenticated" />
        </PageBlock>
      </Layout>
    )
  }

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
                page: 'store.organization-details',
              })
            }}
          />
        }
      >
        <PageBlock>
          {loading ? (
            <Spinner />
          ) : (
            <FormattedMessage id="store/b2b-organizations.costCenter-details.empty-state" />
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
              page: 'store.organization-details',
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
              <FormattedMessage id="store/b2b-organizations.costCenter-details.button.save" />
            </Button>
          </span>
          <Button
            variation="danger"
            isLoading={loadingState}
            onClick={() => handleDeleteCostCenterModal()}
          >
            <FormattedMessage id="store/b2b-organizations.costCenter-details.button.delete" />
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
                  <FormattedMessage id="store/b2b-organizations.costCenter-details.address.new" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageBlock>

      <NewAddressModal
        isOpen={newAddressModalState.isOpen}
        loading={loadingState}
        handleAddNewAddress={handleAddNewAddress}
        handleCloseModals={handleCloseModals}
      />

      <EditAddressModal
        isOpen={editAddressModalState.isOpen}
        loading={loadingState}
        handleEditAddress={handleEditAddress}
        handleCloseModals={handleCloseModals}
      />

      <DeleteAddressModal
        isOpen={deleteAddressModalState.isOpen}
        loading={loadingState}
        handleDeleteAddress={handleDeleteAddress}
        handleCloseModals={handleCloseModals}
      />

      <DeleteCostCenterModal
        isOpen={deleteCostCenterModalState.isOpen}
        loading={loadingState}
        handleDeleteCostCenter={handleDeleteCostCenter}
        handleCloseModals={handleCloseModals}
      />
    </Layout>
  )
}

export default CostCenterDetails
